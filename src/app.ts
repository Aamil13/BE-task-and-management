import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/error.middleware';
import logger from './utils/logger';
import routes from './routes/v1';

const app: Application = express();

// Security
app.use(helmet() as any);
app.use(cors() as any);
app.use(globalLimiter);
app.use(hpp() as any);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Utility
app.use(compression() as any);
app.use(pinoHttp({ logger }) as any);

// Routes
app.use('/api/v1', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
