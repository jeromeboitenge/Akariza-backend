# CASHIER Role - Endpoints & Permissions

## ✅ What CASHIER Can Do

### 1. **Products** (Read Only)
- `GET /api/v1/products` - View all products
- `GET /api/v1/products/type/:type` - View by type (REGULAR/FAST_MOVING)
- `GET /api/v1/products/low-stock` - View low stock items
- `GET /api/v1/products/:id` - View product details

### 2. **Sales** (Full Access)
- `POST /api/v1/sales` - Create sale (main job)
- `GET /api/v1/sales` - View all sales
- `GET /api/v1/sales/my-sales` - View only their own sales
- `GET /api/v1/sales/:id` - View sale details

### 3. **Customers** (Full Access)
- `POST /api/v1/customers` - Create customer (for credit sales)
- `GET /api/v1/customers` - View all customers
- `GET /api/v1/customers/:id` - View customer details
- `POST /api/v1/customers/:id/loyalty/add` - Add loyalty points

### 4. **Suppliers** (Read Only)
- `GET /api/v1/suppliers` - View all suppliers
- `GET /api/v1/suppliers/:id` - View supplier details

### 5. **Purchases** (Read Only)
- `GET /api/v1/purchases` - View all purchases
- `GET /api/v1/purchases/:id` - View purchase details

### 6. **Expenses** (Full Access)
- `POST /api/v1/expenses` - Create expense
- `GET /api/v1/expenses` - View expenses
- `GET /api/v1/expenses/categories` - View categories
- `GET /api/v1/expenses/summary` - View summary

## ❌ What CASHIER Cannot Do

- Create/Edit/Delete products
- Create/Edit/Delete suppliers
- Create purchases
- Manage users
- Manage branches
- View reports (restricted to BOSS/MANAGER)
- Manage organization settings

## 📝 Typical CASHIER Workflow

### Cash Sale:
1. `GET /api/v1/products` - View available products
2. `POST /api/v1/sales` - Create sale
   ```json
   {
     "items": [
       { "productId": "xxx", "quantity": 2, "sellingPrice": 1000 }
     ],
     "paymentMethod": "CASH",
     "amountPaid": 2000
   }
   ```

### Credit Sale:
1. `GET /api/v1/customers` - Find customer
2. If not exists: `POST /api/v1/customers` - Create customer
3. `POST /api/v1/sales` - Create sale with customerId
   ```json
   {
     "items": [...],
     "paymentMethod": "CREDIT",
     "amountPaid": 500,
     "customerId": "customer-id"
   }
   ```

### View Own Sales:
- `GET /api/v1/sales/my-sales` - See only sales they created

## 🔒 Security Notes

- CASHIER can only see data from their organization
- Cannot modify products or prices
- Cannot delete any records
- All actions are logged in audit trail
