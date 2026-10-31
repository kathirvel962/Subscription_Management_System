# MEMBER 1: AUTHENTICATION AND USER MANAGEMENT MODULE
## Brightloop Software — Subscription Management System

### Overview
This module implements the complete authentication, user identity, role-based access control (RBAC), and customer profile management system for Brightloop Software.

### Key Capabilities
1. **User Registration & Login**: Multi-tenant customer self-registration and credential authentication.
2. **Password Security Policy**: Enforces > 8 characters, uppercase, lowercase, and special characters.
3. **JWT Authentication & bcrypt**: Secure password hashing with 10 salt rounds and signed JWT tokens with 7-day expiration.
4. **Role-Based Access Control (RBAC)**:
   - **ADMIN**: Complete system control, staff account creation, system configuration.
   - **STAFF**: Operational management (subscriptions, quotations, invoices, payments).
   - **CUSTOMER**: Restricted self-service portal (own subscriptions, own invoices, profile).
5. **Password Reset Token Flow**: Time-limited cryptographic reset tokens with expiration and single-use enforcement.
6. **Customer Portal Layout & Navigation**: Responsive dedicated portal for authenticated customer users.

### Directory Structure
```
members/member1/
  ├── backend/
  │   ├── authController.ts
  │   ├── authService.ts
  │   ├── authRoutes.ts
  │   ├── userController.ts
  │   ├── userService.ts
  │   ├── userRoutes.ts
  │   ├── authMiddleware.ts
  │   ├── roleMiddleware.ts
  │   ├── validation.ts
  │   └── index.ts
  ├── frontend/
  │   ├── LoginPage.tsx
  │   ├── RegisterPage.tsx
  │   ├── ForgotPasswordPage.tsx
  │   ├── ResetPasswordPage.tsx
  │   ├── ProfilePage.tsx
  │   ├── UserManagementPage.tsx
  │   ├── CustomerPortalLayout.tsx
  │   ├── ProtectedRoute.tsx
  │   └── index.ts
  ├── tests/
  │   └── member1.test.ts
  ├── README.md
  ├── API_DOCUMENTATION.md
  └── INTEGRATION.md
```
