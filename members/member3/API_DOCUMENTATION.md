# MEMBER 3: API DOCUMENTATION

### Base Routes:
- `/api/v1/quotation-templates`
- `/api/v1/quotations`
- `/api/v1/subscriptions`

#### 1. Quotation Templates
- `GET /api/v1/quotation-templates`: List templates.
- `POST /api/v1/quotation-templates`: Create quotation template.
  ```json
  {
    "name": "Standard Onboarding",
    "planId": "plan-1",
    "validityDays": 30,
    "lines": [
      { "productId": "prod-1", "variantId": "var-2", "quantity": 1, "unitPrice": 1760 }
    ]
  }
  ```

#### 2. Quotations
- `GET /api/v1/quotations`: List quotations (automatically filtered by customer for Customer role).
- `POST /api/v1/quotations`: Create quotation.
- `POST /api/v1/quotations/:id/confirm`: Convert quotation to subscription.

#### 3. Subscriptions
- `GET /api/v1/subscriptions`: List subscriptions. Supports `?status=`.
- `POST /api/v1/subscriptions`: Create subscription directly.
- `GET /api/v1/subscriptions/:id`: Subscription details with status history and related invoices.
- `PATCH /api/v1/subscriptions/:id/status`: Transition status. Body: `{ "status": "ACTIVE", "reason": "Approved" }`
- `POST /api/v1/subscriptions/:id/pause`: Pause active subscription.
- `POST /api/v1/subscriptions/:id/resume`: Resume paused subscription.
- `POST /api/v1/subscriptions/:id/renew`: Renew subscription contract.
- `POST /api/v1/subscriptions/:id/close`: Close subscription early.
