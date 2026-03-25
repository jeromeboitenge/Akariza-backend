# 🚀 Akariza API v1 - Quick Reference

## Base URL
```
http://localhost:5000/api/v1
```

## 📚 API Documentation
```
http://localhost:5000/api/v1/docs
```

---

## 🔐 Authentication

### Single Login Endpoint (All Users)
```bash
POST /api/v1/auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "xxx",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "BOSS|MANAGER|CASHIER|SYSTEM_ADMIN",
    "organizationId": "xxx"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Test Credentials
```bash
# System Admin
email: admin@akariza.com
password: admin123

# Boss
email: boss@store.com
password: boss123

# Manager
email: manager@store.com
password: manager123

# Cashier
email: cashier@store.com
password: cashier123
```

---

## 📋 Main Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login (all users)
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Organizations (SYSTEM_ADMIN only)
- `GET /api/v1/organizations` - List all organizations
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations/:id` - Get organization
- `PATCH /api/v1/organizations/:id` - Update organization
- `DELETE /api/v1/organizations/:id` - Delete organization

### Users (BOSS only)
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Products (All roles)
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product (BOSS, MANAGER)
- `GET /api/v1/products/low-stock` - Low stock products
- `GET /api/v1/products/:id` - Get product
- `PATCH /api/v1/products/:id` - Update product (BOSS, MANAGER)
- `DELETE /api/v1/products/:id` - Delete product (BOSS, MANAGER)

### Sales (All roles)
- `GET /api/v1/sales` - List sales
- `POST /api/v1/sales` - Create sale
- `GET /api/v1/sales/my-sales` - My sales (CASHIER)
- `GET /api/v1/sales/:id` - Get sale

### Purchases (BOSS, MANAGER, CASHIER)
- `GET /api/v1/purchases` - List purchases
- `POST /api/v1/purchases` - Create purchase
- `GET /api/v1/purchases/:id` - Get purchase

### Stock Management
- `GET /api/v1/stock/transactions` - Stock history
- `POST /api/v1/stock/adjust` - Adjust stock (BOSS, MANAGER)
- `GET /api/v1/stock/valuation` - Stock valuation

### Reports
- `GET /api/v1/reports/sales/daily?date=YYYY-MM-DD` - Daily sales
- `GET /api/v1/reports/sales/monthly?month=YYYY-MM` - Monthly sales
- `GET /api/v1/reports/profit?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Profit report
- `GET /api/v1/reports/best-selling?limit=10` - Best selling products
- `GET /api/v1/reports/low-stock` - Low stock report

### Suppliers
- `GET /api/v1/suppliers` - List suppliers
- `POST /api/v1/suppliers` - Create supplier
- `GET /api/v1/suppliers/:id` - Get supplier
- `PATCH /api/v1/suppliers/:id` - Update supplier
- `DELETE /api/v1/suppliers/:id` - Delete supplier

### Branches
- `GET /api/v1/branches` - List branches
- `POST /api/v1/branches` - Create branch
- `GET /api/v1/branches/:id` - Get branch
- `GET /api/v1/branches/:id/inventory` - Branch inventory
- `POST /api/v1/branches/transfer` - Create stock transfer
- `POST /api/v1/branches/transfer/:id/approve` - Approve transfer

### Customers
- `GET /api/v1/customers` - List customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/:id` - Get customer
- `POST /api/v1/customers/:id/loyalty/add` - Add loyalty points
- `POST /api/v1/customers/:id/loyalty/redeem` - Redeem points

### Employees
- `GET /api/v1/employees` - List employees
- `POST /api/v1/employees` - Create employee
- `POST /api/v1/employees/:id/attendance` - Record attendance
- `POST /api/v1/employees/:id/targets` - Set sales target

### Other Modules
- Promotions: `/api/v1/promotions`
- Purchase Orders: `/api/v1/purchase-orders`
- Expenses: `/api/v1/expenses`
- Notifications: `/api/v1/notifications`
- Tasks: `/api/v1/tasks`
- Messages: `/api/v1/messages`
- Analytics: `/api/v1/analytics`

---

## 🔑 Using the API

### 1. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"boss@store.com","password":"boss123"}'
```

### 2. Use Token
```bash
curl -X GET http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 Role Permissions

| Endpoint | ADMIN | BOSS | MANAGER | CASHIER |
|----------|-------|------|---------|---------|
| /organizations | ✅ | ❌ | ❌ | ❌ |
| /users | ❌ | ✅ | ❌ | ❌ |
| /products | ❌ | ✅ | ✅ | ✅ (read) |
| /sales | ❌ | ✅ | ✅ | ✅ |
| /purchases | ❌ | ✅ | ✅ | ✅ |
| /reports | ❌ | ✅ | ✅ | ✅ |
| /branches | ❌ | ✅ | ✅ | ❌ |

---

## ✅ Changes Made

1. ✅ Single login endpoint for all users: `/api/v1/auth/login`
2. ✅ API prefix changed to `/api/v1`
3. ✅ No user type in endpoint paths
4. ✅ Role-based access control via JWT token
5. ✅ Swagger docs at `/api/v1/docs`

---

## 🚀 Quick Test

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"boss@store.com","password":"boss123"}' | jq -r '.accessToken')

# Get products
curl -X GET http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer $TOKEN"

# Create sale
curl -X POST http://localhost:5000/api/v1/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId":"xxx","quantity":2,"sellingPrice":1500}],
    "paymentMethod":"CASH"
  }'
```

🎉 All users now login through the same endpoint!
