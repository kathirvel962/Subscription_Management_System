import { Router } from 'express';
import { BillingController } from './billingController.js';
import { authMiddleware, requireStaffOrAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

// Manual trigger for testing/demo of recurring billing cycle
router.post('/trigger', requireStaffOrAdmin, BillingController.trigger);

export default router;
