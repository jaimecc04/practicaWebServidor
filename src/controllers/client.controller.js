import Client from '../models/client.model.js';
import { AppError } from '../utils/AppError.js';

export const createClient = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyId = req.user.company;

        if (!companyId) {
            throw new AppError('El usuario no pertenece a ninguna empresa', 'NO_COMPANY');
        }

        const { cif } = req.body;

        const existingClient = await Client.findOne({ cif, company: companyId, deleted: false });

        if (existingClient) {
            throw new AppError('Ya existe un cliente con ese CIF en la empresa', 'CLIENT_EXISTS');
        }

        const client = new Client({
            ...req.body,
            user: userId,
            company: companyId
        });

        await client.save();

        res.status(201).json({ 
            message: 'Cliente creado correctamente',
            data: client });
    
    } catch (error) {
        console.error('Error creando cliente:', error);

        const err = AppError.internal('Error al crear el cliente', 'CREATE_CLIENT_ERROR');
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code
        });
    }
};
