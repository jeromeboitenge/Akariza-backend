# Akariza API Guide - Complete Examples

## 🔐 Authentication Flow

### Step 1: Login
**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "jeromeboitenge@gmail.com",
  "password": "Password12!"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email",
  "requiresOtp": true,
  "userId": "f2707400-d110-4963-9aa3-3fe5f171c756",
  "userType": "admin"
}
```

**Action:** Check your email (including spam folder) for a 6-digit OTP code.

---

### Step 2: Verify OTP
**Endpoint:** `POST /auth/verify-otp`

**Request:**
```json
{
  "userId": "f2707400-d110-4963-9aa3-3fe5f171c756",
  "otpCode": "123456",
  "userType": "admin"
}
```

**Where to get values:**
- `userId` → From Step 1 response
- `otpCode` → From your email (6 digits)
- `userType` → From Step 1 response

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "f2707400-d110-4963-9aa3-3fe5f171c756",
    "email": "jeromeboitenge@gmail.com",
    "fullName": "Jerome Boitenge",
    "role": "SYSTEM_ADMIN"
  }
}
```

**Action:** Save the `accessToken` - you'll need it for all other API calls.

---

### Step 3: Use Access Token
For all protected endpoints, add this header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example with curl:**
```bash
curl -X GET "https://akariza-backend.onrender.com/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📦 Products API

### Create Product
**Endpoint:** `POST /products`  
**Roles:** BOSS, MANAGER, SYSTEM_ADMIN

**Request:**
```json
{
  "name": "Coca Cola 500ml",
  "description": "Soft drink",
  "sku": "COKE-500",
  "barcode": "1234567890123",
  "category": "BEVERAGES",
  "unitPrice": 500,
  "costPrice": 350,
  "minStockLevel": 50,
  "supplierId": "supplier-uuid-here"
}
```

### Get All Products
**Endpoint:** `GET /products`  
**Roles:** All authenticated users

**Response:**
```json
[
  {
    "id": "product-uuid",
    "name": "Coca Cola 500ml",
    "sku": "COKE-500",
    "unitPrice": 500,
    "currentStock": 100,
    "minStockLevel": 50
  }
]
```

---

## 💰 Sales API

### Create Sale (Cash Payment)
**Endpoint:** `POST /sales`  
**Roles:** CASHIER, MANAGER, BOSS, SYSTEM_ADMIN

**Request (No customer needed for cash):**
```json
{
  "items": [
    {
      "productId": "product-uuid-here",
      "quantity": 2,
      "unitPrice": 500
    }
  ],
  "paymentMethod": "CASH",
  "amountPaid": 1000,
  "notes": "Quick sale"
}
```

**Response:**
```json
{
  "id": "sale-uuid",
  "totalAmount": 1000,
  "amountPaid": 1000,
  "changeAmount": 0,
  "paymentStatus": "PAID",
  "paymentMethod": "CASH"
}
```

### Create Sale (Credit - Customer Required)
**Request:**
```json
{
  "customerId": "customer-uuid-here",
  "items": [
    {
      "productId": "product-uuid-here",
      "quantity": 5,
      "unitPrice": 500
    }
  ],
  "paymentMethod": "CASH",
  "amountPaid": 1000,
  "notes": "Partial payment"
}
```

**Response:**
```json
{
  "id": "sale-uuid",
  "totalAmount": 2500,
  "amountPaid": 1000,
  "changeAmount": 0,
  "paymentStatus": "PARTIAL",
  "paymentMethod": "CASH",
  "customer": {
    "id": "customer-uuid",
    "fullName": "John Doe"
  }
}
```

---

## 💸 Expenses API

### Create Expense
**Endpoint:** `POST /expenses`  
**Roles:** CASHIER, MANAGER, BOSS, SYSTEM_ADMIN

**Request (Existing Category):**
```json
{
  "category": "TRANSPORT",
  "amount": 5000,
  "description": "Taxi to supplier",
  "date": "2026-02-27"
}
```

**Request (Custom Category):**
```json
{
  "category": "OTHER",
  "customCategory": "Office Snacks",
  "amount": 10000,
  "description": "Tea and biscuits for staff",
  "date": "2026-02-27"
}
```

**Response:**
```json
{
  "id": "expense-uuid",
  "category": "TRANSPORT",
  "amount": 5000,
  "description": "Taxi to supplier",
  "createdBy": {
    "fullName": "Jerome Boitenge"
  }
}
```

### Get Expense Categories
**Endpoint:** `GET /expenses/categories`

**Response:**
```json
{
  "defaultCategories": [
    "RENT",
    "UTILITIES",
    "SALARIES",
    "TRANSPORT",
    "SUPPLIES",
    "MAINTENANCE",
    "MARKETING",
    "INSURANCE",
    "TAXES",
    "OTHER"
  ],
  "customCategories": [
    {
      "id": "category-uuid",
      "name": "Office Snacks"
    }
  ]
}
```

---

## 💬 Messages API

### Send Message
**Endpoint:** `POST /messages`  
**Roles:** CASHIER, MANAGER, BOSS, SYSTEM_ADMIN

**Request (To specific user):**
```json
{
  "targetType": "USER",
  "targetUserId": "user-uuid-here",
  "subject": "Stock Update",
  "content": "Please check the inventory for Coca Cola"
}
```

**Request (To all in branch - Cashier/Manager):**
```json
{
  "targetType": "BRANCH",
  "subject": "Branch Meeting",
  "content": "Team meeting at 3 PM today"
}
```

**Request (To all branches - Boss only):**
```json
{
  "targetType": "ALL_BRANCHES",
  "subject": "Company Announcement",
  "content": "New policy effective next month"
}
```

---

## 👥 Users API

### Create User
**Endpoint:** `POST /users`  
**Roles:** BOSS, SYSTEM_ADMIN

**Request:**
```json
{
  "email": "cashier@example.com",
  "fullName": "Jane Doe",
  "phone": "+250788123456",
  "role": "CASHIER",
  "branchId": "branch-uuid-here",
  "password": "TempPass123!"
}
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "cashier@example.com",
  "fullName": "Jane Doe",
  "role": "CASHIER",
  "isActive": true
}
```

**Note:** User receives welcome email with temporary password.

---

## 🏢 Branches API

### Create Branch
**Endpoint:** `POST /branches`  
**Roles:** BOSS, SYSTEM_ADMIN

**Request:**
```json
{
  "name": "Downtown Branch",
  "location": "Kigali City Center",
  "phone": "+250788999888",
  "email": "downtown@akariza.com"
}
```

---

## 📊 Analytics API

### Get Dashboard Stats
**Endpoint:** `GET /analytics/dashboard`  
**Roles:** MANAGER, BOSS, SYSTEM_ADMIN

**Response:**
```json
{
  "todaySales": {
    "count": 45,
    "revenue": 450000
  },
  "lowStockProducts": 3,
  "pendingOrders": 5,
  "activeUsers": 12
}
```

---

## 🔄 Common Patterns

### Pagination
Most list endpoints support pagination:
```
GET /products?page=1&limit=10
```

### Filtering by Date
```
GET /sales?startDate=2026-02-01&endDate=2026-02-28
```

### Search
```
GET /products?search=coca
```

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "email must be a valid email"
  ]
}
```

---

## 🚀 Quick Start with Postman

1. **Import Base URL:** `https://akariza-backend.onrender.com`
2. **Login:** POST `/auth/login` with email & password
3. **Get OTP:** Check your email
4. **Verify OTP:** POST `/auth/verify-otp` with userId, otpCode, userType
5. **Save Token:** Copy `accessToken` from response
6. **Set Authorization:** Add header `Authorization: Bearer <accessToken>`
7. **Make Requests:** Now you can call any protected endpoint

---

## 📝 Notes

- **Access Token expires in 15 minutes** - Use refresh token to get new one
- **OTP expires in 5 minutes** - Request new login if expired
- **Check spam folder** - OTP emails might go to spam
- **Rate Limits:** Login (5/min), OTP verification (3/min), General (100/min)

---

**API Documentation:** https://akariza-backend.onrender.com/api  
**Base URL:** https://akariza-backend.onrender.com
