import { Router } from 'express';
import { 
    registerUser, 
    validateUserEmail, 
    loginUser, 
    refreshAccessToken, 
    logoutUser,
    updateUserOnboarding
    } from '../controllers/user.controller.js';
import { 
    registerUserSchema, 
    validateEmailCodeSchema, 
    loginUserSchema,
    refreshTokenSchema, 
    onboardingUserSchema } from '../validators/user.validator.js';
import { validate, validateBody } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

import { deleteUserByEmail } from '../controllers/user.controller.js';

const router = Router();

// POST /api/user/register
router.post('/register', validateBody(registerUserSchema), registerUser);
// PUT /api/user/validation
router.put('/validation', authMiddleware, validate(validateEmailCodeSchema), validateUserEmail);
// POST /api/user/login
router.post('/login', validateBody(loginUserSchema), loginUser);
// POST /api/user/refresh
router.post('/refresh', validateBody(refreshTokenSchema), refreshAccessToken);
// POST /api/user/logout
router.post('/logout', authMiddleware, validateBody(refreshTokenSchema), logoutUser);
// PUT /api/user/register
router.put('/register', authMiddleware, validateBody(onboardingUserSchema), updateUserOnboarding);

// DELETE /api/user/test-delete
router.delete('/test-delete', deleteUserByEmail);

export default router;