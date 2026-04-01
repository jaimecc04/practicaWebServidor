import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { registerUserSchema } from '../validators/user.validator.js';

const router = Router();

/**
 * POST /api/user/register
 */
router.post('/register', validateBody(registerUserSchema), registerUser);

import { deleteUserByEmail } from '../controllers/user.controller.js';

router.delete('/test-delete', deleteUserByEmail);

export default router;