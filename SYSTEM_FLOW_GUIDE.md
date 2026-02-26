# Akariza System - Complete User Flow & Actions

## 🎯 System Overview
Akariza is a multi-organization retail management system with inventory, sales, purchases, and analytics.

---

## 👥 User Roles & Hierarchy

### 1. SYSTEM_ADMIN (Super Admin)
- **Purpose**: Manages the entire platform across all organizations
- **Access**: Full system access, all organizations
- **Typical User**: Platform owner/administrator

### 2. BOSS (Organization Owner)
- **Purpose**: Owns and manages their organization
- **Access**: Full access within their organization only
- **Typical User**: Business owner, CEO

### 3. MANAGER (Branch Manager)
- **Purpose**: Manages daily operations at branch level
- **Access**: View and manage operations, limited creation rights
- **Typical User**: Store manager, supervisor

### 4. CASHIER
- **Purpose**: Handles sales and customer transactions
- **Access**: Sales, customers, and basic inventory viewing
- **Typical User**: Sales clerk, cashier

---

## 🔄 Complete System Flow

### PHASE 1: SYSTEM SETUP (SYSTEM_ADMIN)

#### Step 1: Admin Creates Organization
**Who**: SYSTEM_ADMIN  
**Endpoint**: `POST /api/v1/organizations`  
**Action**: Register a new business/organization

```json
{
  "name": "ABC Retail Store",
  "businessType": "Retail",
  "address": "123 Main St, Kigali",
  "phone": "+250788123456",
  "email": "contact@abcstore.com"
}
```

**Result**: Organization created with unique ID

---

### PHASE 2: ORGANIZATION SETUP (SYSTEM_ADMIN or BOSS)

#### Step 2: Create Main Branch
**Who**: SYSTEM_ADMIN, BOSS  
**Endpoint**: `POST /api/v1/branches`  
**Action**: Create the first branch (main office/store)

```json
{
  "name": "Main Branch",
  "code": "MAIN",
  "address": "123 Main St, Kigali",
  "phone": "+250788123456",
  "isMainBranch": true
}
```

#### Step 3: Create BOSS User
**Who**: SYSTEM_ADMIN  
**Endpoint**: `POST /api/v1/users`  
**Action**: Create the organization owner account

```json
{
  "email": "boss@abcstore.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "BOSS",
  "branchId": "branch-id"
}
```

**Result**: BOSS can now login and manage their organization

---

### PHASE 3: TEAM SETUP (BOSS)

#### Step 4: Create Additional Branches (Optional)
**Who**: BOSS  
**Endpoint**: `POST /api/v1/branches`  
**Action**: Add more store locations

```json
{
  "name": "Downtown Branch",
  "code": "DT",
  "address": "456 Downtown Ave",
  "phone": "+250788999888"
}
```

#### Step 5: Create Manager Users
**Who**: BOSS  
**Endpoint**: `POST /api/v1/users`  
**Action**: Add managers for each branch

```json
{
  "email": "manager@abcstore.com",
  "password": "ManagerPass123!",
  "fullName": "Jane Manager",
  "role": "MANAGER",
  "branchId": "branch-id"
}
```

#### Step 6: Create Cashier Users
**Who**: BOSS  
**Endpoint**: `POST /api/v1/users`  
**Action**: Add cashiers for sales operations

```json
{
  "email": "cashier@abcstore.com",
  "password": "CashierPass123!",
  "fullName": "Mike Cashier",
  "role": "CASHIER",
  "branchId": "branch-id"
}
```

#### Step 7: Create Employee Records
**Who**: BOSS, MANAGER  
**Endpoint**: `POST /api/v1/employees`  
**Action**: Link users to employee records (for payroll, HR)

```json
{
  "userId": "user-id",
  "employeeCode": "EMP001",
  "department": "Sales",
  "position": "Cashier",
  "salary": 150000,
  "commissionRate": 2.5,
  "hireDate": "2026-01-01"
}
```

---

### PHASE 4: INVENTORY SETUP (BOSS, MANAGER)

#### Step 8: Add Suppliers
**Who**: BOSS, MANAGER  
**Endpoint**: `POST /api/v1/suppliers`  
**Action**: Register suppliers for purchasing inventory

```json
{
  "name": "ABC Wholesalers",
  "contactPerson": "David Smith",
  "phone": "+250788111111",
  "email": "abc@wholesale.com",
  "address": "Industrial Area",
  "creditLimit": 5000000,
  "paymentTerms": "Net 30"
}
```

#### Step 9: Add Products
**Who**: BOSS, MANAGER  
**Endpoint**: `POST /api/v1/products`  
**Action**: Create product catalog

```json
{
  "name": "Rice 25kg",
  "sku": "RICE-25",
  "category": "Grains",
  "unit": "bag",
  "costPrice": 18000,
  "sellingPrice": 22000,
  "minStockLevel": 10,
  "maxStockLevel": 100,
  "reorderPoint": 15
}
```

---

### PHASE 5: DAILY OPERATIONS

#### A. PURCHASING FLOW (BOSS, MANAGER)

**Step 10: Create Purchase Order (Optional)**
**Who**: BOSS, MANAGER  
**Endpoint**: `POST /api/v1/purchase-orders`  
**Action**: Order inventory from supplier

```json
{
  "supplierId": "supplier-id",
  "expectedDate": "2026-03-01",
  "items": [
    {
      "productId": "product-id",
      "quantity": 50,
      "unitPrice": 18000
    }
  ]
}
```

**Step 11: Record Purchase (Goods Received)**
**Who**: BOSS, MANAGER  
**Endpoint**: `POST /api/v1/purchases`  
**Action**: Record received inventory

```json
{
  "supplierId": "supplier-id",
  "items": [
    {
      "productId": "product-id",
      "quantity": 50,
      "costPrice": 18000
    }
  ],
  "paymentStatus": "PAID",
  "paymentMethod": "BANK_TRANSFER"
}
```

**Result**: Stock automatically increases

---

#### B. SALES FLOW (CASHIER, MANAGER, BOSS)

**Step 12: Create Sale (Cash Sale - No Customer Needed)**
**Who**: CASHIER, MANAGER, BOSS  
**Endpoint**: `POST /api/v1/sales`  
**Action**: Process walk-in customer purchase

```json
{
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "sellingPrice": 22000
    }
  ],
  "paymentMethod": "CASH",
  "paymentStatus": "PAID",
  "discount": 0
}
```

**Result**: 
- Stock automatically decreases
- Revenue recorded
- No customer record needed

**Step 13: Create Credit/Loan Sale (Customer Required)**
**Who**: CASHIER, MANAGER, BOSS  
**Endpoint**: `POST /api/v1/sales`  
**Action**: Process credit sale for registered customer

**First, add customer if not exists:**
```json
POST /api/v1/customers
{
  "name": "Alice Mukamana",
  "phone": "+250788333333",
  "email": "alice@email.com",
  "customerType": "REGULAR",
  "creditLimit": 100000
}
```

**Then create credit sale:**
```json
{
  "customerId": "customer-id",
  "customerName": "Alice Mukamana",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "sellingPrice": 22000
    }
  ],
  "paymentMethod": "CASH",
  "paymentStatus": "UNPAID",
  "discount": 2000
}
```

**Result**: 
- Stock automatically decreases
- Credit sale tracked under customer
- Customer debt increases
- Payment can be collected later

---

#### C. STOCK MANAGEMENT (MANAGER, BOSS)

**Step 14: Stock Adjustment**
**Who**: MANAGER, BOSS  
**Endpoint**: `POST /api/v1/stock/adjust`  
**Action**: Adjust stock for damaged/lost items

```json
{
  "productId": "product-id",
  "quantity": -5,
  "type": "DAMAGE",
  "reason": "Damaged during transport"
}
```

**Step 15: Stock Transfer**
**Who**: MANAGER, BOSS  
**Endpoint**: `POST /api/v1/stock/transfer`  
**Action**: Move stock between branches

```json
{
  "productId": "product-id",
  "fromBranchId": "branch-1",
  "toBranchId": "branch-2",
  "quantity": 10
}
```

---

#### D. PROMOTIONS & PRICING (BOSS, MANAGER)

**Step 16: Create Promotion**
**Who**: BOSS, MANAGER  
**Endpoint**: `POST /api/v1/promotions`  
**Action**: Set up discounts/offers

```json
{
  "name": "Weekend Special",
  "type": "DISCOUNT",
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "startDate": "2026-02-28",
  "endDate": "2026-03-02",
  "productIds": ["product-1", "product-2"]
}
```

---

#### E. EXPENSE TRACKING (CASHIER, MANAGER, BOSS)

**Step 17: Record Daily Expenses**
**Who**: CASHIER, MANAGER, BOSS  
**Endpoint**: `POST /api/v1/expenses`  
**Action**: Track daily business expenses

**Common Cashier Expenses:**
```json
{
  "category": "TRANSPORT",
  "amount": 5000,
  "description": "Taxi to bank",
  "date": "2026-02-26",
  "paymentMethod": "CASH"
}
```

**Other Expense Examples:**
```json
// Cleaning supplies
{
  "category": "SUPPLIES",
  "amount": 15000,
  "description": "Cleaning materials",
  "date": "2026-02-26",
  "paymentMethod": "CASH"
}

// Utilities (Manager/Boss)
{
  "category": "UTILITIES",
  "amount": 150000,
  "description": "Electricity bill",
  "date": "2026-02-24",
  "paymentMethod": "BANK_TRANSFER"
}
```

**Expense Categories:**
- TRANSPORT - Taxi, fuel, delivery
- SUPPLIES - Cleaning, stationery, packaging
- UTILITIES - Electricity, water, internet
- MAINTENANCE - Repairs, equipment servicing
- RENT - Store/office rent
- SALARIES - Employee payments
- MARKETING - Advertising, promotions
- INSURANCE - Business insurance
- TAXES - Government taxes
- OTHER - Miscellaneous expenses

---

#### F. TASK MANAGEMENT (BOSS, MANAGER)

**Step 18: Assign Tasks**
**Who**: BOSS, MANAGER  
**Endpoint**: `POST /api/v1/tasks`  
**Action**: Assign work to team members

```json
{
  "title": "Check inventory levels",
  "description": "Review all products below minimum stock",
  "assignedTo": "user-id",
  "priority": "HIGH",
  "dueDate": "2026-02-28"
}
```

---

### PHASE 6: MONITORING & REPORTING

#### Step 19: View Dashboard
**Who**: BOSS, MANAGER  
**Endpoint**: `GET /api/v1/analytics/dashboard`  
**Action**: Real-time business metrics

**Shows**:
- Today's sales
- Low stock alerts
- Pending tasks
- Revenue trends

#### Step 20: Generate Reports
**Who**: BOSS, MANAGER  
**Endpoint**: `GET /api/v1/reports/*`  
**Available Reports**:

1. **Sales Reports**
   - Daily: `GET /api/v1/reports/sales/daily?date=2026-02-26`
   - Monthly: `GET /api/v1/reports/sales/monthly?month=2&year=2026`
   - By Product: `GET /api/v1/reports/sales/by-product`

2. **Inventory Reports**
   - Current Stock: `GET /api/v1/reports/inventory/current`
   - Low Stock: `GET /api/v1/reports/inventory/low-stock`
   - Stock Value: `GET /api/v1/reports/inventory/value`

3. **Financial Reports**
   - Profit/Loss: `GET /api/v1/reports/financial/profit-loss`
   - Expenses: `GET /api/v1/reports/financial/expenses`

4. **Performance Reports**
   - Top Products: `GET /api/v1/reports/performance/top-products`
   - Employee Performance: `GET /api/v1/reports/performance/employees`

---

## 📊 Typical Daily Workflow

### Morning (Manager/Boss)
1. Login to system
2. Check dashboard for overnight alerts
3. Review low stock notifications
4. Check pending tasks
5. Review yesterday's sales report

### During Business Hours (Cashier)
1. Login to system
2. Process customer sales:
   - **Cash sales**: No customer needed, just scan/select products
   - **Credit sales**: Must select/add customer first
3. Record daily expenses (transport, supplies, etc.)
4. Add new customers only for credit/loan sales
5. Handle returns/exchanges (if applicable)
6. Check product availability

### During Business Hours (Manager)
1. Monitor sales in real-time
2. Approve purchase orders
3. Receive and record inventory deliveries
4. Handle stock adjustments
5. Assign tasks to team
6. Respond to low stock alerts

### End of Day (Manager/Boss)
1. Review daily sales report
2. Check cash/payment reconciliation
3. Review completed tasks
4. Plan next day's operations
5. Generate reports for analysis

---

## 🔐 Security & Access Control

### Authentication Flow
1. User logs in: `POST /api/v1/auth/login`
2. Receives JWT access token (15 min expiry)
3. Receives refresh token (7 days expiry)
4. Uses access token for all requests
5. Refreshes token when expired: `POST /api/v1/auth/refresh`

### Authorization Rules
- **SYSTEM_ADMIN**: Can access ALL organizations and data
- **BOSS**: Can only access their organization's data
- **MANAGER**: Can only access their organization's data (limited write)
- **CASHIER**: Can only access sales and customer modules

---

## 📱 Key Features

### Real-time Notifications
- Low stock alerts
- Task assignments
- New messages
- System updates

### Multi-branch Support
- Separate inventory per branch
- Stock transfers between branches
- Branch-specific reports
- Consolidated organization reports

### Customer Management
- Customer registration **only required for credit/loan sales**
- Cash sales don't need customer records
- Purchase history tracked for registered customers
- Loyalty points (if enabled)
- Credit limits for loan customers

### Analytics
- Sales trends
- Product performance
- Employee performance
- Financial insights

---

## 🚨 Important Business Rules

1. **Stock Management**
   - Stock decreases automatically on sale
   - Stock increases automatically on purchase
   - Cannot sell more than available stock
   - Low stock alerts at reorder point

2. **Pricing**
   - Selling price must be >= cost price (warning if not)
   - Promotions apply automatically at sale time
   - Discounts can be applied per sale

3. **Payments**
   - Multiple payment methods supported
   - Partial payments tracked
   - Credit sales monitored

4. **User Access**
   - Users belong to one organization
   - Users assigned to one branch
   - Cannot access other organizations' data
   - SYSTEM_ADMIN sees everything

---

## 📞 Support & Troubleshooting

### Common Issues

**"Unauthorized" Error**
- Ensure you're logged in
- Check if token expired (refresh it)
- Verify you have permission for that action

**"Low Stock" Alert**
- Create purchase order
- Record new purchase
- Or adjust reorder point

**Cannot Create Sale**
- Check if product has sufficient stock
- Verify product is active
- Ensure user has CASHIER role or higher

---

## 🎓 Training Recommendations

### For BOSS
- Complete system overview
- User management
- Inventory setup
- Report generation
- Financial tracking

### For MANAGER
- Daily operations
- Stock management
- Purchase recording
- Team task assignment
- Basic reporting

### For CASHIER
- Sales processing
- Customer management
- Basic product lookup
- Payment handling

---

## 📈 Success Metrics

Track these KPIs:
- Daily sales volume
- Inventory turnover rate
- Stock-out frequency
- Average transaction value
- Customer retention rate
- Employee productivity
- Profit margins

---

**System Version**: 1.0  
**Last Updated**: February 26, 2026  
**API Base URL**: https://akariza-backend.onrender.com/api/v1  
**Documentation**: https://akariza-backend.onrender.com/api/v1/docs
