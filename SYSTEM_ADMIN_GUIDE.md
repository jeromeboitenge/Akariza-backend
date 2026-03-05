# SYSTEM_ADMIN Role Guide

## Overview
The SYSTEM_ADMIN is the highest-level administrator in the application with full access to all organizations, branches, and system-wide data. This role is designed for platform administrators who manage multiple organizations.

## Key Responsibilities
- Create and manage organizations
- Monitor system-wide performance
- View cross-organization analytics
- Manage all branches across organizations
- Access all user data and activities
- System-wide reporting and oversight

---

## SYSTEM_ADMIN Dashboard

### Main Dashboard (`GET /dashboard`)
When SYSTEM_ADMIN logs in, they see the BOSS dashboard view which includes:

**Summary Metrics:**
- Today's sales (amount & count)
- Monthly sales (amount & count)
- Monthly profit
- Growth rate (compared to last month)
- Total inventory value
- Total customers
- Total products
- Total branches
- Total users
- Low stock items count
- Pending tasks count

**Detailed Views:**
- All branches with user and sales counts
- Top 10 selling products (this month)
- Sales breakdown by branch
- Recent sales (last 10)
- Low stock products (up to 20)

### Admin-Specific Dashboard (`GET /admin/dashboard/*`)
SYSTEM_ADMIN has exclusive access to system-wide analytics:

#### 1. System Overview (`GET /admin/dashboard/overview`)
```json
{
  "organizations": { "total": 10, "active": 8 },
  "branches": 25,
  "users": 150,
  "products": 5000,
  "sales": { "count": 10000, "revenue": 50000000 }
}
```

#### 2. All Organizations Stats (`GET /admin/dashboard/organizations/stats`)
Returns detailed statistics for every organization:
- Organization name, type, status
- User count
- Branch count
- Product count
- Sales count
- Total revenue
- Total purchases
- Creation date

#### 3. Specific Organization Details (`GET /admin/dashboard/organizations/:id/stats`)
Deep dive into a single organization:
- Organization info
- All users with roles
- All branches with stats
- Product count
- Sales & revenue
- Purchase totals
- Recent sales (last 10)

#### 4. System-Wide Sales Stats (`GET /admin/dashboard/sales`)
Query parameters: `startDate`, `endDate`
- Total sales and revenue
- Sales breakdown by organization
- Daily sales trend (last 30 days)

#### 5. Top Selling Products (`GET /admin/dashboard/products/top-selling`)
Query parameter: `limit` (default: 20)
- Product name
- Organization
- Quantity sold
- Revenue generated
- Transaction count

#### 6. User Activity (`GET /admin/dashboard/users/activity`)
- Total users
- Active users
- Users by role (BOSS, MANAGER, CASHIER)
- Recent logins (last 50)

#### 7. Branch Statistics (`GET /admin/dashboard/branches/stats`)
All branches across all organizations:
- Branch name, code, organization
- Active status
- User count
- Product count
- Sales count
- Revenue

---

## Full Access Permissions

### Organizations Management (`/organizations`)
**SYSTEM_ADMIN ONLY** - No other role can access these endpoints

- `POST /organizations` - Create new organization
- `GET /organizations` - List all organizations
- `GET /organizations/:id` - Get organization details
- `PATCH /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Deactivate organization
- `PATCH /organizations/:id/activate` - Activate organization
- `GET /organizations/:id/stats` - Organization statistics

### Branch Management
- `POST /branches` - Create branches (shared with BOSS)
- `GET /branches` - View all branches across all organizations
- `PATCH /branches/:id` - Update branches (shared with BOSS)
- `DELETE /branches/:id` - Deactivate branches (shared with BOSS)
- `POST /branches/transfer/:id/approve` - Approve stock transfers (shared with BOSS)

### Admin Branches (`/admin/branches`)
**SYSTEM_ADMIN ONLY**
- Full branch management across all organizations
- Cross-organization branch operations

### User Management
- `POST /users` - Create users (shared with BOSS)
- `GET /users` - View all users across organizations
- `PATCH /users/:id` - Update users (shared with BOSS)
- `DELETE /users/:id` - Deactivate users (shared with BOSS)
- `PATCH /users/:id/reset-password` - Reset user passwords (shared with BOSS)

### Products
- Full CRUD access to all products across all organizations
- `POST /products` - Create products
- `GET /products` - View all products
- `PATCH /products/:id` - Update products
- `DELETE /products/:id` - Deactivate products

### Sales & Purchases
- View all sales across all organizations
- View all purchases across all organizations
- Create sales and purchases
- Full transaction history access

### Analytics & Reports
- `GET /analytics/*` - All analytics endpoints
- `GET /reports/*` - All reporting endpoints
- Cross-organization analytics
- System-wide performance metrics

### Inventory & Stock
- `POST /stock/adjust` - Adjust stock levels
- View inventory across all branches and organizations
- Manage stock transfers

### Customers & Suppliers
- Full access to all customers across organizations
- Full access to all suppliers across organizations
- Manage customer loyalty programs
- Manage supplier relationships

### Expenses
- View all expenses across organizations
- Create and manage expenses
- `DELETE /expenses/:id` - Delete expenses (shared with BOSS)

### Tasks & Notifications
- Create and manage tasks
- Delete tasks
- Trigger system-wide notifications
- View all task activities

### Employees
- View all employees across organizations
- Create and update employees (shared with BOSS)
- Set sales targets (shared with BOSS)

### Promotions
- Create and manage promotions across organizations
- View all active promotions

### Purchase Orders
- View all purchase orders
- Approve purchase orders (shared with BOSS)

### Messaging
- Message any user in any organization
- View all messages across the system
- Broadcast messages

---

## Special Privileges

### 1. Cross-Organization Access
SYSTEM_ADMIN can access data from ANY organization without restrictions. The `organization.guard.ts` explicitly allows SYSTEM_ADMIN to bypass organization checks.

### 2. Cross-Branch Access
SYSTEM_ADMIN can access data from ANY branch. The `branch.guard.ts` explicitly allows SYSTEM_ADMIN to bypass branch checks.

### 3. Role Bypass
The `roles.guard.ts` gives SYSTEM_ADMIN automatic access to ALL endpoints, regardless of role requirements.

### 4. No Organization Filtering
When SYSTEM_ADMIN queries data, they see ALL records across ALL organizations unless they specifically filter by organization.

---

## Login Credentials (Default)

```
Email: jeromeboitenge@gmail.com
Password: admin123
```

After login, you receive:
```json
{
  "user": {
    "id": "admin-uuid",
    "email": "jeromeboitenge@gmail.com",
    "fullName": "System Administrator",
    "role": "SYSTEM_ADMIN"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

## Typical Workflows

### 1. Create New Organization
```bash
POST /organizations
{
  "name": "New Store",
  "businessType": "Retail",
  "address": "123 Main St, Kigali",
  "phone": "+250788123456",
  "email": "boss@newstore.com",
  "bossFullName": "John Doe",
  "bossPassword": "SecurePass123!"
}
```
This automatically creates:
- The organization
- A BOSS user for that organization
- Initial setup for the organization

### 2. Monitor System Performance
```bash
# Get system overview
GET /admin/dashboard/overview

# Check all organizations
GET /admin/dashboard/organizations/stats

# View sales trends
GET /admin/dashboard/sales?startDate=2026-01-01&endDate=2026-12-31
```

### 3. Investigate Organization Issues
```bash
# Get detailed org stats
GET /admin/dashboard/organizations/{orgId}/stats

# Check branch performance
GET /admin/dashboard/branches/stats

# Review user activity
GET /admin/dashboard/users/activity
```

### 4. Manage Branches Across Organizations
```bash
# View all branches
GET /branches

# Create branch for any organization
POST /admin/branches
{
  "organizationId": "org-uuid",
  "name": "Downtown Branch",
  "code": "DT001",
  "address": "456 Downtown Ave"
}
```

---

## Security Notes

1. **Single SYSTEM_ADMIN**: Typically, there should be only one SYSTEM_ADMIN account for security
2. **No OTP for Login**: Login is direct with email/password (OTP only for password changes)
3. **Full Audit Trail**: All SYSTEM_ADMIN actions should be logged
4. **Password Security**: Use strong passwords and change regularly
5. **Limited Sharing**: SYSTEM_ADMIN credentials should never be shared

---

## Comparison with Other Roles

| Feature | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|---------|--------------|------|---------|---------|
| Create Organizations | ✅ | ❌ | ❌ | ❌ |
| Cross-Org Access | ✅ | ❌ | ❌ | ❌ |
| System Dashboard | ✅ | ❌ | ❌ | ❌ |
| Manage Own Org | ✅ | ✅ | ❌ | ❌ |
| Create Users | ✅ | ✅ | ❌ | ❌ |
| Create Branches | ✅ | ✅ | ❌ | ❌ |
| Manage Products | ✅ | ✅ | ✅ | ❌ |
| Process Sales | ✅ | ✅ | ✅ | ✅ |
| View Reports | ✅ | ✅ | ✅ | ❌ |
| Manage Expenses | ✅ | ✅ | ✅ | ✅ |

---

## API Endpoints Summary

### Exclusive to SYSTEM_ADMIN
- `/organizations/*` - All organization management
- `/admin/dashboard/*` - System-wide analytics
- `/admin/branches/*` - Cross-org branch management

### Shared with BOSS
- User management
- Branch creation/updates
- Password resets
- Expense deletion
- Purchase order approvals
- Employee management

### Shared with All Roles
- Sales processing (with BOSS, MANAGER, CASHIER)
- Expense creation (with BOSS, MANAGER, CASHIER)
- Customer management (with BOSS, MANAGER, CASHIER)
- Product viewing (with BOSS, MANAGER, CASHIER)
