import express from 'express';
import {
    createClient
} from '../controllers/client.controller.js';
import { 
    createClientSchema
} from '../validators/client.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, validate(createClientSchema), createClient);

export default router;
