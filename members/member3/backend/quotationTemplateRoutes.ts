import { Router } from 'express';
import { QuotationTemplateController } from './quotationTemplateController.js';
import { authMiddleware, requireStaffOrAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', QuotationTemplateController.getTemplates);
router.get('/:id', QuotationTemplateController.getTemplateById);
router.post('/', requireStaffOrAdmin, QuotationTemplateController.createTemplate);

export default router;
