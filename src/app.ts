import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import compression from 'compression';
import httpStatus from 'http-status';

import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/error.middleware';
import  { httpLogger } from './utils/logger';
import routes from './routes/v1';

const app: Application = express();

// Security
app.use(helmet() as any);
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }) as any,
);
app.options('*', cors() as any); // handle preflight for all routes
app.use(globalLimiter);
app.use(hpp() as any);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Utility
app.use(compression() as any);
app.use(httpLogger);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Server is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Routes
app.use('/api/v1', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
