import { z } from 'zod';

export const createClientSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, { message: 'El nombre del cliente es requerido' }),
        
        cif: z
            .string()
            .trim()
            .min(1, { message: 'El CIF del cliente es requerido' })
            .regex(/^[0-9]{8}[A-Z]$/, { message: 'El CIF debe tener 8 dígitos seguidos de una letra' })
            .toUpperCase(),
        
        email: z
            .string()
            .email({ message: 'El correo electrónico no es válido' })
            .toLowerCase(),
            
        phone: z
            .string()
            .trim()
            .optional()
            .default(''),

        address: z.object({
            street: z.string().trim().min(1, 'La calle es obligatoria'),
            number: z.string().trim().min(1, 'El número es obligatorio'),
            postal: z.string().trim().min(1, 'El código postal es obligatorio'),
            city: z.string().trim().min(1, 'La ciudad es obligatoria'),
            province: z.string().trim().min(1, 'La provincia es obligatoria')
        }),
    })
});
