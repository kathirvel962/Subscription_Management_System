import cron from 'node-cron';
import { RecurringBillingService } from '../../../members/member4/backend/recurringBillingService.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

let cronTask: cron.ScheduledTask | null = null;

export const startBillingCron = (): void => {
  const schedule = env.BILLING_CRON_SCHEDULE || '0 0 * * *'; // Default midnight daily

  if (!cron.validate(schedule)) {
    logger.error(`Invalid cron schedule pattern: "${schedule}". Falling back to daily midnight.`);
  }

  const validSchedule = cron.validate(schedule) ? schedule : '0 0 * * *';

  logger.info(`Initializing automated subscription recurring billing cron job [${validSchedule}]`);

  cronTask = cron.schedule(validSchedule, async () => {
    logger.info('⏰ Recurring billing cron job triggered.');
    try {
      const result = await RecurringBillingService.executeRecurringBillingCycle();
      logger.info(
        `Automated recurring billing run completed. Processed: ${result.processedCount}, Invoices Generated: ${result.invoicesGeneratedCount}, Skipped: ${result.skippedCount}`
      );
    } catch (err: any) {
      logger.error(`Recurring billing cron failed: ${err.message}`, err);
    }
  });
};

export const stopBillingCron = (): void => {
  if (cronTask) {
    cronTask.stop();
    logger.info('Recurring billing cron stopped.');
  }
};
