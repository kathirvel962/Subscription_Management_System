import { Router } from 'express';
import { DashboardController } from './dashboardController.js';
import { authMiddleware, requireStaffOrAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);
router.use(requireStaffOrAdmin);

router.get('/overview', DashboardController.getOverview);
router.get('/revenue', DashboardController.getRevenue);
router.get('/overdue', DashboardController.getOverdueInvoices);

export default router;
