# SubscriptIQ – Subscription Management & Recurring Billing Platform
> **Odoo Hackathon Project** – Fictional Enterprise: Brightloop Software

---

## 1. Project Overview

**SubscriptIQ** is a unified subscription management and automated recurring billing platform developed for **Brightloop Software**. Brightloop sells software subscriptions billed across various cycles (monthly, yearly, weekly, daily), add-ons, and products with variants (e.g., Odoo Brand variants with surcharge pricing).

Previously, Brightloop tracked subscriptions on spreadsheets and manually created invoices and matched payments, leading to missed renewals, incorrect invoices, payment reconciliation errors, and inaccurate revenue analytics. **SubscriptIQ** replaces these manual workflows with a single dynamic, API-driven platform.

---

## 2. Shared Technology Stack

- **Frontend**: React.js 18, Vite, JavaScript (ES6+), Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide React
- **Backend**: Node.js, Express.js, MongoDB, Mongoose ODM, JWT Authentication, bcryptjs password hashing
- **Palette**: Primary Navy (`#172554`), Indigo (`#6366F1`), Slate Background (`#F8FAFC`), White cards (`#FFFFFF`)

---

## 3. Four-Member Responsibility Division & Git Branches

| Member | Focus Area | Git Branch | Core Responsibilities |
|---|---|---|---|
| **Member 1** | **Foundation, Auth & Integration** *(Lead)* | `feature/auth-layout` | Project structure, JWT auth, RBAC, User APIs, Responsive Layout, Shared Axios, Final coordination |
| **Member 2** | **Product & Plan Management** | `feature/products-plans` | Product CRUD, price variants (e.g. Odoo brand +₹560), Plan models, billing frequencies |
| **Member 3** | **Subscriptions & Invoices** | `feature/subscriptions-invoices` | Quotation workflow, subscription lifecycle (Draft → Quotation → Confirmed → Active → Closed), automated invoice generation, duplicate prevention |
| **Member 4** | **Payments, Discounts & Analytics** | `feature/payments-analytics` | Payment recording (Cash/Card/Bank/Other), partial payments, discount rules (fixed/percentage), finance revenue analytics |

---

## 4. Shared Project Structure

```text
subscriptiq/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/ (Login.jsx, Register.jsx)
│   │   │   ├── customers/ (UsersPage.jsx)
│   │   │   ├── dashboard/ (Dashboard.jsx)
│   │   │   ├── discounts/ (DiscountsPlaceholder.jsx)
│   │   │   ├── invoices/ (InvoicesPlaceholder.jsx)
│   │   │   ├── payments/ (PaymentsPlaceholder.jsx)
│   │   │   ├── plans/ (PlansPlaceholder.jsx)
│   │   │   ├── products/ (ProductsPlaceholder.jsx)
│   │   │   ├── subscriptions/ (SubscriptionsPlaceholder.jsx)
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── test/
│   │   └── auth.test.js
│   ├── utils/
│   │   └── response.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## 5. User Roles & Access Control (RBAC)

1. **Admin**: Complete system control. Can create staff accounts, manage products, plans, discount rules, view all customers, and inspect financial analytics.
2. **Staff**: Operational access. Can view customer directory, create quotations, manage subscriptions, generate invoices, and record customer payments. Cannot create staff accounts.
3. **Customer**: Self-service portal. Can view their own active subscriptions, invoices, payment history, and profile. Backend strictly enforces customer isolation (`req.user._id`).

---

## 6. Shared API Response Conventions

All backend endpoints return standard JSON envelopes:

### Success (200, 201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error (400, 401, 403, 404, 409, 500)
```json
{
  "success": false,
  "message": "Meaningful error message",
  "errors": []
}
```

---

## 7. Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB (Local service or MongoDB Atlas URI; if unavailable, automatic in-memory fallback engages for development)

### Backend Setup
```bash
cd server
cp .env.example .env
npm install
npm test          # Run automated 12-point authentication test suite
npm start         # Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd client
cp .env.example .env
npm install
npm run build     # Verify production bundle
npm run dev       # Vite server runs on http://localhost:5173
```

### Pre-Seeded Demo Accounts
For rapid evaluation during the hackathon, the system seeds 3 demo users on boot:
- **Admin**: `admin@brightloop.com` / `Admin@12345!`
- **Staff**: `staff@brightloop.com` / `Staff@12345!`
- **Customer**: `customer@brightloop.com` / `Customer@12345!`

---

## 8. Integration Guidelines for Team Members

1. **Member 2 (Products & Plans)**:
   - Branch: `feature/products-plans`
   - Implement `server/models/Product.js`, `server/models/Plan.js`
   - Implement `server/controllers/productController.js`, `server/controllers/planController.js`
   - Connect routes under `/api/products` and `/api/plans` using `authenticateUser` and `authorizeRoles('admin', 'staff')`.
   - Update `client/src/pages/products/` and `client/src/pages/plans/`.

2. **Member 3 (Subscriptions & Invoices)**:
   - Branch: `feature/subscriptions-invoices`
   - Implement `server/models/Subscription.js`, `server/models/Invoice.js`
   - Implement quotation creation, lifecycle updates, and automated invoice calculation.
   - Enforce customer scoping: If `req.user.role === 'customer'`, filter `customer: req.user._id`.
   - Connect routes under `/api/subscriptions` and `/api/invoices`.

3. **Member 4 (Payments, Discounts & Analytics)**:
   - Branch: `feature/payments-analytics`
   - Implement `server/models/Payment.js`, `server/models/Discount.js`
   - Connect `/api/payments`, `/api/discounts`, and `/api/dashboard/stats`.
   - Admin-only discount rules creation with validity and usage limit tracking.

4. **Member 1 (Integration Coordinator)**:
   - Coordinates merge requests into `main` after verifying route consistency, response formats, and zero regressions.
