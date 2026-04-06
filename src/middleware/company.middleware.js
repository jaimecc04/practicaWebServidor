import { AppError } from '../utils/AppError.js';

export const checkUserHasCompany = (req, res, next) => {
  if (!req.user.company) {
    const err = AppError.badRequest(
      'El usuario no tiene una compañía asociada',
      'USER_WITHOUT_COMPANY'
    );

    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code
    });
  }

  next();
};