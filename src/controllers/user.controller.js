import User from '../models/user.model.js';
import Company from '../models/company.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../utils/handleJwt.js';
import { encrypt } from '../utils/handlePassword.js';
import { AppError } from '../utils/AppError.js';
import { compare } from '../utils/handlePassword.js';
import { notificationEmitter } from '../services/notification.service.js';
import e from 'express';
import { ca, id, th } from 'zod/v4/locales';

/**
 * Registrar nuevo usuario.
 */
export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el email ya está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                error: true,
                message: 'El email ya está registrado'
            });
        }

        // Cifrar contraseña
        const hashedPassword = await encrypt(password);
        
        // Generar código de verificación aleatorio de 6 dígitos
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Crear usuario
        const user = await User.create({
            email,
            password: hashedPassword,
            verificationCode,
            verificationAttempts: 3,
            role: 'admin',
            status: 'pending'
        });

        // Generar tokens
        const accessToken = generateAccessToken(user);
        const refreshTokenValue = generateRefreshToken();

        // Guardar refresh token en BD
        await RefreshToken.create({
            token: refreshTokenValue,
            user: user._id,
            expiresAt: getRefreshTokenExpiry(),
            createdByIp: req.ip
        });

        // Evento usuario registrado
        notificationEmitter.emit('user:registered', {
            email: user.email,
            code: user.verificationCode
        });

        // Devolver tokens y datos del usuario
        return res.status(201).json({
            message: 'Usuario registrado correctamente.',
            data: {
                email: user.email,
                status: user.status,
                role: user.role
            },
            accessToken,
            refreshToken: refreshTokenValue
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).json({
            error: true,
            message: 'Error al registrar usuario'
        });
    }
};

/**
 * Validar email del usuario
 */
export const validateUserEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      const err = AppError.notFound('Usuario no encontrado', 'USER_NOT_FOUND');
      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    if (user.status === 'verified') {
      const err = AppError.badRequest(
        'El usuario ya está verificado',
        'USER_ALREADY_VERIFIED'
      );
      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    if (user.verificationAttempts <= 0) {
      const err = AppError.tooManyRequests(
        'Has agotado los intentos de verificación',
        'NO_VERIFICATION_ATTEMPTS_LEFT'
      );
      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    if (user.verificationCode !== code) {
      user.verificationAttempts -= 1;
      await user.save();

      if (user.verificationAttempts <= 0) {
        const err = AppError.tooManyRequests(
          'Has agotado los intentos de verificación',
          'NO_VERIFICATION_ATTEMPTS_LEFT'
        );
        return res.status(err.statusCode).json({
          error: true,
          message: err.message,
          code: err.code
        });
      }

      const err = AppError.badRequest(
        `Código incorrecto. Intentos restantes: ${user.verificationAttempts}`,
        'INVALID_VERIFICATION_CODE'
      );
      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    user.status = 'verified';
    user.verificationCode = null;
    user.verificationAttempts = 0;
    
    await user.save();

    // Evento usuario verificado
    notificationEmitter.emit('user:verified', {
      email: user.email
    });

    return res.status(200).json({
      ok: true,
      message: 'Email validado correctamente'
    });
  } catch (error) {
    console.error(error);

    const err = AppError.internal('Error al validar el usuario');
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code
    });
  }
};

/**
 * Iniciar sesión de usuario.
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email incluyendo el campo de contraseña
    const user = await User.findOne({ email }).select('+password');

    // Verificar si el usuario existe 
    if (!user) {
      const err = AppError.unauthorized('Credenciales incorrectas', 'INVALID_CREDENTIALS');

      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    // Comparar contraseña
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      const err = AppError.unauthorized('Credenciales incorrectas', 'INVALID_CREDENTIALS');

      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    // Comprobar si el usuario está verificado
    if (user.status !== 'verified') {
      const err = AppError.forbidden('El usuario no está verificado', 'USER_NOT_VERIFIED');

      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    // Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Guardar refresh token en BD
    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: getRefreshTokenExpiry(),
      createdByIp: req.ip
    });

    // Ocultar la contraseña en la respuesta
    user.set('password', undefined, { strict: false });

    // Responder con tokens y datos del usuario
    return res.json({
      accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    console.error(error);

    const err = AppError.internal('Error al iniciar sesión');
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code
    });
  }
};

/**
 * Refrescar token de acceso.

 */
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if(!refreshToken) {
            const err = AppError.badRequest('Refresh token es requerido', 'REFRESH_TOKEN_REQUIRED');

            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken }).populate('user');

        if (!storedToken) {
            const err = AppError.unauthorized('Refresh token no válido', 'INVALID_REFRESH_TOKEN');

            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        // Token revocado o expirado
        if (!storedToken.isActive()) {
            const err = AppError.unauthorized('Refresh token no válido o expirado', 'INVALID_OR_EXPIRED_REFRESH_TOKEN');

            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        if(!storedToken.user) {
            const err = AppError.notFound('Usuario no encontrado para el refresh token', 'USER_NOT_FOUND');

            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        const accessToken = generateAccessToken(storedToken.user);

        return res.json({
            accessToken
        });
    } catch (error) {
        console.error(error);

        const err = AppError.internal('Error al refrescar token de acceso');
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code
        });
    }
};

/**
 * logout de usuario (revocar refresh token)
 */
export const logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        if(!storedToken) {
            const err = AppError.notFound('Refresh token no encontrado', 'REFRESH_TOKEN_NOT_FOUND');

            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        // Revocar el token
        storedToken.revokedAt = new Date();
        storedToken.revokedByIp = req.ip;
        await storedToken.save();

        return res.json({
            message: 'Logout realizado correctamente'
        });
    } catch (error) {
        console.error(error);

        const err = AppError.internal('Error al cerrar sesión');
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code
        });
    }
};

/**
 * Completar onboarding de usuario (actualizar datos)
 */
export const updateUserOnboarding = async (req, res) => {
    try {
      const { name, lastName, nif, address } = req.body;

      // Usuario viene del authMiddleware, por lo que req.user._id es el ID del usuario autenticado
      const user = await User.findById(req.user._id);

      if (!user) {
          const err = AppError.notFound('Usuario', 'USER_NOT_FOUND');
          return res.status(err.statusCode).json({
              error: true,
              message: err.message,
              code: err.code
          });
      }

      // Actualizar datos del usuario
      user.name = name;
      user.lastName = lastName;
      user.nif = nif;
      user.address = address;

      await user.save();

      return res.json({
          message: 'Onboarding completado correctamente',
          data: {
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            nif: user.nif,
            role: user.role,
            status: user.status
          }
      });
    } catch (error) {
        console.error(error);

        const err = AppError.internal('Error al completar onboarding');
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code
        });
    }
};

/**
 * Completar onboarding de empresa (actualizar datos de la empresa en el onboarding)
 */
export const updateCompanyOnboarding = async (req, res) => {
  try {
    const { name, cif, address, isFreelance } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        const err = AppError.notFound('Usuario', 'USER_NOT_FOUND');
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code
        });
    }

    // Usuario autónomo (freelance)
    if(isFreelance) {
      if(!user.nif || !user.name || !user.lastName) {
        const err = AppError.badRequest('El usuario debe completar su onboarding personal primero', 'USER_ONBOARDING_INCOMPLETE');
        
        return res.status(err.statusCode).json({
          error: true,
          message: err.message,
          code: err.code
        });
      }
      
      // Comprobar si ya existe una compañía de autónomo con el mismo NIF que el NIF del usuario
      const existingFreelanceCompany = await Company.findOne({ cif: user.nif });

      // Si ya existe una compañía de autónomo con el mismo NIF, asignar el usuario a esa compañía como guest
      if(existingFreelanceCompany) {
        user.company = existingFreelanceCompany._id;
        user.role = 'guest';

        await user.save();

        return res.status(200).json({
          message: 'Usuario unido a una compañía existente correctamente',
          data: {
            company: existingFreelanceCompany,
            user: {
              email: user.email,
              role: user.role,
              company: user.company
            }
          }
        });
      }
      // Si no existe, crear una nueva compañía de autónomo con los datos del usuario y asignar el usuario a esa compañía como admin
      const freelanceCompany = await Company.create({
        owner: user._id,
        name: `${user.name} ${user.lastName}`.trim(),
        cif: user.nif,
        address: user.address,
        isFreelance: true
      });

      user.company = freelanceCompany._id;
      user.role = 'admin';

      await user.save();

      return res.status(200).json({
        message: 'Compañía de autónomo creada orrectamente',
        data: {
          company: freelanceCompany,
          user: {
            email: user.email,
            role: user.role,
            company: user.company
          }
        }
      });
    } 

    // Empresa ya existente
    const existingCompany = await Company.findOne({ cif });

    if(existingCompany) {
      user.company = existingCompany._id;
      user.role = 'guest';

      await user.save();

      return res.status(200).json({
        message: 'Usuario unido a una compañía existente correctamente',
        data: {
          company: existingCompany,
          user: {
            email: user.email,
            role: user.role,
            company: user.company
          }
        }
      });
    }

    // Empresa nueva
    const newCompany = await Company.create({
      owner: user._id,
      name,
      cif,
      address,
      isFreelance: false
    });

    user.company = newCompany._id;
    user.role = 'admin';

    await user.save();

    return res.status(200).json({
      message: 'Compañía creada correctamente',
      data: {
        company: newCompany,
        user: {
          email: user.email,
          role: user.role,
          company: user.company
        }
      }
    });
  } catch (error) {
    console.error(error);

    // Manejar error de clave duplicada (código 11000) al crear una compañía con un CIF que ya existe
    if (error.code === 11000) {
      return res.status(409).json({
        error: true,
        message: 'Ya existe una compañía con ese CIF',
        code: 'COMPANY_ALREADY_EXISTS'
      });
    }

    const err = AppError.internal('Error al actualizar la compañía del usuario');
      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }
};


/**
 * Subir logo de la empresa (solo para usuarios admin)
 */
export const uploadLogo = async (req, res) => {
  try {
    if(!req.file) {
      const err = AppError.badRequest('Archivo de logo es requerido', 'LOGO_FILE_REQUIRED');
      
      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    if(!req.user.company) {
      const err = AppError.badRequest('El usuario no pertenece a ninguna compañía', 'USER_NO_COMPANY');
      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    // Buscar la compañía
    const company = await Company.findById(req.user.company);

    if(!company) {
      const err = AppError.notFound('Compañía', 'COMPANY_NOT_FOUND');
      
      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    const { filename } = req.file;

    company.logo = `/uploads/${filename}`;

    await company.save(); 

    res.status(200).json({
      message: 'Logo subido correctamente',
      data: {
        logo: company.logo
      }
    });
  } catch (error) {
    console.error(error)
    const err = AppError.internal('Error al subir el logo de la compañía', 'LOGO_UPLOAD_ERROR');
    
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code
    });
  }
};

/**
 * Obtener datos del usuario autenticado
*/

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('company');

    if(!user) {
      const err = AppError.notFound('Usuario', 'USER_NOT_FOUND');

      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    return res.json({
      data: user
    });
  } catch (error) {
    const err = AppError.internal('Error al obtener datos del usuario', 'GET_USER_ERROR');
    
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code
    });
  }
};

/**
* 
*/export const deleteUser = async (req, res) => {
  try {
    const { soft } = req.query;

    console.log('--- DELETE USER ---');
    console.log('req.query.soft:', soft);
    console.log('req.user:', req.user);
    console.log('req.user._id:', req.user?._id);

    let user = null;

    // Soft delete
    if (soft === 'true') {
      user = await User.findByIdAndUpdate(
        req.user._id,
        {
          deleted: true,
          deletedAt: new Date()
        },
        { returnDocument: 'after' }
      );

      console.log('Usuario tras soft delete:', user);

      if (!user) {
        const err = AppError.notFound('Usuario', 'USER_NOT_FOUND');

        return res.status(err.statusCode).json({
          error: true,
          message: err.message,
          code: err.code
        });
      }

      // Evento usuario eliminado
      notificationEmitter.emit('user:deleted', {
        email: user.email,
        type: 'soft'
      });

      return res.status(200).json({
        message: 'Usuario eliminado lógicamente (soft delete)',
        data: {
          id: user._id,
          email: user.email,
          deleted: user.deleted,
          deletedAt: user.deletedAt
        }
      });
    }

    // Comprobación previa hard delete
    const existingUser = await User.findById(req.user._id);
    console.log('Usuario encontrado antes del hard delete:', existingUser);

    // Hard delete
    user = await User.findByIdAndDelete(req.user._id);
    console.log('Usuario eliminado en hard delete:', user);

    if (!user) {
      const err = AppError.notFound('Usuario', 'USER_NOT_FOUND');

      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    // Evento usuario eliminado
    notificationEmitter.emit('user:deleted', {
      email: user.email,
      type: 'hard'
    });

    return res.status(200).json({
      message: 'Usuario eliminado permanentemente (hard delete)',
      data: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.log(error);

    const err = AppError.internal('Error al eliminar el usuario', 'DELETE_USER_ERROR');

    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code
    });
  }
};