import mongoose from 'mongoose';
import { ZodError } from 'zod';


export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (parsed.body) req.body = parsed.body;
    //if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    if (parsed.query) {
      req.validatedQuery = parsed.query;
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        code: 'VALIDATION_ERROR',
        details: error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    next(error);
  }
};

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        code: 'VALIDATION_ERROR',
        details: error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    next(error);
  }
};

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
