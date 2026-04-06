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

/**
 * Schema de validación para la solicitud de refresh token. También se utiliza en el logout para revocar el token de refresh.
 */
export const refreshTokenSchema = z.object({
    refreshToken: z 
        .string()
        .min(1, { message: 'El refresh token es requerido' })
});

export const onboardingUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: 'El nombre es requerido' }),

    lastName: z
        .string()
        .trim()
        .min(1, { message: 'El apellido es requerido' }),
        
    nif: z
        .string()
        .trim()
        .length(9, { message: 'El NIF debe tener exactamente 9 caracteres' })
        .regex(/^[0-9]{8}[A-Z]$/, { message: 'El NIF debe tener 8 dígitos seguidos de una letra' })
        .transform((value) => value.toUpperCase())
});
