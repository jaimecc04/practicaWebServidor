import { z } from 'zod';

/**
 * Schema de validación para el registro de usuarios.
 */
export const registerUserSchema = z.object({
    email: z
        .string()
        .email({ message: 'El email no es válido' })
        .transform(email => email.toLowerCase().trim()), // Normalizar el email a minúsculas y sin espacios

    password: z
        .string()
        .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
        .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
        .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula' })
        .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
        .regex(/[@$!%*?&,._-]/, { message: 'La contraseña debe contener al menos un carácter especial (@$!%*?&,._-)' })
});
