# 📦 Stock Management - Sales, Purchases & Stock Flow

## How Stock Quantity is Automatically Updated

### ✅ Three Operations That Change Stock:

1. **PURCHASE** → Stock **INCREASES** ⬆️
2. **SALE** → Stock **DECREASES** ⬇️
3. **STOCK ADJUSTMENT** → Stock **INCREASES or DECREASES** ⬆️⬇️

---

## 1. 🛒 PURCHASE (Stock Increases)

### Endpoint:
```http
POST /api/v1/purchases
```

### Example:
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
  "amountPaid": 900000
}
```

### What Happens Automatically:
1. ✅ Purchase record created
2. ✅ Product stock **INCREASES** by 50
3. ✅ Stock transaction logged: `+50`
4. ✅ Product `currentStock` updated
5. ✅ Product `costPrice` updated

### Example Flow:
```
Before: Rice stock = 100 bags
Purchase: +50 bags
After: Rice stock = 150 bags ✅
```

---

## 2. 💰 SALE (Stock Decreases)

### Endpoint:
```http
POST /api/v1/sales
```

### Example:
```json
{
  "items": [
    {
      "productId": "product-id",
      "quantity": 5,
      "sellingPrice": 22000
    }
  ],
  "paymentMethod": "CASH",
  "customerName": "John Doe"
}
```

### What Happens Automatically:
1. ✅ Sale record created
2. ✅ Product stock **DECREASES** by 5
3. ✅ Stock transaction logged: `-5`
4. ✅ Product `currentStock` updated
5. ✅ Profit calculated automatically

### Example Flow:
```
Before: Rice stock = 150 bags
Sale: -5 bags
After: Rice stock = 145 bags ✅
```

### Stock Validation:
- ❌ **Cannot sell more than available stock**
- System returns error: "Insufficient stock"

---

## 3. 🔧 STOCK ADJUSTMENT (Manual Correction)

### Endpoint:
```http
POST /api/v1/stock/adjust
```

### Example (Add Stock):
```json
{
  "productId": "product-id",
  "quantity": 10,
  "notes": "Found extra stock in warehouse"
}
```

### Example (Remove Stock):
```json
{
  "productId": "product-id",
  "quantity": -3,
  "notes": "Damaged items removed"
}
```

### What Happens Automatically:
1. ✅ Stock adjustment record created
2. ✅ Product stock **INCREASES or DECREASES**
3. ✅ Stock transaction logged
4. ✅ Product `currentStock` updated
5. ✅ Notes saved for audit

### Example Flow:
```
Before: Rice stock = 145 bags
Adjustment: +10 bags (found in warehouse)
After: Rice stock = 155 bags ✅

Before: Milk stock = 50 liters
Adjustment: -3 liters (damaged)
After: Milk stock = 47 liters ✅
```

---

## 📊 Stock Transaction History

Every change is logged in `stockTransactions` table:

```json
{
  "type": "PURCHASE",
  "quantity": 50,
  "balanceAfter": 150,
  "referenceType": "Purchase",
  "referenceId": "purchase-id",
  "createdAt": "2026-02-24T14:00:00Z"
}
```

### View Stock History:
```http
GET /api/v1/stock/transactions?productId=product-id
```

**Response:**
```json
[
  {
    "type": "PURCHASE",
    "quantity": 50,
    "balanceAfter": 150,
    "createdAt": "2026-02-24T08:00:00Z"
  },
  {
    "type": "SALE",
    "quantity": -5,
    "balanceAfter": 145,
    "createdAt": "2026-02-24T10:30:00Z"
  },
  {
    "type": "ADJUSTMENT",
    "quantity": 10,
    "balanceAfter": 155,
    "notes": "Found in warehouse",
    "createdAt": "2026-02-24T14:00:00Z"
  }
]
```

---

## 🔄 Complete Stock Flow Example

### Day 1: Initial Stock
```
Product: Rice 25kg
Initial Stock: 100 bags
```

### Day 1 Morning: Purchase
```http
POST /api/v1/purchases
{
  "supplierId": "supplier-1",
  "items": [{"productId": "rice-id", "quantity": 50, "costPrice": 18000}]
}
```
**Result:** Stock = 150 bags ✅

### Day 1 Afternoon: Sales
```http
POST /api/v1/sales
{"items": [{"productId": "rice-id", "quantity": 2, "sellingPrice": 22000}]}
```
**Result:** Stock = 148 bags ✅

```http
POST /api/v1/sales
{"items": [{"productId": "rice-id", "quantity": 3, "sellingPrice": 22000}]}
```
**Result:** Stock = 145 bags ✅

### Day 1 Evening: Stock Check
```http
GET /api/v1/products/rice-id
```
**Response:**
```json
{
  "name": "Rice 25kg",
  "currentStock": 145,
  "costPrice": 18000,
  "sellingPrice": 22000
}
```

### Day 2: Adjustment
```http
POST /api/v1/stock/adjust
{
  "productId": "rice-id",
  "quantity": -5,
  "notes": "Damaged bags removed"
}
```
**Result:** Stock = 140 bags ✅

---

## 🎯 Key Features

### Automatic Stock Updates
- ✅ No manual calculation needed
- ✅ Real-time stock updates
- ✅ Atomic transactions (all or nothing)
- ✅ Stock validation (prevents negative stock)

### Stock Tracking
- ✅ Every change is logged
- ✅ Balance after each transaction
- ✅ Audit trail with timestamps
- ✅ User tracking (who made the change)

### Stock Alerts
- ✅ Low stock detection
- ✅ Minimum level alerts
- ✅ Reorder point notifications

---

## 📈 Reports Available

### 1. Current Stock Levels
```http
GET /api/v1/products
```

### 2. Low Stock Products
```http
GET /api/v1/products/low-stock
```

### 3. Stock Valuation
```http
GET /api/v1/stock/valuation
```

### 4. Stock Movement History
```http
GET /api/v1/stock/transactions
```

### 5. Daily Sales Report
```http
GET /api/v1/reports/sales/daily?date=2026-02-24
```

---

## ✅ Summary

**Stock is automatically managed by:**

1. **Purchases** → Add stock
2. **Sales** → Reduce stock
3. **Adjustments** → Correct stock

**Every operation:**
- ✅ Updates product quantity
- ✅ Logs transaction
- ✅ Validates stock levels
- ✅ Prevents negative stock
- ✅ Tracks who made the change
- ✅ Records timestamp

**No manual stock updates needed - everything is automatic!** 🎉

---

## 🚀 Test the Flow

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"boss@store.com","password":"boss123"}' | jq -r '.accessToken')

# 2. Check current stock
curl -X GET http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {name, currentStock}'

# 3. Make a sale (stock decreases)
curl -X POST http://localhost:5000/api/v1/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId":"PRODUCT_ID","quantity":2,"sellingPrice":1500}],
    "paymentMethod":"CASH"
  }'

# 4. Check stock again (should be reduced)
curl -X GET http://localhost:5000/api/v1/products/PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN" | jq '{name, currentStock}'

# 5. View stock history
curl -X GET "http://localhost:5000/api/v1/stock/transactions?productId=PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

**Your stock management is fully automated and working!** ✅
