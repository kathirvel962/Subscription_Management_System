# MEMBER 1: INTEGRATION GUIDE

### How Other Modules Consume Member 1

#### 1. Protecting Backend Routes
To protect any route with authentication or role restrictions in your module, import `authMiddleware` and `roleMiddleware` from Member 1:

```typescript
import { authMiddleware, roleMiddleware } from '../../members/member1/backend/index.js';

router.use(authMiddleware);
router.post('/admin-only', roleMiddleware('ADMIN'), myController.action);
router.get('/staff-or-admin', roleMiddleware(['ADMIN', 'STAFF']), myController.action);
```

#### 2. Accessing Authenticated User Info
In your controllers:
```typescript
import { AuthenticatedRequest } from '../../members/member1/backend/index.js';

export async function myAction(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  const role = req.user?.role;
  const customerProfileId = req.user?.customerProfileId; // Available if role is CUSTOMER
  // ...
}
```

#### 3. Protecting Frontend Routes
In your React routes configuration:
```tsx
import { ProtectedRoute } from '../../members/member1/frontend/index.js';

<Route
  path="/admin/products"
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
      <ProductsPage />
    </ProtectedRoute>
  }
/>
```
