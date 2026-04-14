 // Configuracion express
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join } from 'node:path';
import morganBody from 'morgan-body';
import { loggerStream } from './utils/handleLogger.js';

import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { sanitizeBody } from './middleware/sanitize.middleware.js';

const app = express();

// Seguridad básica con Helmet
app.use(helmet());

// Cors
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limit global
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limitar a 100 solicitudes por IP por ventana
    standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiadas peticiones, inténtalo más tarde',
    code: 'RATE_LIMIT'
  }
});

app.use(limiter);

// Parseo delbody
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Middleware de sanitización
app.use(sanitizeBody);

// Archivo estáticos
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Slack
morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400, // Solo errores
  stream: loggerStream
});

// Rutas
app.use('/api', apiRouter);

// Middleware de error
app.use(notFound);
app.use(errorHandler);

export default app;