import Client from '../models/client.model.js';
import { AppError } from '../utils/AppError.js';

export const createClient = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyId = req.user.company;

        if (!companyId) {
            const err =  AppError.badRequest('El usuario no pertenece a ninguna empresa', 'NO_COMPANY');
            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        
        }

        const { cif } = req.body;

        const existingClient = await Client.findOne({ cif, company: companyId, deleted: false });

        if (existingClient) {
            const err =  AppError.conflict('Ya existe un cliente con ese CIF en la empresa', 'CLIENT_EXISTS');
            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        const client = new Client({
            ...req.body,
            user: userId,
            company: companyId
        });

        await client.save();

        res.status(201).json({ 
            message: 'Cliente creado correctamente',
            data: client 
        });
    
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

export const getClients = async (req, res) => {
    try {
        const companyId = req.user.company;

        if (!companyId) {
            const err =  AppError.badRequest('El usuario no pertenece a ninguna empresa', 'NO_COMPANY');
            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        const { page = 1, limit = 10, search = '' } = req.validatedQuery || req.query;

        const filter = { company: companyId, deleted: false };

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const [clients, total] = await Promise.all([
            Client.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),

            Client.countDocuments(filter)
        ]);

        return res.json({
            data: clients,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error obteniendo clientes:', error);

        const err = AppError.internal('Error al obtener los clientes', 'GET_CLIENTS_ERROR');
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code
        });
    }
};

export const getClientById = async (req, res) => {
    try {
        const companyId = req.user.company;
        const { id } = req.params;

        if (!companyId) {
            const err =  AppError.badRequest('El usuario no pertenece a ninguna empresa', 'NO_COMPANY');
            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        const client = await Client.findOne({ _id: id, company: companyId, deleted: false });

        if (!client) {
            const err =  AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND');
            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        res.json({ 
            data: client
        });

    } catch (error) {
        console.error('Error obteniendo cliente por ID:', error);

        const err = AppError.internal('Error al obtener el cliente', 'GET_CLIENT_ERROR');
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code
        });
    }
};

export const updateClient = async (req, res) => {
    try {
        const companyId = req.user.company;
        const { id } = req.params;

        if (!companyId) {
            const err =  AppError.badRequest('El usuario no pertenece a ninguna empresa', 'NO_COMPANY');
            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        const client = await Client.findOne({ _id: id, company: companyId, deleted: false });

        if (!client) {
            const err =  AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND');
            return res.status(err.statusCode).json({
                error: true,
                message: err.message,
                code: err.code
            });
        }

        if (req.body.cif && req.body.cif !== client.cif) {
            const existingClient = await Client.findOne({ cif: req.body.cif, company: companyId, deleted: false });

            if (existingClient) {
                const err =  AppError.conflict('Ya existe un cliente con ese CIF en la empresa', 'CLIENT_EXISTS');
                return res.status(err.statusCode).json({
                    error: true,
                    message: err.message,
                    code: err.code
                });
            }
        }

        const updatedClient = await Client.findByIdAndUpdate(
            {
                _id: id,
                company: companyId,
                deleted: false
            },
            req.body,
            { returnDocument: 'after' }
        );

        return res.status(200).json({
            message: 'Cliente actualizado correctamente',
            data: updatedClient
        });
    } catch (error) {
        console.error('Error actualizando cliente:', error);

        const err = AppError.internal('Error al actualizar el cliente', 'UPDATE_CLIENT_ERROR');
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code
        });
    }
};
