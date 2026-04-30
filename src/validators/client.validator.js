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

export const getClientsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
        search: z.string().optional()
    })
});

export const getClientByIdSchema = z.object({
    params: z.object({
        id: z
            .string()
            .length(24, 'El ID debe ser un ObjectId válido')
    })
});


export const updateClientSchema = z.object({
    params: z.object({
        id: z
            .string()
            .length(24, 'El ID debe ser un ObjectId válido')
    }),
    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, { message: 'El nombre del cliente es requerido' })
            .optional(),
        
        cif: z
            .string()
            .trim()
            .min(1, { message: 'El CIF del cliente es requerido' })
            .regex(/^[0-9]{8}[A-Z]$/, { message: 'El CIF debe tener 8 dígitos seguidos de una letra' })
            .toUpperCase()
            .optional(),
        
        email: z
            .string()
            .email({ message: 'El correo electrónico no es válido' })
            .toLowerCase()
            .optional(),
            
        phone: z
            .string()
            .trim()
            .optional(),

        address: z.object({
            street: z.string().trim().min(1, 'La calle es obligatoria').optional(),
            number: z.string().trim().min(1, 'El número es obligatorio').optional(),
            postal: z.string().trim().min(1, 'El código postal es obligatorio').optional(),
            city: z.string().trim().min(1, 'La ciudad es obligatoria').optional(),
            province: z.string().trim().min(1, 'La provincia es obligatoria').optional()
        }).optional(),
    }).refine(
        (data) => Object.keys(data).length > 0,
        { message: 'Debes enviar al menos un campo para actualizar' }
    )
});
