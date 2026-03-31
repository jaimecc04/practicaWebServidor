import mongoose from 'mongoose';

/**
 * Middleware de validación con Zod
 * Valida body, query y params según el esquema proporcionado. Si la validación falla, devuelve un error 400 con los detalles de los errores.
 */
export const validate = (schema) => (req, res, next) => {
    try {
        // Validar body, query y params con el mismo esquema
        const validateData = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });

        // Sobrescribir con los datos validados (si se han transformado)
        req.body = validateData.body ?? req.body;
        req.query = validateData.query ?? req.query;
        req.params = validateData.params ?? req.params;

        next();
    } catch (error) {
        const errors = error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));

        res.status(400).json({
            error: true,
            message: 'Error de validación',
            code: 'VALIDATION_ERROR',
            details: errors
        });
    }
};

/**
 * Middleware para validar solo body
 * usado en endpoints POST/PUT/PATCH
 */
export const validateBody = (schema) => (req, res, next) => {
    try {
        // Validar solo el body con datos transformados
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        const errors = error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));

        res.status(400).json({
            error: true,
            message: 'Error de validación',
            code: 'VALIDATION_ERROR',
            details: errors
        });
    }
};

/**
 * Middleware para validar ObjectId
 * Evita errores cuando se recibe un id inválido en params
 */
export const validateObjectId = (paramName = 'id') => (req, res, next) => {
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: true,
            message: `'${paramName}' no es un ID válido`
        });
    }

    next();
};
