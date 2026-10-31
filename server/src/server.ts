import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { initDatabaseConnection } from './config/db.js';
import { startBillingCron, stopBillingCron } from './jobs/billingCronJob.js';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    // 1. Initialize Database (Attempts PostgreSQL first, gracefully uses in-memory store if offline)
    await initDatabaseConnection();

    // 2. Start the automated recurring billing cron schedule
    startBillingCron();

    // 3. Start Express HTTP Server
    const server = app.listen(PORT, () => {
      logger.info('===========================================================');
      logger.info('  BRIGHTLOOP SUBSCRIPTION MANAGEMENT SYSTEM — API SERVER');
      logger.info('===========================================================');
      logger.info(`  Server running on : http://localhost:${PORT}`);
      logger.info(`  Health check      : http://localhost:${PORT}/health`);
      logger.info(`  API Base URL      : http://localhost:${PORT}/api/v1`);
      logger.info(`  Environment       : ${env.NODE_ENV || 'development'}`);
      logger.info('===========================================================');
    });

    // Graceful Shutdown
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}. Gracefully stopping server and background jobs...`);
      stopBillingCron();
      server.close(() => {
        logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error: any) {
    logger.error('Fatal bootstrap failure:', error);
    process.exit(1);
  }
}

bootstrap();
