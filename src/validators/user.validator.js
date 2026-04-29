import { z } from 'zod';

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

export const validateEmailCodeSchema = z.object({
    body: z.object({
        code: z
            .string()
            .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')
    })
});

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
        .transform((value) => value.toUpperCase()),
        
    address: z.object({
        street: z.string().trim().min(1, { message: 'La calle es requerida' }).optional(),
        number: z.string().trim().min(1, { message: 'El número es requerido' }).optional(),
        postal: z.string().trim().min(1, { message: 'El código postal es requerido' }).optional(),
        city: z.string().trim().min(1, { message: 'La ciudad es requerida' }).optional(),
        province: z.string().trim().min(1, { message: 'La provincia es requerida' }).optional()
    }).optional(),
});

export const companyOnboardingSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: 'El nombre de la empresa es requerido' })
        .optional(),

    cif: z
        .string()
        .trim()
        .min(1, { message: 'El CIF de la empresa es requerido' })
        .optional(),

    address: z.object({
        street: z.string().trim().min(1, { message: 'La calle es requerida' }).optional(),
        number: z.string().trim().min(1, { message: 'El número es requerido' }).optional(),
        postal: z.string().trim().min(1, { message: 'El código postal es requerido' }).optional(),
        city: z.string().trim().min(1, { message: 'La ciudad es requerida' }).optional(),
        province: z.string().trim().min(1, { message: 'La provincia es requerida' }).optional()
    }).optional(),
    
    isFreelance: z.boolean()
}).refine((data) => {
    // Si isFreelance es false, entonces name y cif son obligatorios
    if (data.isFreelance) return true;

    return !!data.name && !!data.cif && !!data.address;
}, {
    message: 'Si no es autónomo, el nombre, CIF y dirección de la empresa son obligatorios'
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string()
    .min(8, 'La contraseña actual debe tener al menos 8 caracteres'),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'La nueva contraseña debe ser diferente de la actual',
    path: ['newPassword']
  }
);

export const inviteUserSchema = z.object({
    email: z
        .string()
        .email({ message: 'El email no es válido' })
        .toLowerCase()
        .trim(),

    password: z
        .string()
        .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
        .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
        .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula' })
        .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
        .regex(/[@$!%*?&,._-]/, { message: 'La contraseña debe contener al menos un carácter especial (@$!%*?&,._-)' }),

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
        .transform((value) => value.toUpperCase()),
});
