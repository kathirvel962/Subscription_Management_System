import { Router } from 'express';
import { InvoiceController } from './invoiceController.js';
import { authMiddleware, requireStaffOrAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', InvoiceController.getInvoices);
router.get('/overdue', requireStaffOrAdmin, InvoiceController.getOverdueInvoices);
router.post('/', requireStaffOrAdmin, InvoiceController.createInvoice);
router.get('/:id', InvoiceController.getInvoiceById);
router.post('/:id/confirm', requireStaffOrAdmin, InvoiceController.confirmInvoice);
router.post('/:id/cancel', requireStaffOrAdmin, InvoiceController.cancelInvoice);
router.get('/:id/pdf', InvoiceController.getInvoicePdf);

export default router;
