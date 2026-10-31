import { Router } from 'express';
import { QuotationController } from './quotationController.js';
import { authMiddleware, requireStaffOrAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', QuotationController.getQuotations);
router.post('/', requireStaffOrAdmin, QuotationController.createQuotation);
router.get('/:id', QuotationController.getQuotationById);
router.post('/:id/confirm', QuotationController.confirmQuotation);

export default router;
