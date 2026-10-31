import { Router } from 'express';
import { PlanController } from './planController.js';
import { authMiddleware, requireStaffOrAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', PlanController.getPlans);
router.post('/', requireStaffOrAdmin, PlanController.createPlan);
router.get('/:id', PlanController.getPlanById);
router.patch('/:id', requireStaffOrAdmin, PlanController.updatePlan);

export default router;
