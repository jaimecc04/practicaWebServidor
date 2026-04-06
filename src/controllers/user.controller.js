import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../utils/handleJwt.js';
import { encrypt } from '../utils/handlePassword.js';
import { AppError } from '../utils/AppError.js';
import { compare } from '../utils/handlePassword.js';

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

    if (!user) {
      const err = AppError.notFound('Usuario', 'USER_NOT_FOUND');

      return res.status(err.statusCode).json({
        error: true,
        message: err.message,
        code: err.code
      });
    }

    // Comparar contraseña
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      const err = AppError.unauthorized('Contraseña incorrecta', 'INVALID_PASSWORD');

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
 * Eliminar usuario por email (solo para pruebas)
 */
export const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuario no encontrado'
      });
    }

    // Eliminar también los refresh tokens
    await RefreshToken.deleteMany({ user: user._id });

    return res.json({
      error: false,
      message: 'Usuario y tokens eliminados correctamente'
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error al eliminar usuario'
    });
  }
};
