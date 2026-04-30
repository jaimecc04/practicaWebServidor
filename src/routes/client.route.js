import express from 'express';
import {
    createClient,
    getClients
} from '../controllers/client.controller.js';
import { 
    createClientSchema,
    getClientsSchema
} from '../validators/client.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, validate(createClientSchema), createClient);
router.get('/', authMiddleware, validate(getClientsSchema), getClients);

export default router;
