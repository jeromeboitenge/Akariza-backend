# Akariza Backend - Complete API Endpoints

**Base URL:** `http://localhost:5000/api/v1`  
**Documentation:** `http://localhost:5000/api/v1/docs`

## Authentication Endpoints

### POST /auth/login
Login for all user types (Admin, Boss, Manager, Cashier)
- **Public:** Yes
- **Body:** `{ email, password }`
- **Returns:** `{ user, accessToken, refreshToken }`

### POST /auth/refresh
Refresh access token
- **Public:** Yes
- **Body:** `{ refreshToken }`
- **Returns:** `{ accessToken }`

### POST /auth/logout
Logout current user
- **Auth:** Required
- **Returns:** `{ message }`

---

## Organizations (SYSTEM_ADMIN only)

### GET /organizations
Get all organizations
- **Roles:** SYSTEM_ADMIN

### POST /organizations
Create new organization (auto-creates BOSS user)
- **Roles:** SYSTEM_ADMIN
- **Body:** `{ name, businessType, address, phone, email, bossData: { email, password, fullName } }`

### GET /organizations/:id
Get organization details
- **Roles:** SYSTEM_ADMIN

### PATCH /organizations/:id
Update organization
- **Roles:** SYSTEM_ADMIN
- **Body:** `{ name?, businessType?, address?, phone?, email? }`

### DELETE /organizations/:id
Deactivate organization
- **Roles:** SYSTEM_ADMIN

### PATCH /organizations/:id/activate
Activate organization
- **Roles:** SYSTEM_ADMIN

### GET /organizations/:id/stats
Get organization statistics
- **Roles:** SYSTEM_ADMIN

---

## Users (BOSS only)

### GET /users
Get all users in organization
- **Roles:** BOSS

### POST /users
Create new user
- **Roles:** BOSS
- **Body:** `{ email, password, fullName, role, branchId? }`

### GET /users/:id
Get user details
- **Roles:** BOSS

### PATCH /users/:id
Update user
- **Roles:** BOSS
- **Body:** `{ email?, fullName?, role?, branchId? }`

### DELETE /users/:id
Deactivate user
- **Roles:** BOSS

---

## Products

### GET /products
Get all products
- **Roles:** All authenticated

### POST /products
Create new product
- **Roles:** BOSS, MANAGER
- **Body:** `{ name, sku, category, unit, costPrice, sellingPrice, currentStock?, minStockLevel?, ... }`

### GET /products/:id
Get product details
- **Roles:** All authenticated

### PATCH /products/:id
Update product
- **Roles:** BOSS, MANAGER
- **Body:** `{ name?, costPrice?, sellingPrice?, ... }`

### DELETE /products/:id
Deactivate product
- **Roles:** BOSS, MANAGER

### GET /products/low-stock
Get products below minimum stock level
- **Roles:** BOSS, MANAGER

---

## Sales

### GET /sales
Get all sales
- **Roles:** All authenticated

### POST /sales
Create new sale (deducts stock)
- **Roles:** All authenticated
- **Body:** `{ items: [{ productId, quantity, sellingPrice }], paymentMethod, customerName?, customerId? }`

### GET /sales/:id
Get sale details with items
- **Roles:** All authenticated

### GET /sales/my-sales
Get current user's sales
- **Roles:** All authenticated

---

## Purchases

### GET /purchases
Get all purchases
- **Roles:** BOSS, MANAGER

### POST /purchases
Create new purchase (adds stock)
- **Roles:** BOSS, MANAGER
- **Body:** `{ supplierId, items: [{ productId, quantity, costPrice }], paymentStatus?, amountPaid?, notes? }`

### GET /purchases/:id
Get purchase details with items
- **Roles:** BOSS, MANAGER

---

## Stock

### GET /stock/transactions
Get stock transaction history
- **Roles:** BOSS, MANAGER
- **Query:** `productId?`

### POST /stock/adjust
Manual stock adjustment
- **Roles:** BOSS, MANAGER
- **Body:** `{ productId, quantity, notes }`

### GET /stock/valuation
Get total stock valuation
- **Roles:** BOSS, MANAGER

---

## Suppliers

### GET /suppliers
Get all suppliers
- **Roles:** BOSS, MANAGER

### POST /suppliers
Create new supplier
- **Roles:** BOSS, MANAGER
- **Body:** `{ name, contactPerson, phone, email?, address }`

### GET /suppliers/:id
Get supplier details
- **Roles:** BOSS, MANAGER

### PATCH /suppliers/:id
Update supplier
- **Roles:** BOSS, MANAGER

### DELETE /suppliers/:id
Deactivate supplier
- **Roles:** BOSS, MANAGER

---

## Customers

### GET /customers
Get all customers
- **Roles:** All authenticated

### POST /customers
Create new customer
- **Roles:** All authenticated
- **Body:** `{ name, phone, email?, address?, customerType? }`

### GET /customers/:id
Get customer details
- **Roles:** All authenticated

### PATCH /customers/:id
Update customer
- **Roles:** All authenticated

### DELETE /customers/:id
Deactivate customer
- **Roles:** BOSS, MANAGER

### GET /customers/:id/purchases
Get customer purchase history
- **Roles:** All authenticated

---

## Branches

### GET /branches
Get all branches
- **Roles:** BOSS, MANAGER

### POST /branches
Create new branch
- **Roles:** BOSS
- **Body:** `{ name, address, phone, managerId? }`

### GET /branches/:id
Get branch details
- **Roles:** BOSS, MANAGER

### PATCH /branches/:id
Update branch
- **Roles:** BOSS

### DELETE /branches/:id
Deactivate branch
- **Roles:** BOSS

### GET /branches/:id/inventory
Get branch inventory
- **Roles:** BOSS, MANAGER

### POST /branches/:id/transfer
Transfer stock between branches
- **Roles:** BOSS, MANAGER
- **Body:** `{ productId, quantity, toBranchId, notes? }`

---

## Employees

### GET /employees
Get all employees
- **Roles:** BOSS, MANAGER

### POST /employees
Create new employee
- **Roles:** BOSS, MANAGER
- **Body:** `{ userId, position, salary, hireDate, ... }`

### GET /employees/:id
Get employee details
- **Roles:** BOSS, MANAGER

### PATCH /employees/:id
Update employee
- **Roles:** BOSS, MANAGER

### DELETE /employees/:id
Deactivate employee
- **Roles:** BOSS

---

## Reports

### GET /reports/sales
Sales report
- **Roles:** BOSS, MANAGER
- **Query:** `startDate, endDate`

### GET /reports/purchases
Purchases report
- **Roles:** BOSS, MANAGER
- **Query:** `startDate, endDate`

### GET /reports/stock
Stock report
- **Roles:** BOSS, MANAGER

### GET /reports/profit
Profit/loss report
- **Roles:** BOSS
- **Query:** `startDate, endDate`

---

## Analytics

### GET /analytics/dashboard
Dashboard metrics
- **Roles:** BOSS, MANAGER

### GET /analytics/sales-trends
Sales trends over time
- **Roles:** BOSS, MANAGER
- **Query:** `period` (daily, weekly, monthly)

### GET /analytics/top-products
Top selling products
- **Roles:** BOSS, MANAGER
- **Query:** `limit?`

### GET /analytics/low-stock-alerts
Products needing reorder
- **Roles:** BOSS, MANAGER

---

## Expenses

### GET /expenses
Get all expenses
- **Roles:** BOSS, MANAGER

### POST /expenses
Create new expense
- **Roles:** BOSS, MANAGER
- **Body:** `{ category, amount, description, date }`

### GET /expenses/:id
Get expense details
- **Roles:** BOSS, MANAGER

### PATCH /expenses/:id
Update expense
- **Roles:** BOSS, MANAGER

### DELETE /expenses/:id
Delete expense
- **Roles:** BOSS

---

## Promotions

### GET /promotions
Get all promotions
- **Roles:** All authenticated

### POST /promotions
Create new promotion
- **Roles:** BOSS, MANAGER
- **Body:** `{ name, discountType, discountValue, startDate, endDate, productIds? }`

### GET /promotions/:id
Get promotion details
- **Roles:** All authenticated

### PATCH /promotions/:id
Update promotion
- **Roles:** BOSS, MANAGER

### DELETE /promotions/:id
Delete promotion
- **Roles:** BOSS

---

## Purchase Orders

### GET /purchase-orders
Get all purchase orders
- **Roles:** BOSS, MANAGER

### POST /purchase-orders
Create new purchase order
- **Roles:** BOSS, MANAGER
- **Body:** `{ supplierId, items: [{ productId, quantity, expectedPrice }], expectedDate }`

### GET /purchase-orders/:id
Get purchase order details
- **Roles:** BOSS, MANAGER

### PATCH /purchase-orders/:id
Update purchase order
- **Roles:** BOSS, MANAGER

### POST /purchase-orders/:id/receive
Receive purchase order (converts to purchase)
- **Roles:** BOSS, MANAGER

---

## Tasks

### GET /tasks
Get all tasks
- **Roles:** All authenticated

### POST /tasks
Create new task
- **Roles:** BOSS, MANAGER
- **Body:** `{ title, description, assignedToId, dueDate, priority }`

### GET /tasks/:id
Get task details
- **Roles:** All authenticated

### PATCH /tasks/:id
Update task
- **Roles:** All authenticated

### DELETE /tasks/:id
Delete task
- **Roles:** BOSS, MANAGER

### PATCH /tasks/:id/complete
Mark task as complete
- **Roles:** All authenticated

---

## Messages

### GET /messages
Get user messages
- **Roles:** All authenticated

### POST /messages
Send message
- **Roles:** All authenticated
- **Body:** `{ receiverId?, message }`

### GET /messages/unread
Get unread messages count
- **Roles:** All authenticated

### PATCH /messages/:id/read
Mark message as read
- **Roles:** All authenticated

### GET /messages/org-chat
Get organization-wide messages
- **Roles:** All authenticated

### GET /messages/conversation/:userId
Get conversation with specific user
- **Roles:** All authenticated

---

## Notifications

### GET /notifications
Get user notifications
- **Roles:** All authenticated

### GET /notifications/unread
Get unread notifications
- **Roles:** All authenticated

### PATCH /notifications/:id/read
Mark notification as read
- **Roles:** All authenticated

### DELETE /notifications/:id
Delete notification
- **Roles:** All authenticated

---

## Sync (Mobile App)

### POST /sync/upload
Upload offline data from mobile
- **Roles:** All authenticated
- **Body:** `{ sales: [], purchases: [], ... }`

### GET /sync/download
Download latest data for mobile
- **Roles:** All authenticated
- **Query:** `lastSyncTime?`

### GET /sync/status
Get sync status
- **Roles:** All authenticated

---

## Response Formats

### Success Response
```json
{
  "id": "uuid",
  "name": "Product Name",
  ...
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### List Response
```json
[
  { "id": "1", ... },
  { "id": "2", ... }
]
```

---

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <access_token>
```

Token expires in 15 minutes. Use refresh token to get new access token.

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

---

## Pagination

List endpoints return up to 100 items by default. Pagination can be added if needed.
