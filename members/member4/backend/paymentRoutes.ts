import { Router } from 'express';
import { PaymentController } from './paymentController.js';
import { authMiddleware, requireStaffOrAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', PaymentController.getPayments);
router.get('/:id', PaymentController.getPaymentById);
router.post('/', requireStaffOrAdmin, PaymentController.recordPayment);

export default router;
