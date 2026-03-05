# Complete User Roles & Permissions Guide

## System Roles Overview

The Akariza Stock Management System has 4 distinct user roles, each with specific responsibilities and access levels:

1. **SYSTEM_ADMIN** - Platform administrator (manages all organizations)
2. **BOSS** - Organization owner (full control over their organization)
3. **MANAGER** - Branch/department manager (inventory & operations)
4. **CASHIER** - Sales personnel (point of sale operations)

---

## 1. SYSTEM_ADMIN (Platform Administrator)

### Description
The highest-level administrator who manages the entire platform, creates organizations, and has access to all data across all organizations.

### Primary Responsibilities
- Create and manage organizations
- Monitor system-wide performance
- Access cross-organization analytics
- Manage all branches and users across organizations
- System-wide reporting and oversight
- Platform maintenance and configuration

### Dashboard Access
- **Main Dashboard:** `GET /dashboard` - Shows BOSS-level dashboard
- **Admin Dashboard:** `GET /admin/dashboard/*` - System-wide analytics

### Exclusive Endpoints (SYSTEM_ADMIN Only)

#### Organizations Management
```
POST   /organizations                    - Create new organization
GET    /organizations                    - List all organizations
GET    /organizations/:id                - Get organization details
PATCH  /organizations/:id                - Update organization
DELETE /organizations/:id                - Deactivate organization
PATCH  /organizations/:id/activate       - Activate organization
GET    /organizations/:id/stats          - Organization statistics
```

#### Admin Dashboard
```
GET    /admin/dashboard/overview                  - System-wide overview
GET    /admin/dashboard/organizations/stats       - All organizations stats
GET    /admin/dashboard/organizations/:id/stats   - Specific org details
GET    /admin/dashboard/sales                     - System-wide sales
GET    /admin/dashboard/products/top-selling      - Top products across all orgs
GET    /admin/dashboard/users/activity            - User activity system-wide
GET    /admin/dashboard/branches/stats            - All branches stats
```

#### Admin Branches
```
POST   /admin/branches                   - Create branch for any organization
GET    /admin/branches                   - List all branches
PATCH  /admin/branches/:id               - Update any branch
DELETE /admin/branches/:id               - Deactivate any branch
```

### Shared Endpoints (with other roles)

All endpoints available to BOSS, MANAGER, and CASHIER are also available to SYSTEM_ADMIN.

### Special Privileges
- ✅ Bypass organization filters (see all organizations)
- ✅ Bypass branch filters (see all branches)
- ✅ Automatic access to all endpoints
- ✅ Cross-organization data access
- ✅ No organization or branch restrictions

### Default Credentials
```
Email: jeromeboitenge@gmail.com
Password: admin123
```

---

## 2. BOSS (Organization Owner)

### Description
The owner or top administrator of a specific organization. Has full control over their organization, branches, users, and all business operations.

### Primary Responsibilities
- Manage organization settings
- Create and manage branches
- Create and manage users (MANAGER, CASHIER)
- Oversee all sales, purchases, and inventory
- View organization-wide reports and analytics
- Approve purchase orders and stock transfers
- Manage employees and set targets
- Financial oversight and expense management

### Dashboard Access
```
GET /dashboard - Organization-wide dashboard with:
  - Today's sales (amount & count)
  - Monthly sales & profit
  - Growth rate
  - Inventory value
  - Customer count
  - Product count
  - Branch performance
  - Top selling products
  - Recent sales
  - Low stock alerts
```

### Full Access Endpoints

#### User Management
```
POST   /users                            - Create users (MANAGER, CASHIER)
GET    /users                            - List all users in organization
GET    /users/:id                        - Get user details
PATCH  /users/:id                        - Update user
DELETE /users/:id                        - Deactivate user
PATCH  /users/:id/reset-password        - Reset user password
```

#### Branch Management
```
POST   /branches                         - Create branch
GET    /branches                         - List all branches
GET    /branches/:id                     - Get branch details
PATCH  /branches/:id                     - Update branch
DELETE /branches/:id                     - Deactivate branch
POST   /branches/transfer/:id/approve   - Approve stock transfer
```

#### Products
```
POST   /products                         - Create product
GET    /products                         - List all products
GET    /products/:id                     - Get product details
PATCH  /products/:id                     - Update product
DELETE /products/:id                     - Deactivate product
GET    /products/low-stock               - Low stock products
GET    /products/expiring                - Expiring products
```

#### Sales
```
POST   /sales                            - Create sale
GET    /sales                            - List all sales
GET    /sales/:id                        - Get sale details
GET    /sales/stats                      - Sales statistics
```

#### Purchases
```
POST   /purchases                        - Create purchase
GET    /purchases                        - List all purchases
GET    /purchases/:id                    - Get purchase details
```

#### Purchase Orders
```
POST   /purchase-orders                  - Create purchase order
GET    /purchase-orders                  - List all purchase orders
GET    /purchase-orders/:id              - Get PO details
PATCH  /purchase-orders/:id              - Update PO
POST   /purchase-orders/:id/approve     - Approve purchase order
```

#### Suppliers
```
POST   /suppliers                        - Create supplier
GET    /suppliers                        - List all suppliers
GET    /suppliers/:id                    - Get supplier details
PATCH  /suppliers/:id                    - Update supplier
DELETE /suppliers/:id                    - Deactivate supplier
```

#### Customers
```
POST   /customers                        - Create customer
GET    /customers                        - List all customers
GET    /customers/:id                    - Get customer details
PATCH  /customers/:id                    - Update customer
DELETE /customers/:id                    - Deactivate customer
POST   /customers/:id/loyalty/add        - Add loyalty points
POST   /customers/:id/loyalty/redeem     - Redeem loyalty points
POST   /customers/:id/transactions       - Add customer transaction
```

#### Expenses
```
POST   /expenses                         - Create expense
GET    /expenses                         - List all expenses
GET    /expenses/:id                     - Get expense details
PATCH  /expenses/:id                     - Update expense
DELETE /expenses/:id                     - Delete expense
GET    /expenses/categories              - List expense categories
POST   /expenses/categories              - Create expense category
```

#### Employees
```
POST   /employees                        - Create employee
GET    /employees                        - List all employees
GET    /employees/:id                    - Get employee details
PATCH  /employees/:id                    - Update employee
POST   /employees/:id/targets            - Set sales target
GET    /employees/:id/performance        - Get performance
```

#### Stock Management
```
POST   /stock/adjust                     - Adjust stock manually
GET    /stock/transactions               - Stock transaction history
POST   /stock/transfer                   - Create stock transfer
GET    /stock/transfer/:id               - Get transfer details
```

#### Analytics & Reports
```
GET    /analytics/dashboard              - Analytics dashboard
GET    /analytics/sales                  - Sales analytics
GET    /analytics/products               - Product analytics
GET    /analytics/inventory              - Inventory analytics
GET    /reports/sales                    - Sales reports
GET    /reports/inventory                - Inventory reports
GET    /reports/profit-loss              - Profit & loss report
GET    /reports/expenses                 - Expense reports
```

#### Tasks & Collaboration
```
POST   /tasks                            - Create task
GET    /tasks                            - List all tasks
GET    /tasks/:id                        - Get task details
PATCH  /tasks/:id                        - Update task
DELETE /tasks/:id                        - Delete task
POST   /tasks/:id/comments               - Add comment
```

#### Notifications
```
GET    /notifications                    - List notifications
PATCH  /notifications/:id/read           - Mark as read
POST   /notifications/check-low-stock    - Trigger low stock check
POST   /notifications/check-expiring     - Trigger expiring check
POST   /notifications/check-debt         - Trigger debt check
POST   /notifications/check-deadlines    - Trigger deadline check
```

#### Promotions
```
POST   /promotions                       - Create promotion
GET    /promotions                       - List promotions
GET    /promotions/:id                   - Get promotion details
PATCH  /promotions/:id                   - Update promotion
DELETE /promotions/:id                   - Delete promotion
```

#### Messages
```
POST   /messages                         - Send message
GET    /messages                         - List messages
GET    /messages/:id                     - Get message details
PATCH  /messages/:id/read                - Mark as read
```

### Restrictions
- ❌ Cannot create organizations
- ❌ Cannot access other organizations' data
- ❌ Cannot access admin dashboard
- ✅ Full control within their organization

---

## 3. MANAGER (Branch/Department Manager)

### Description
Manages branch operations, inventory, and staff. Focuses on day-to-day operations, stock management, and reporting.

### Primary Responsibilities
- Manage branch inventory
- Oversee sales and purchases
- Monitor stock levels
- Create and manage products
- Handle suppliers and customers
- Generate reports
- Manage tasks and staff coordination
- Process expenses

### Dashboard Access
```
GET /dashboard - Branch-focused dashboard with:
  - Today's branch sales
  - Monthly branch sales
  - Inventory value
  - Top selling products
  - Branch staff list
  - Low stock products
  - Pending purchase orders
  - Recent expenses
```

### Allowed Endpoints

#### Products (Full Access)
```
POST   /products                         - Create product
GET    /products                         - List products
GET    /products/:id                     - Get product details
PATCH  /products/:id                     - Update product
DELETE /products/:id                     - Deactivate product
```

#### Sales (Full Access)
```
POST   /sales                            - Create sale
GET    /sales                            - List sales
GET    /sales/:id                        - Get sale details
```

#### Purchases (Full Access)
```
POST   /purchases                        - Create purchase
GET    /purchases                        - List purchases
GET    /purchases/:id                    - Get purchase details
```

#### Purchase Orders (View & Create)
```
POST   /purchase-orders                  - Create purchase order
GET    /purchase-orders                  - List purchase orders
GET    /purchase-orders/:id              - Get PO details
PATCH  /purchase-orders/:id              - Update PO
```

#### Suppliers (Full Access)
```
POST   /suppliers                        - Create supplier
GET    /suppliers                        - List suppliers
GET    /suppliers/:id                    - Get supplier details
PATCH  /suppliers/:id                    - Update supplier
DELETE /suppliers/:id                    - Deactivate supplier
```

#### Customers (Manage)
```
POST   /customers                        - Create customer
GET    /customers                        - List customers
GET    /customers/:id                    - Get customer details
PATCH  /customers/:id                    - Update customer
DELETE /customers/:id                    - Deactivate customer
POST   /customers/:id/loyalty/add        - Add loyalty points
POST   /customers/:id/loyalty/redeem     - Redeem loyalty points
POST   /customers/:id/transactions       - Add transaction
```

#### Expenses (Create & View)
```
POST   /expenses                         - Create expense
GET    /expenses                         - List expenses
GET    /expenses/:id                     - Get expense details
PATCH  /expenses/:id                     - Update expense
```

#### Stock Management
```
POST   /stock/adjust                     - Adjust stock
GET    /stock/transactions               - View transactions
POST   /stock/transfer                   - Create transfer
GET    /stock/transfer/:id               - View transfer
```

#### Branches (View Only)
```
GET    /branches                         - List branches
GET    /branches/:id                     - Get branch details
```

#### Analytics & Reports
```
GET    /analytics/dashboard              - Analytics dashboard
GET    /analytics/sales                  - Sales analytics
GET    /analytics/products               - Product analytics
GET    /analytics/inventory              - Inventory analytics
GET    /reports/sales                    - Sales reports
GET    /reports/inventory                - Inventory reports
GET    /reports/profit-loss              - Profit & loss
GET    /reports/expenses                 - Expense reports
```

#### Tasks
```
POST   /tasks                            - Create task
GET    /tasks                            - List tasks
GET    /tasks/:id                        - Get task details
PATCH  /tasks/:id                        - Update task
DELETE /tasks/:id                        - Delete task
POST   /tasks/:id/comments               - Add comment
```

#### Notifications
```
GET    /notifications                    - List notifications
PATCH  /notifications/:id/read           - Mark as read
POST   /notifications/check-low-stock    - Trigger checks
POST   /notifications/check-expiring     - Trigger checks
POST   /notifications/check-debt         - Trigger checks
POST   /notifications/check-deadlines    - Trigger checks
```

#### Promotions
```
POST   /promotions                       - Create promotion
GET    /promotions                       - List promotions
GET    /promotions/:id                   - Get promotion
PATCH  /promotions/:id                   - Update promotion
DELETE /promotions/:id                   - Delete promotion
```

#### Employees (View Only)
```
GET    /employees                        - List employees
GET    /employees/:id                    - Get employee details
```

#### Messages
```
POST   /messages                         - Send message
GET    /messages                         - List messages
GET    /messages/:id                     - Get message
PATCH  /messages/:id/read                - Mark as read
```

### Restrictions
- ❌ Cannot create users
- ❌ Cannot create/update branches
- ❌ Cannot approve purchase orders
- ❌ Cannot delete expenses
- ❌ Cannot create/update employees
- ❌ Cannot set employee targets
- ❌ Cannot reset user passwords
- ✅ Limited to their branch data

---

## 4. CASHIER (Sales Personnel)

### Description
Front-line staff who process sales, handle customers, and manage basic inventory tasks. Focused on point-of-sale operations.

### Primary Responsibilities
- Process sales transactions
- Handle customer interactions
- Add/manage customers
- Record expenses
- View product information
- Check inventory levels
- Complete assigned tasks
- Basic reporting

### Dashboard Access
```
GET /dashboard - Cashier-focused dashboard with:
  - Today's personal sales
  - Today's sales count
  - Today's revenue
  - Recent sales (last 5)
  - Low stock products
  - Pending tasks assigned to them
  - Unread messages count
```

### Allowed Endpoints

#### Sales (Create & View Own)
```
POST   /sales                            - Create sale
GET    /sales                            - List all sales
GET    /sales/my-sales                   - Get my sales only
GET    /sales/:id                        - Get sale details
```

#### Products (View Only)
```
GET    /products                         - List products
GET    /products/:id                     - Get product details
GET    /products/search                  - Search products
```

#### Purchases (Create & View)
```
POST   /purchases                        - Create purchase
GET    /purchases                        - List purchases
GET    /purchases/:id                    - Get purchase details
```

#### Customers (Full Access)
```
POST   /customers                        - Create customer
GET    /customers                        - List customers
GET    /customers/:id                    - Get customer details
POST   /customers/:id/loyalty/add        - Add loyalty points
POST   /customers/:id/loyalty/redeem     - Redeem loyalty points
POST   /customers/:id/transactions       - Add transaction
```

#### Suppliers (View Only)
```
GET    /suppliers                        - List suppliers
GET    /suppliers/:id                    - Get supplier details
```

#### Expenses (Create & View)
```
POST   /expenses                         - Create expense
GET    /expenses                         - List expenses
GET    /expenses/:id                     - Get expense details
PATCH  /expenses/:id                     - Update expense
```

#### Tasks (View & Update Assigned)
```
GET    /tasks                            - List tasks (assigned to me)
GET    /tasks/:id                        - Get task details
PATCH  /tasks/:id                        - Update task status
POST   /tasks/:id/comments               - Add comment
```

#### Notifications
```
GET    /notifications                    - List my notifications
PATCH  /notifications/:id/read           - Mark as read
```

#### Messages
```
POST   /messages                         - Send message
GET    /messages                         - List my messages
GET    /messages/:id                     - Get message
PATCH  /messages/:id/read                - Mark as read
```

### Restrictions
- ❌ Cannot create products
- ❌ Cannot update products
- ❌ Cannot delete products
- ❌ Cannot create users
- ❌ Cannot create branches
- ❌ Cannot update customers (except loyalty)
- ❌ Cannot delete customers
- ❌ Cannot create suppliers
- ❌ Cannot update suppliers
- ❌ Cannot delete expenses
- ❌ Cannot approve purchase orders
- ❌ Cannot adjust stock manually
- ❌ Cannot create tasks
- ❌ Cannot delete tasks
- ❌ Cannot access analytics
- ❌ Cannot access reports
- ❌ Cannot create promotions
- ✅ Limited to their own sales and assigned tasks

---

## Role Comparison Matrix

| Feature | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|---------|--------------|------|---------|---------|
| **Organizations** |
| Create Organizations | ✅ | ❌ | ❌ | ❌ |
| View All Organizations | ✅ | ❌ | ❌ | ❌ |
| Manage Own Organization | ✅ | ✅ | ❌ | ❌ |
| **Users & Access** |
| Create Users | ✅ | ✅ | ❌ | ❌ |
| Update Users | ✅ | ✅ | ❌ | ❌ |
| Delete Users | ✅ | ✅ | ❌ | ❌ |
| Reset Passwords | ✅ | ✅ | ❌ | ❌ |
| **Branches** |
| Create Branches | ✅ | ✅ | ❌ | ❌ |
| Update Branches | ✅ | ✅ | ❌ | ❌ |
| View Branches | ✅ | ✅ | ✅ | ✅ |
| Approve Transfers | ✅ | ✅ | ❌ | ❌ |
| **Products** |
| Create Products | ✅ | ✅ | ✅ | ❌ |
| Update Products | ✅ | ✅ | ✅ | ❌ |
| Delete Products | ✅ | ✅ | ✅ | ❌ |
| View Products | ✅ | ✅ | ✅ | ✅ |
| **Sales** |
| Create Sales | ✅ | ✅ | ✅ | ✅ |
| View All Sales | ✅ | ✅ | ✅ | ✅ |
| View Own Sales Only | - | - | - | ✅ |
| **Purchases** |
| Create Purchases | ✅ | ✅ | ✅ | ✅ |
| View Purchases | ✅ | ✅ | ✅ | ✅ |
| **Purchase Orders** |
| Create PO | ✅ | ✅ | ✅ | ❌ |
| Approve PO | ✅ | ✅ | ❌ | ❌ |
| **Suppliers** |
| Create Suppliers | ✅ | ✅ | ✅ | ❌ |
| Update Suppliers | ✅ | ✅ | ✅ | ❌ |
| View Suppliers | ✅ | ✅ | ✅ | ✅ |
| **Customers** |
| Create Customers | ✅ | ✅ | ✅ | ✅ |
| Update Customers | ✅ | ✅ | ✅ | ❌ |
| Delete Customers | ✅ | ✅ | ✅ | ❌ |
| Manage Loyalty | ✅ | ✅ | ✅ | ✅ |
| **Expenses** |
| Create Expenses | ✅ | ✅ | ✅ | ✅ |
| Update Expenses | ✅ | ✅ | ✅ | ✅ |
| Delete Expenses | ✅ | ✅ | ❌ | ❌ |
| **Stock** |
| Adjust Stock | ✅ | ✅ | ✅ | ❌ |
| Create Transfer | ✅ | ✅ | ✅ | ❌ |
| View Transactions | ✅ | ✅ | ✅ | ❌ |
| **Employees** |
| Create Employees | ✅ | ✅ | ❌ | ❌ |
| Update Employees | ✅ | ✅ | ❌ | ❌ |
| Set Targets | ✅ | ✅ | ❌ | ❌ |
| View Employees | ✅ | ✅ | ✅ | ❌ |
| **Tasks** |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Update Tasks | ✅ | ✅ | ✅ | ✅* |
| Delete Tasks | ✅ | ✅ | ✅ | ❌ |
| View Tasks | ✅ | ✅ | ✅ | ✅* |
| **Analytics & Reports** |
| View Analytics | ✅ | ✅ | ✅ | ❌ |
| Generate Reports | ✅ | ✅ | ✅ | ❌ |
| System Dashboard | ✅ | ❌ | ❌ | ❌ |
| **Promotions** |
| Create Promotions | ✅ | ✅ | ✅ | ❌ |
| Update Promotions | ✅ | ✅ | ✅ | ❌ |
| Delete Promotions | ✅ | ✅ | ✅ | ❌ |
| **Notifications** |
| Trigger Checks | ✅ | ✅ | ✅ | ❌ |
| View Notifications | ✅ | ✅ | ✅ | ✅ |
| **Messages** |
| Send Messages | ✅ | ✅ | ✅ | ✅ |
| View Messages | ✅ | ✅ | ✅ | ✅ |
| Broadcast to All | ✅ | ✅ | ❌ | ❌ |

*Cashier can only update/view tasks assigned to them

---

## Authentication Endpoints (All Roles)

These endpoints are public or available to all authenticated users:

```
POST   /auth/login                       - Login (no OTP required)
POST   /auth/refresh                     - Refresh access token
POST   /auth/logout                      - Logout
POST   /auth/forgot-password             - Request password reset OTP
POST   /auth/verify-reset-otp            - Verify password reset OTP
POST   /auth/reset-password              - Reset password with OTP
```

## User Profile Endpoints (All Roles)

```
GET    /users/profile                    - Get own profile
PATCH  /users/profile                    - Update own profile
POST   /users/request-password-change-otp - Request OTP for password change
PATCH  /users/change-password            - Change own password (requires OTP)
```

---

## Quick Reference: Who Can Do What?

### Create Organization
- ✅ SYSTEM_ADMIN only

### Create Users
- ✅ SYSTEM_ADMIN, BOSS

### Create Products
- ✅ SYSTEM_ADMIN, BOSS, MANAGER

### Process Sales
- ✅ All roles (SYSTEM_ADMIN, BOSS, MANAGER, CASHIER)

### View Reports
- ✅ SYSTEM_ADMIN, BOSS, MANAGER

### Manage Customers
- ✅ SYSTEM_ADMIN, BOSS, MANAGER (full)
- ✅ CASHIER (create & loyalty only)

### Approve Purchase Orders
- ✅ SYSTEM_ADMIN, BOSS only

### Delete Expenses
- ✅ SYSTEM_ADMIN, BOSS only

### Access System Dashboard
- ✅ SYSTEM_ADMIN only

---

## API Base URL

```
Production: https://your-app.onrender.com/api/v1
Development: http://localhost:5000/api/v1
```

## Authentication Header

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

## Example API Calls

### Login (Any Role)
```bash
curl -X POST https://your-app.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Sale (CASHIER)
```bash
curl -X POST https://your-app.onrender.com/api/v1/sales \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "prod-123", "quantity": 2, "sellingPrice": 5000}
    ],
    "paymentMethod": "CASH",
    "amountPaid": 10000
  }'
```

### Create Product (MANAGER)
```bash
curl -X POST https://your-app.onrender.com/api/v1/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "sku": "SKU001",
    "costPrice": 3000,
    "sellingPrice": 5000,
    "minStockLevel": 10
  }'
```

### Create Organization (SYSTEM_ADMIN)
```bash
curl -X POST https://your-app.onrender.com/api/v1/organizations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Store",
    "businessType": "Retail",
    "address": "123 Main St",
    "phone": "+250788123456",
    "email": "boss@newstore.com",
    "bossFullName": "John Doe",
    "bossPassword": "SecurePass123!"
  }'
```

---

## Summary

- **SYSTEM_ADMIN**: Platform god-mode, manages everything
- **BOSS**: Organization owner, full control within org
- **MANAGER**: Operations manager, inventory & reporting
- **CASHIER**: Sales personnel, POS operations

Each role is designed for specific workflows and responsibilities, ensuring proper access control and data security throughout the system.
