# API CONTRACTS SPECIFICATION
## Base URL: `/api/v1`

All responses follow the unified envelope:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... },
  "error": "Error message if success is false",
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

---

### MEMBER 1 — AUTH & USER MANAGEMENT

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Customer self-registration |
| POST | `/api/v1/auth/login` | Public | Login with email and password |
| POST | `/api/v1/auth/logout` | Authenticated | Invalidate/clear session |
| POST | `/api/v1/auth/forgot-password` | Public | Generate password reset token |
| POST | `/api/v1/auth/reset-password` | Public | Set new password with token |
| GET | `/api/v1/auth/me` | Authenticated | Current user & profile info |
| GET | `/api/v1/users` | Admin, Staff | List users (paginated, searchable) |
| POST | `/api/v1/users/staff` | Admin | Create staff user account |
| GET | `/api/v1/users/:id` | Admin, Self | Get specific user details |
| PATCH | `/api/v1/users/:id` | Admin, Self | Update user/profile details |
| GET | `/api/v1/users/customers` | Admin, Staff | List customers with profile info |

---

### MEMBER 2 — CATALOG, PLANS, TAXES & DISCOUNTS

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/products` | Authenticated | List all products with variants |
| POST | `/api/v1/products` | Admin, Staff | Create a new product |
| GET | `/api/v1/products/:id` | Authenticated | Get product by ID with variants |
| PATCH | `/api/v1/products/:id` | Admin, Staff | Update product and variants |
| DELETE | `/api/v1/products/:id` | Admin | Delete/archive product |
| GET | `/api/v1/plans` | Authenticated | List subscription plans |
| POST | `/api/v1/plans` | Admin, Staff | Create subscription plan |
| GET | `/api/v1/plans/:id` | Authenticated | Get plan details |
| PATCH | `/api/v1/plans/:id` | Admin, Staff | Update plan configuration |
| GET | `/api/v1/taxes` | Authenticated | List tax rules |
| POST | `/api/v1/taxes` | Admin | Create tax rule |
| PATCH | `/api/v1/taxes/:id` | Admin | Update tax rule |
| GET | `/api/v1/discounts` | Authenticated | List discount rules |
| POST | `/api/v1/discounts` | Admin | Create discount rule |
| PATCH | `/api/v1/discounts/:id` | Admin | Update discount rule |
| POST | `/api/v1/discounts/validate` | Authenticated | Validate discount eligibility |

---

### MEMBER 3 — QUOTATIONS & SUBSCRIPTIONS

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/quotation-templates` | Admin, Staff | List quotation templates |
| POST | `/api/v1/quotation-templates` | Admin, Staff | Create quotation template |
| GET | `/api/v1/quotations` | Admin, Staff, Customer | List quotations |
| POST | `/api/v1/quotations` | Admin, Staff | Create quotation from template/custom |
| GET | `/api/v1/quotations/:id` | Admin, Staff, Customer | Get quotation details |
| POST | `/api/v1/quotations/:id/confirm` | Admin, Staff, Customer | Confirm quotation into subscription |
| GET | `/api/v1/subscriptions` | Admin, Staff, Customer | List subscriptions (filtered by customer for Customer role) |
| POST | `/api/v1/subscriptions` | Admin, Staff | Create subscription directly |
| GET | `/api/v1/subscriptions/:id` | Admin, Staff, Customer | Get subscription details with history |
| PATCH | `/api/v1/subscriptions/:id/status`| Admin, Staff | Transition subscription status |
| POST | `/api/v1/subscriptions/:id/pause` | Admin, Staff | Pause subscription |
| POST | `/api/v1/subscriptions/:id/resume`| Admin, Staff | Resume paused subscription |
| POST | `/api/v1/subscriptions/:id/renew` | Admin, Staff | Renew subscription |
| POST | `/api/v1/subscriptions/:id/close` | Admin, Staff | Early close subscription |

---

### MEMBER 4 — BILLING, INVOICES, PAYMENTS & FINANCE

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/billing/trigger` | Admin, Staff | Manually execute recurring billing cycle |
| GET | `/api/v1/invoices` | Admin, Staff, Customer | List invoices (filtered by customer for Customer role) |
| POST | `/api/v1/invoices` | Admin, Staff | Manually create invoice |
| GET | `/api/v1/invoices/:id` | Admin, Staff, Customer | Get invoice details |
| POST | `/api/v1/invoices/:id/confirm` | Admin, Staff | Confirm draft invoice |
| POST | `/api/v1/invoices/:id/cancel` | Admin, Staff | Cancel invoice |
| GET | `/api/v1/invoices/:id/pdf` | Admin, Staff, Customer | Stream/download invoice PDF |
| GET | `/api/v1/payments` | Admin, Staff, Customer | List payments |
| POST | `/api/v1/payments` | Admin, Staff | Record payment against invoice |
| GET | `/api/v1/dashboard/overview` | Admin, Staff | Live financial KPI metrics & charts |
| GET | `/api/v1/dashboard/revenue` | Admin, Staff | Historical revenue & MRR trends |
| GET | `/api/v1/dashboard/overdue` | Admin, Staff | Overdue invoices list and aging |
