import { Router } from 'express';

// Member 1
import authRoutes from '../../../members/member1/backend/authRoutes.js';
import userRoutes from '../../../members/member1/backend/userRoutes.js';

// Member 2
import productRoutes from '../../../members/member2/backend/productRoutes.js';
import planRoutes from '../../../members/member2/backend/planRoutes.js';
import taxRoutes from '../../../members/member2/backend/taxRoutes.js';
import discountRoutes from '../../../members/member2/backend/discountRoutes.js';

// Member 3
import quotationTemplateRoutes from '../../../members/member3/backend/quotationTemplateRoutes.js';
import quotationRoutes from '../../../members/member3/backend/quotationRoutes.js';
import subscriptionRoutes from '../../../members/member3/backend/subscriptionRoutes.js';

// Member 4
import invoiceRoutes from '../../../members/member4/backend/invoiceRoutes.js';
import paymentRoutes from '../../../members/member4/backend/paymentRoutes.js';
import billingRoutes from '../../../members/member4/backend/billingRoutes.js';
import dashboardRoutes from '../../../members/member4/backend/dashboardRoutes.js';

const router = Router();

// Member 1 Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Member 2 Routes
router.use('/products', productRoutes);
router.use('/plans', planRoutes);
router.use('/taxes', taxRoutes);
router.use('/discounts', discountRoutes);

// Member 3 Routes
router.use('/quotation-templates', quotationTemplateRoutes);
router.use('/quotations', quotationRoutes);
router.use('/subscriptions', subscriptionRoutes);

// Member 4 Routes
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/billing', billingRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
