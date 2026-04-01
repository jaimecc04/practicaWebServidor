import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';  // Corto
const REFRESH_TOKEN_DAYS = 7; // Largo

/**
 * Genera access token (corta duración)
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { 
        _id: user._id, 
        role: user.role 
    },
    JWT_SECRET,
    { 
        expiresIn: ACCESS_TOKEN_EXPIRES 
    }
  );
};

/**
 * Verifica access token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.log('Error verificando access token:', err.message);
    return null;
  }
};

/**
 * Genera refresh token (larga duración)
 * Usa crypto para token opaco (no JWT)
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Calcula fecha de expiración del refresh token
 */
export const getRefreshTokenExpiry = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_DAYS);
  return expiry;
};
