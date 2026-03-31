import User from '../models/user.model.js';

/**
 * Registrar nuevo usuario.
 */
export const registerUser = async (req, res) => {
    try {
        const { email, password, name, lastName, nif } = req.body;

        // Verificar si el email ya está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                error: true,
                message: 'El email ya está registrado'
            });
        }
        
        // Generar código de verificación aleatorio de 6 dígitos
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Crear usuario
        const user = await User.create({
            email,
            password,
            name,
            lastName,
            nif,
            verificationCode,
            verificationAttempts: 3,
            role: 'admin',
            status: 'pending'
        });

        return res.status(201).json({
            message: 'Usuario registrado exitosamente. Por favor, verifica tu email.',
            data: user
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).json({
            error: true,
            message: 'Error al registrar usuario'
        });
    }
};