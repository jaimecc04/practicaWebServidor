import { Router } from 'express';
import { registerUser, validateUserEmail, loginUser } from '../controllers/user.controller.js';
import { registerUserSchema, validateEmailCodeSchema, loginUserSchema } from '../validators/user.validator.js';
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


// DELETE /api/user/test-delete
router.delete('/test-delete', deleteUserByEmail);

export default router;