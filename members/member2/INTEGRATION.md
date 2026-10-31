# MEMBER 2: INTEGRATION GUIDE

### How Other Modules Consume Member 2 Services

#### 1. Calculating Line Pricing & Variants in Quotations & Subscriptions (Member 3)
```typescript
import { ProductService, TaxService, DiscountService } from '../../members/member2/backend/index.js';

// Get dynamic unit price with variant modifier (adds +560 for Odoo brand automatically)
const unitPrice = await ProductService.calculatePrice(productId, variantId);

// Calculate tax amount
const taxAmount = await TaxService.calculateTaxAmount(taxId, taxableAmount);

// Validate discount code & calculate discount
const discountResult = await DiscountService.validateAndCalculate({
  code: 'STARTUP20',
  subtotal,
  totalQuantity,
});
```

#### 2. Re-using Product & Plan Pages in Main Routes
```tsx
import {
  ProductsPage,
  ProductDetailsPage,
  PlansPage,
  TaxManagementPage,
  DiscountManagementPage
} from '../../members/member2/frontend/index.js';
```
