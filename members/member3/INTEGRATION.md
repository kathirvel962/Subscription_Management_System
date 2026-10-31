# MEMBER 3: INTEGRATION GUIDE

### How Other Modules Consume Member 3 Services

#### 1. Consuming Active Subscriptions in Recurring Billing (Member 4)
Member 4 queries active subscriptions to run scheduled recurring billing:
```typescript
import { SubscriptionService } from '../../members/member3/backend/index.js';

// Retrieve all subscriptions in 'ACTIVE' status
const activeSubscriptions = await SubscriptionService.getSubscriptions({
  status: 'ACTIVE',
});
```

#### 2. Re-using Subscription Pages in Routes
```tsx
import {
  QuotationsPage,
  QuotationTemplatesPage,
  CreateQuotationPage,
  SubscriptionsPage,
  CreateSubscriptionPage,
  SubscriptionDetailsPage,
} from '../../members/member3/frontend/index.js';
```
