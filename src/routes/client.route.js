import express from 'express';
import {
    createClient,
    getClients,
    getClientById,
    updateClient
} from '../controllers/client.controller.js';
import { 
    createClientSchema,
    getClientsSchema,
    getClientByIdSchema,
    updateClientSchema
} from '../validators/client.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, validate(createClientSchema), createClient);
router.get('/', authMiddleware, validate(getClientsSchema), getClients);
router.get('/:id', authMiddleware, validate(getClientByIdSchema), getClientById);
router.put('/:id', authMiddleware, validate(updateClientSchema), updateClient);

export default router;
