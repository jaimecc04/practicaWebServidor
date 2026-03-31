 // Configuracion express
import express from 'express';
import apiRouter from './routes/index.js';

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

// Rutas
app.use('/api', apiRouter);

export default app;