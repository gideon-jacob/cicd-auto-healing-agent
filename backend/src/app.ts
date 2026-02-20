import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';
import { logger } from './utils/logger';

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
);

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request logging ─────────────────────────────────────────────────────────
app.use(
    morgan('combined', {
        stream: {
            write: (message: string) => logger.info(message.trim()),
        },
    }),
);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', routes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'CI/CD Auto-Healing Agent API',
        version: '1.0.0',
        docs: '/api/health',
    });
});

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
