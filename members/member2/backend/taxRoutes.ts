import { Router } from 'express';
import { TaxController } from './taxController.js';
import { authMiddleware, requireAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', TaxController.getTaxes);
router.post('/', requireAdmin, TaxController.createTax);
router.patch('/:id', requireAdmin, TaxController.updateTax);

export default router;
