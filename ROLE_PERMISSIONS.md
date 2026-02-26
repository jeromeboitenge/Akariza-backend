# Akariza System - Complete Role Permissions Matrix

## 🎯 Role Hierarchy

1. **SYSTEM_ADMIN** - Platform administrator (full access to everything)
2. **BOSS** - Organization owner (full access within organization)
3. **MANAGER** - Branch manager (operations and viewing)
4. **CASHIER** - Sales clerk (sales and customer operations)

---

## 📊 Complete Permissions Matrix

### ✅ = Can Access | ❌ = No Access

| Module | Operation | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|-----------|--------------|------|---------|---------|
| **Organizations** |
| | Create organization | ✅ | ❌ | ❌ | ❌ |
| | View all organizations | ✅ | ❌ | ❌ | ❌ |
| | Update organization | ✅ | ❌ | ❌ | ❌ |
| | Delete organization | ✅ | ❌ | ❌ | ❌ |
| **Branches** |
| | Create branch | ✅ | ✅ | ❌ | ❌ |
| | View branches | ✅ | ✅ | ✅ | ❌ |
| | Update branch | ✅ | ✅ | ❌ | ❌ |
| | Delete branch | ✅ | ✅ | ❌ | ❌ |
| | Approve stock transfer | ✅ | ✅ | ❌ | ❌ |
| **Users** |
| | Create user | ✅ | ✅ | ❌ | ❌ |
| | View users | ✅ | ✅ | ❌ | ❌ |
| | Update user | ✅ | ✅ | ❌ | ❌ |
| | Delete user | ✅ | ✅ | ❌ | ❌ |
| **Employees** |
| | Create employee | ✅ | ✅ | ❌ | ❌ |
| | View employees | ✅ | ✅ | ✅ | ❌ |
| | Update employee | ✅ | ✅ | ❌ | ❌ |
| | Set sales target | ✅ | ✅ | ❌ | ❌ |
| **Products** |
| | Create product | ✅ | ✅ | ✅ | ❌ |
| | View products | ✅ | ✅ | ✅ | ✅ |
| | Update product | ✅ | ✅ | ✅ | ❌ |
| | Delete product | ✅ | ✅ | ✅ | ❌ |
| **Stock** |
| | View stock | ✅ | ✅ | ✅ | ✅ |
| | Adjust stock | ✅ | ✅ | ✅ | ❌ |
| | Transfer stock | ✅ | ✅ | ✅ | ❌ |
| | View transactions | ✅ | ✅ | ✅ | ❌ |
| **Suppliers** |
| | Create supplier | ✅ | ✅ | ✅ | ❌ |
| | View suppliers | ✅ | ✅ | ✅ | ✅ |
| | Update supplier | ✅ | ✅ | ✅ | ❌ |
| | Delete supplier | ✅ | ✅ | ✅ | ❌ |
| **Purchases** |
| | Create purchase | ✅ | ✅ | ✅ | ✅ |
| | View purchases | ✅ | ✅ | ✅ | ✅ |
| | Update purchase | ✅ | ✅ | ✅ | ❌ |
| **Purchase Orders** |
| | Create PO | ✅ | ✅ | ✅ | ❌ |
| | View POs | ✅ | ✅ | ✅ | ❌ |
| | Update PO | ✅ | ✅ | ✅ | ❌ |
| | Approve PO | ✅ | ✅ | ❌ | ❌ |
| | Delete PO | ✅ | ✅ | ❌ | ❌ |
| **Sales** |
| | Create sale | ✅ | ✅ | ✅ | ✅ |
| | View all sales | ✅ | ✅ | ✅ | ✅ |
| | View my sales | ✅ | ✅ | ✅ | ✅ |
| | Update sale | ✅ | ✅ | ✅ | ❌ |
| **Customers** |
| | Create customer | ✅ | ✅ | ✅ | ✅ |
| | View customers | ✅ | ✅ | ✅ | ✅ |
| | Update customer | ✅ | ✅ | ✅ | ❌ |
| | Delete customer | ✅ | ✅ | ✅ | ❌ |
| | Manage loyalty points | ✅ | ✅ | ✅ | ✅ |
| **Expenses** |
| | Create expense | ✅ | ✅ | ✅ | ✅ |
| | View expenses | ✅ | ✅ | ✅ | ✅ |
| | View summary | ✅ | ✅ | ✅ | ✅ |
| | Delete expense | ✅ | ✅ | ❌ | ❌ |
| **Promotions** |
| | Create promotion | ✅ | ✅ | ✅ | ❌ |
| | View promotions | ✅ | ✅ | ✅ | ✅ |
| | Update promotion | ✅ | ✅ | ✅ | ❌ |
| | Delete promotion | ✅ | ✅ | ✅ | ❌ |
| **Tasks** |
| | Create task | ✅ | ✅ | ✅ | ❌ |
| | View tasks | ✅ | ✅ | ✅ | ✅ |
| | Update task | ✅ | ✅ | ✅ | ❌ |
| | Delete task | ✅ | ✅ | ✅ | ❌ |
| **Reports** |
| | Sales reports | ✅ | ✅ | ✅ | ❌ |
| | Inventory reports | ✅ | ✅ | ✅ | ❌ |
| | Financial reports | ✅ | ✅ | ✅ | ❌ |
| | Performance reports | ✅ | ✅ | ✅ | ❌ |
| **Analytics** |
| | Dashboard | ✅ | ✅ | ✅ | ❌ |
| | Sales trends | ✅ | ✅ | ✅ | ❌ |
| | Product insights | ✅ | ✅ | ✅ | ❌ |
| | Customer insights | ✅ | ✅ | ✅ | ❌ |
| **Messages** |
| | Send to user | ✅ | ✅ | ✅ | ✅ |
| | Send to branch | ✅ | ✅ | ✅ (own) | ❌ |
| | Send to all branches | ✅ | ✅ | ❌ | ❌ |
| | View messages | ✅ (all) | ✅ (all) | ✅ (branch) | ✅ (own) |
| **Notifications** |
| | View notifications | ✅ | ✅ | ✅ | ✅ |
| | Mark as read | ✅ | ✅ | ✅ | ✅ |

---

## 🔐 Data Visibility Rules

### SYSTEM_ADMIN
- **Scope**: ALL organizations
- **Visibility**: Everything across all organizations
- **Special**: Can create and manage organizations

### BOSS
- **Scope**: Own organization only
- **Visibility**: All data within their organization
- **Branches**: All branches in organization
- **Users**: All users in organization
- **Special**: Cannot see other organizations

### MANAGER
- **Scope**: Own organization, own branch
- **Visibility**: All data in their branch
- **Branches**: Only their assigned branch
- **Users**: Users in their branch
- **Special**: Can view but limited create/update rights

### CASHIER
- **Scope**: Own organization, own branch
- **Visibility**: Limited to sales operations
- **Branches**: Only their assigned branch
- **Users**: Cannot manage users
- **Special**: Focus on sales, customers, and daily expenses

---

## 🎯 Key Principles

1. **SYSTEM_ADMIN has unrestricted access** to everything
2. **BOSS has full control** within their organization
3. **MANAGER has operational access** within their branch
4. **CASHIER has transactional access** for daily operations

---

## 🔄 Role-Based Workflows

### SYSTEM_ADMIN Workflow
1. Create organizations
2. Monitor all organizations
3. View cross-organization analytics
4. Manage system-wide settings

### BOSS Workflow
1. Manage organization settings
2. Create branches
3. Hire and manage users
4. View organization-wide reports
5. Make strategic decisions

### MANAGER Workflow
1. Manage branch operations
2. Process purchases and stock
3. Assign tasks to team
4. Monitor branch performance
5. Handle daily operations

### CASHIER Workflow
1. Process sales
2. Manage customers
3. Record daily expenses
4. Check product availability
5. Communicate with team

---

## ✅ Verification Checklist

All controllers now include SYSTEM_ADMIN in their role decorators:

- [x] Organizations - SYSTEM_ADMIN only
- [x] Branches - SYSTEM_ADMIN, BOSS, MANAGER (view)
- [x] Users - SYSTEM_ADMIN, BOSS
- [x] Employees - SYSTEM_ADMIN, BOSS, MANAGER (view)
- [x] Products - SYSTEM_ADMIN, BOSS, MANAGER
- [x] Stock - SYSTEM_ADMIN, BOSS, MANAGER
- [x] Suppliers - SYSTEM_ADMIN, BOSS, MANAGER, CASHIER (view)
- [x] Purchases - SYSTEM_ADMIN, BOSS, MANAGER, CASHIER
- [x] Purchase Orders - SYSTEM_ADMIN, BOSS, MANAGER
- [x] Sales - SYSTEM_ADMIN, BOSS, MANAGER, CASHIER
- [x] Customers - SYSTEM_ADMIN, BOSS, MANAGER, CASHIER
- [x] Expenses - SYSTEM_ADMIN, BOSS, MANAGER, CASHIER
- [x] Promotions - SYSTEM_ADMIN, BOSS, MANAGER
- [x] Tasks - SYSTEM_ADMIN, BOSS, MANAGER
- [x] Reports - SYSTEM_ADMIN, BOSS, MANAGER
- [x] Analytics - SYSTEM_ADMIN, BOSS, MANAGER
- [x] Messages - All roles (with scope restrictions)
- [x] Notifications - All roles

---

**Last Updated**: February 26, 2026  
**Version**: 2.0 - Complete SYSTEM_ADMIN Access
