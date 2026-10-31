# MEMBER 1: API DOCUMENTATION

### Base Route: `/api/v1/auth` & `/api/v1/users`

#### 1. Customer Registration
- **Endpoint**: `POST /api/v1/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "customer@acme.com",
    "password": "SecurePassword@123",
    "name": "Bruce Wayne",
    "phone": "+91 98765 43212",
    "companyName": "Acme Software Labs",
    "address": "100 Tech Park",
    "city": "Bengaluru",
    "state": "Karnataka",
    "zipCode": "560103",
    "country": "India",
    "taxId": "29ABCDE1234F1Z5"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Registration successful.",
    "data": {
      "user": { "id": "usr-xxx", "email": "customer@acme.com", "role": "CUSTOMER" },
      "customerProfile": { "id": "prof-xxx", "companyName": "Acme Software Labs" },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### 2. User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**: `{ "email": "admin@brightloop.io", "password": "Admin@12345" }`
- **Response** (200 OK): Contains user profile and signed JWT token.

#### 3. Forgot Password
- **Endpoint**: `POST /api/v1/auth/forgot-password`
- **Request Body**: `{ "email": "user@example.com" }`
- **Response** (200 OK): Issues time-limited cryptographic token.

#### 4. Reset Password
- **Endpoint**: `POST /api/v1/auth/reset-password`
- **Request Body**: `{ "token": "xxx", "password": "NewSecure@Password123" }`

#### 5. Create Staff (Admin Only)
- **Endpoint**: `POST /api/v1/users/staff`
- **Headers**: `Authorization: Bearer <AdminToken>`
- **Request Body**: `{ "email": "staff@brightloop.io", "password": "Staff@12345", "name": "Alex Vance" }`
