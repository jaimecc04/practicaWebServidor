import express from 'express';
import dbConnect from './config/db.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});


// Inicio servidor
const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await dbConnect();
        app.listen(PORT, () => {
            console.log(`Servidor en http://localhost:${PORT}`);
            console.log(`API en http://localhost:${PORT}/api`);
        });
    } catch(error){
        console.error('ERROR al iniciar: ', error);
        process.exit(1);
    }
};

startServer();