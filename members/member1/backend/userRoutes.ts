import { Router } from 'express';
import { UserController } from './userController.js';
import { authMiddleware } from './authMiddleware.js';
import { requireAdmin, requireStaffOrAdmin } from './roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireStaffOrAdmin, UserController.getUsers);
router.post('/staff', requireAdmin, UserController.createStaff);
router.get('/customers', requireStaffOrAdmin, UserController.getCustomers);
router.get('/:id', UserController.getUserById);
router.patch('/:id', UserController.updateProfile);

export default router;
