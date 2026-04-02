// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw AppError.unauthorized('Token requerido', 'NOT_TOKEN');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Formato de token inválido', 'INVALID_TOKEN_FORMAT');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw AppError.unauthorized('Token requerido', 'NOT_TOKEN');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?._id) {
      throw AppError.unauthorized('Token inválido', 'ERROR_ID_TOKEN');
    }

    const user = await User.findById(decoded._id);

    if (!user) {
      throw AppError.unauthorized('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(AppError.unauthorized('Token inválido', 'INVALID_TOKEN'));
      return;
    }

    if (error.name === 'TokenExpiredError') {
      next(AppError.unauthorized('Token expirado', 'TOKEN_EXPIRED'));
      return;
    }

    next(error);
  }
};