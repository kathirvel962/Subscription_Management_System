# MODULE OWNERSHIP DOCUMENTATION
## Brightloop Software — Subscription Management System

### Team Distribution Matrix

| Member | Assigned Area | Root Folder | Core Backend Responsibilities | Core Frontend Responsibilities |
|---|---|---|---|---|
| **Member 1** | Authentication & User Management | `members/member1/` | JWT, bcrypt, Auth middleware, RBAC, Profile, Staff creation, Forgot/Reset password | Login, Register, Forgot Password, Reset Password, Profile, User Management, Customer Portal Layout, ProtectedRoute |
| **Member 2** | Catalog, Plans, Taxes & Discounts | `members/member2/` | Products, Product Variants (Odoo Brand +560), Subscription Plans (Daily, Weekly, Monthly, Yearly), Tax rules, Discount validation | ProductsPage, ProductDetailsPage, ProductForm, ProductVariantManager, PlansPage, PlanForm, TaxManagementPage, DiscountManagementPage |
| **Member 3** | Quotations & Subscriptions Lifecycle | `members/member3/` | Quotation Templates, Quotations, Subscriptions lifecycle (Draft -> Quo -> Confirmed -> Active -> Closed), Pause, Resume, Renew, Early Close | QuotationsPage, QuotationTemplatesPage, CreateQuotationPage, SubscriptionsPage, CreateSubscriptionPage, SubscriptionDetailsPage, SubscriptionTimeline |
| **Member 4** | Billing, Invoices, Payments & Financial Dashboard | `members/member4/` | Node-cron automated billing, Manual trigger, Duplicate prevention, Invoice lifecycle, PDF generation, Payments, MRR/ARR analytics | FinanceDashboard, InvoicesPage, InvoiceDetailsPage, InvoicePDF, PaymentsPage, PaymentDetailsPage, RevenueAnalytics, OverdueInvoicesPage |

---

### Detailed Member File Manifest

#### Member 1 (`members/member1/`)
- `backend/authController.ts`
- `backend/authService.ts`
- `backend/authRoutes.ts`
- `backend/userController.ts`
- `backend/userService.ts`
- `backend/userRoutes.ts`
- `backend/authMiddleware.ts`
- `backend/roleMiddleware.ts`
- `backend/validation.ts`
- `backend/index.ts`
- `frontend/LoginPage.tsx`
- `frontend/RegisterPage.tsx`
- `frontend/ForgotPasswordPage.tsx`
- `frontend/ResetPasswordPage.tsx`
- `frontend/ProfilePage.tsx`
- `frontend/UserManagementPage.tsx`
- `frontend/CustomerPortalLayout.tsx`
- `frontend/ProtectedRoute.tsx`
- `frontend/index.ts`
- `tests/member1.test.ts`
- `README.md`
- `API_DOCUMENTATION.md`
- `INTEGRATION.md`

#### Member 2 (`members/member2/`)
- `backend/productController.ts`
- `backend/productService.ts`
- `backend/productRoutes.ts`
- `backend/planController.ts`
- `backend/planService.ts`
- `backend/planRoutes.ts`
- `backend/taxController.ts`
- `backend/taxService.ts`
- `backend/taxRoutes.ts`
- `backend/discountController.ts`
- `backend/discountService.ts`
- `backend/discountRoutes.ts`
- `backend/validation.ts`
- `backend/index.ts`
- `frontend/ProductsPage.tsx`
- `frontend/ProductDetailsPage.tsx`
- `frontend/ProductForm.tsx`
- `frontend/ProductVariantManager.tsx`
- `frontend/PlansPage.tsx`
- `frontend/PlanForm.tsx`
- `frontend/TaxManagementPage.tsx`
- `frontend/DiscountManagementPage.tsx`
- `frontend/index.ts`
- `tests/member2.test.ts`
- `README.md`
- `API_DOCUMENTATION.md`
- `INTEGRATION.md`

#### Member 3 (`members/member3/`)
- `backend/quotationTemplateController.ts`
- `backend/quotationTemplateService.ts`
- `backend/quotationTemplateRoutes.ts`
- `backend/quotationController.ts`
- `backend/quotationService.ts`
- `backend/quotationRoutes.ts`
- `backend/subscriptionController.ts`
- `backend/subscriptionService.ts`
- `backend/subscriptionRoutes.ts`
- `backend/validation.ts`
- `backend/index.ts`
- `frontend/QuotationsPage.tsx`
- `frontend/QuotationTemplatesPage.tsx`
- `frontend/CreateQuotationPage.tsx`
- `frontend/SubscriptionsPage.tsx`
- `frontend/CreateSubscriptionPage.tsx`
- `frontend/SubscriptionDetailsPage.tsx`
- `frontend/SubscriptionTimeline.tsx`
- `frontend/index.ts`
- `tests/member3.test.ts`
- `README.md`
- `API_DOCUMENTATION.md`
- `INTEGRATION.md`

#### Member 4 (`members/member4/`)
- `backend/billingController.ts`
- `backend/billingService.ts`
- `backend/billingRoutes.ts`
- `backend/invoiceController.ts`
- `backend/invoiceService.ts`
- `backend/invoiceRoutes.ts`
- `backend/paymentController.ts`
- `backend/paymentService.ts`
- `backend/paymentRoutes.ts`
- `backend/dashboardController.ts`
- `backend/dashboardService.ts`
- `backend/dashboardRoutes.ts`
- `backend/recurringBillingService.ts`
- `backend/pdfService.ts`
- `backend/validation.ts`
- `backend/index.ts`
- `frontend/FinanceDashboard.tsx`
- `frontend/InvoicesPage.tsx`
- `frontend/InvoiceDetailsPage.tsx`
- `frontend/InvoicePDF.tsx`
- `frontend/PaymentsPage.tsx`
- `frontend/PaymentDetailsPage.tsx`
- `frontend/RevenueAnalytics.tsx`
- `frontend/OverdueInvoicesPage.tsx`
- `frontend/index.ts`
- `tests/member4.test.ts`
- `README.md`
- `API_DOCUMENTATION.md`
- `INTEGRATION.md`
