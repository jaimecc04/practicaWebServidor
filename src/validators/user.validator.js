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

/**
 * Schema de validación de la solicitud para enviar el código de verificación por email.
 */
export const validateEmailCodeSchema = z.object({
    body: z.object({
        code: z
            .string()
            .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')
    })
});

/**
 * Schema de validación para el inicio de sesión de usuarios.
 */
export const loginUserSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email no válido' })
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
});
