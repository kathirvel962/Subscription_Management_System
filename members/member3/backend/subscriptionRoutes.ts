import { Router } from 'express';
import { SubscriptionController } from './subscriptionController.js';
import { authMiddleware, requireStaffOrAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', SubscriptionController.getSubscriptions);
router.post('/', requireStaffOrAdmin, SubscriptionController.createSubscription);
router.get('/:id', SubscriptionController.getSubscriptionById);
router.patch('/:id/status', requireStaffOrAdmin, SubscriptionController.transitionStatus);
router.post('/:id/pause', requireStaffOrAdmin, SubscriptionController.pause);
router.post('/:id/resume', requireStaffOrAdmin, SubscriptionController.resume);
router.post('/:id/renew', requireStaffOrAdmin, SubscriptionController.renew);
router.post('/:id/close', requireStaffOrAdmin, SubscriptionController.close);

export default router;
