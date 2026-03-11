# Role Permissions Matrix

This document outlines the permissions for each user role in the Akariza system.

## User Roles

1. **SYSTEM_ADMIN** - Full system access (super admin)
2. **BOSS** - Organization owner with full access to their organization
3. **MANAGER** - Branch manager with limited management capabilities
4. **CASHIER** - Front-line staff with basic operational access

---

## Module Permissions

### Products
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit   | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |

### Sales
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ✅ |
| Edit   | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |
| View My Sales | ❌ | ❌ | ❌ | ✅ |

### Purchases
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ✅ |
| Edit   | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |

### Purchase Orders
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit   | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |
| Approve | ✅ | ✅ | ❌ | ❌ |

### Stock Management
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ❌ |
| Manage | ✅ | ✅ | ✅ | ❌ |
| Adjust | ✅ | ✅ | ✅ | ❌ |
| Transfer | ✅ | ✅ | ✅ | ❌ |

### Customers
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ✅ |
| Edit   | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |
| Manage Loyalty | ✅ | ✅ | ✅ | ✅ |

### Suppliers
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit   | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |

### Employees
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ |
| Edit   | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |
| Set Targets | ✅ | ✅ | ❌ | ❌ |

### Users
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ✅ (read-only) |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit   | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |
| Reset Password | ✅ | ✅ | ❌ | ❌ |

**Note:** MANAGER can create users in their branch, but only BOSS can edit/delete users.

### Expenses
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ✅ |
| Edit   | ✅ | ✅ | ✅ | ✅ |
| Delete | ✅ | ✅ | ❌ | ❌ |

### Promotions
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View   | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit   | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |

### Reports & Analytics
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View Reports | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ |

### Communication
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View Notifications | ✅ | ✅ | ✅ | ✅ |
| Trigger Notifications | ✅ | ✅ | ✅ | ❌ |
| View Tasks | ✅ | ✅ | ✅ | ✅ |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Update Tasks | ✅ | ✅ | ✅ | ✅ |
| Delete Tasks | ✅ | ✅ | ✅ | ❌ |
| View Messages | ✅ | ✅ | ✅ | ✅ |
| Send Messages | ✅ | ✅ | ✅ | ✅ |
| Broadcast Messages | ✅ | ✅ | ❌ | ❌ |
| View Org Chat | ✅ | ✅ | ✅ | ✅ |

### Organizations & Branches
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View Organizations | ✅ | ✅ | ❌ | ❌ |
| Create Organizations | ✅ | ❌ | ❌ | ❌ |
| Edit Organizations | ✅ | ✅ | ❌ | ❌ |
| Delete Organizations | ✅ | ❌ | ❌ | ❌ |
| View Branches | ✅ | ✅ | ✅ | ✅ |
| Create Branches | ✅ | ✅ | ❌ | ❌ |
| Edit Branches | ✅ | ✅ | ❌ | ❌ |
| Delete Branches | ✅ | ✅ | ❌ | ❌ |
| Approve Transfers | ✅ | ✅ | ❌ | ❌ |

### Admin Panel
| Action | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|--------|--------------|------|---------|---------|
| View Admin Panel | ✅ | ❌ | ❌ | ❌ |
| View Admin Dashboard | ✅ | ❌ | ❌ | ❌ |
| View Sync Tools | ✅ | ❌ | ❌ | ❌ |
| Manage All Organizations | ✅ | ❌ | ❌ | ❌ |

---

## Navigation Access

### Sidebar Navigation

**CASHIER sees:**
- Dashboard
- Customers (Business section)
- Expenses (Finance section)
- Org Chat (Communication section)

**MANAGER sees:**
- Dashboard
- Purchase Orders, Stock, Customers, Suppliers (Business section)
- Employees, Users (People section)
- Expenses, Promotions, Reports, Analytics (Finance section)
- Tasks, Org Chat (Communication section)

**BOSS sees:**
- Dashboard
- Purchase Orders, Stock, Customers, Suppliers (Business section)
- Employees, Users (People section)
- Expenses, Promotions, Reports, Analytics (Finance section)
- Tasks, Org Chat (Communication section)
- Organizations, Branches (Management section)

**SYSTEM_ADMIN sees:**
- All of the above PLUS:
- Admin Panel, Sync Tools (Administration section)

### Topbar Navigation (Accessible by ALL roles)
- Products
- Sales
- Purchases
- Expenses
- Messages

---

## Data Scope

### SYSTEM_ADMIN
- Can see and manage ALL organizations and their data

### BOSS
- Can see and manage their entire organization
- Can see all branches within their organization
- Can see all users, products, sales, etc. across all branches

### MANAGER
- Can see and manage their assigned branch
- Can see branch-specific data (sales, stock, users in their branch)
- Cannot see other branches' data

### CASHIER
- Can see products and customers
- Can create sales and expenses
- Can only see their own sales (via "My Sales" endpoint)
- Limited to operational tasks only

---

## Special Notes

1. **SYSTEM_ADMIN** has unrestricted access to everything
2. **MANAGER** can create users but cannot edit/delete them (only BOSS can)
3. **CASHIER** can view users but in read-only mode
4. **Expense deletion** is restricted to BOSS and SYSTEM_ADMIN only
5. **Purchase Order approval** requires BOSS or SYSTEM_ADMIN role
6. **Stock transfers** between branches require BOSS approval
7. **Org Chat** is accessible by all roles for organization-wide communication

---

## Backend vs Frontend Consistency

✅ All permissions are now synchronized between:
- Backend `@Roles()` decorators
- Frontend `permissions.ts` file
- UI component permission checks

Last Updated: 2026-03-11
