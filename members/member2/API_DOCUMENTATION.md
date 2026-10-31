# MEMBER 2: API DOCUMENTATION

### Base Routes:
- `/api/v1/products`
- `/api/v1/plans`
- `/api/v1/taxes`
- `/api/v1/discounts`

#### 1. Products & Variants
- `GET /api/v1/products`: List products with variants. Supports `?search=&type=&isActive=`.
- `POST /api/v1/products`: Create a product with optional variants.
  ```json
  {
    "name": "Software Package",
    "type": "SOFTWARE",
    "salesPrice": 1200,
    "costPrice": 400,
    "variants": [
      { "name": "Basic", "priceModifier": 0 },
      { "name": "Odoo Brand", "priceModifier": 560 }
    ]
  }
  ```
- `PATCH /api/v1/products/:id`: Update product info.
- `DELETE /api/v1/products/:id`: Archive product (Admin only).
- `POST /api/v1/products/:id/variants`: Add a new variant to a product.

#### 2. Subscription Plans
- `GET /api/v1/plans`: List plans. Supports `?frequency=`.
- `POST /api/v1/plans`: Create plan.
  ```json
  {
    "name": "Monthly Pro",
    "productId": "prod-1",
    "billingFrequency": "MONTHLY",
    "basePrice": 1200,
    "minQuantity": 1,
    "earlyClosureAllowed": true,
    "pauseAllowed": true,
    "renewalAllowed": true,
    "autoClose": false
  }
  ```

#### 3. Taxes
- `GET /api/v1/taxes`: List taxes.
- `POST /api/v1/taxes`: Create tax (Admin only).
  ```json
  { "name": "GST 18%", "rate": 18.0 }
  ```

#### 4. Discounts
- `GET /api/v1/discounts`: List discount rules.
- `POST /api/v1/discounts`: Create discount rule (Admin only).
- `POST /api/v1/discounts/validate`: Validate code and calculate discount amount.
  ```json
  { "code": "STARTUP20", "subtotal": 3520, "totalQuantity": 2 }
  ```
