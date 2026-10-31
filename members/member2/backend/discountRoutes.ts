import { Router } from 'express';
import { DiscountController } from './discountController.js';
import { authMiddleware, requireAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', DiscountController.getDiscounts);
router.post('/', requireAdmin, DiscountController.createDiscount);
router.patch('/:id', requireAdmin, DiscountController.updateDiscount);
router.post('/validate', DiscountController.validateDiscount);

export default router;
