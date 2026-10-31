import { RecurringBillingService } from './recurringBillingService.js';

export class BillingService {
  /**
   * Triggers manual recurring billing run (useful for testing & demonstration)
   */
  static async triggerBillingCycle(manualDateString?: string) {
    const referenceDate = manualDateString ? new Date(manualDateString) : new Date();
    return RecurringBillingService.executeRecurringBillingCycle(referenceDate);
  }
}
