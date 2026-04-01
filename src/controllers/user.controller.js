import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../utils/handleJwt.js';
import { encrypt } from '../utils/handlePassword.js';

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