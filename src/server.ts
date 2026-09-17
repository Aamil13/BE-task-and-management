import { connectDB, disconnectDB } from './config/db';
import logger from './utils/logger';
import app from './app';
import { config } from './config/env';

const start = async (): Promise<void> => {
  await connectDB();
  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });

  const shutdown = async (signal: string) => {
    logger.warn(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
