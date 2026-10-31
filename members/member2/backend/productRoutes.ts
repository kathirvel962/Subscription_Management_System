import { Router } from 'express';
import { ProductController } from './productController.js';
import { authMiddleware, requireStaffOrAdmin, requireAdmin } from '../../member1/backend/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ProductController.getProducts);
router.post('/', requireStaffOrAdmin, ProductController.createProduct);
router.get('/:id', ProductController.getProductById);
router.patch('/:id', requireStaffOrAdmin, ProductController.updateProduct);
router.delete('/:id', requireAdmin, ProductController.deleteProduct);
router.post('/:id/variants', requireStaffOrAdmin, ProductController.addVariant);

export default router;
