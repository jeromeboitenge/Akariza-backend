# 📊 Akariza - Automatic Stock & Reporting System

## ✅ How It Works (Already Implemented)

### 1. **Cashier Daily Operations**

#### When Cashier Sells Products:
```bash
POST /api/sales
{
  "items": [
    {"productId": "xxx", "quantity": 5, "sellingPrice": 1500}
  ],
  "paymentMethod": "CASH",
  "customerName": "John Doe"
}
```

**What Happens Automatically:**
1. ✅ Sale is recorded
2. ✅ Stock **DECREASES** by quantity sold
3. ✅ Stock transaction is logged
4. ✅ Profit is calculated (selling price - cost price)
5. ✅ Available for daily reports

#### When Cashier Purchases Products:
```bash
POST /api/purchases
{
  "supplierId": "xxx",
  "items": [
    {"productId": "xxx", "quantity": 50, "costPrice": 1200}
  ],
  "paymentStatus": "PAID"
}
```

**What Happens Automatically:**
1. ✅ Purchase is recorded
2. ✅ Stock **INCREASES** by quantity purchased
3. ✅ Stock transaction is logged
4. ✅ Product cost price is updated
5. ✅ Available for daily reports

---

## 📈 Automatic Reports (Already Available)

### 1. **Daily Sales Report**
```bash
GET /api/reports/sales/daily?date=2026-02-24
```

**Returns:**
- Total sales for the day
- Number of transactions
- Total revenue
- Products sold

### 2. **Weekly Sales Report**
```bash
GET /api/reports/sales/monthly?month=2026-02
```
Filter by week using the daily data (group by 7 days)

### 3. **Monthly Sales Report**
```bash
GET /api/reports/sales/monthly?month=2026-02
```

**Returns:**
- Sales grouped by day
- Total monthly revenue
- Best-selling products
- Trends

### 4. **Profit Report**
```bash
GET /api/reports/profit?startDate=2026-02-01&endDate=2026-02-28
```

**Returns:**
- Total revenue
- Total cost
- Gross profit
- Profit margin %

### 5. **Best Selling Products**
```bash
GET /api/reports/best-selling?limit=10
```

**Returns:**
- Top products by quantity sold
- Revenue per product

### 6. **Stock Valuation**
```bash
GET /api/stock/valuation
```

**Returns:**
- Total inventory value
- Stock by product
- Low stock alerts

### 7. **Stock Movement History**
```bash
GET /api/stock/transactions?productId=xxx
```

**Returns:**
- All stock changes (sales, purchases, adjustments)
- Balance after each transaction
- Date and time of each change

---

## 🔄 Automatic Stock Management

### Stock Flow:

```
PURCHASE → Stock +50 → Current Stock: 150
SALE     → Stock -5  → Current Stock: 145
SALE     → Stock -3  → Current Stock: 142
```

### Stock Transaction Log (Automatic):
```json
[
  {
    "type": "PURCHASE",
    "quantity": 50,
    "balanceAfter": 150,
    "referenceType": "Purchase",
    "createdAt": "2026-02-24T08:00:00Z"
  },
  {
    "type": "SALE",
    "quantity": -5,
    "balanceAfter": 145,
    "referenceType": "Sale",
    "createdAt": "2026-02-24T10:30:00Z"
  }
]
```

---

## 📱 Cashier Workflow

### Morning:
1. Login: `POST /api/auth/login`
2. Check stock: `GET /api/products`
3. View low stock: `GET /api/products/low-stock`

### During Day:
4. Record sales: `POST /api/sales` (stock decreases automatically)
5. Record purchases: `POST /api/purchases` (stock increases automatically)
6. Check current stock: `GET /api/products/:id`

### End of Day:
7. View daily report: `GET /api/reports/sales/daily?date=2026-02-24`
8. Check stock valuation: `GET /api/stock/valuation`
9. View transactions: `GET /api/stock/transactions`

---

## 🎯 Example: Complete Day Scenario

### 1. Morning Stock Check
```bash
GET /api/products
# Returns: Rice (50 bags), Sugar (200 kg), Oil (30 bottles)
```

### 2. Customer Buys Rice
```bash
POST /api/sales
{
  "items": [{"productId": "rice-id", "quantity": 2, "sellingPrice": 22000}],
  "paymentMethod": "CASH"
}
# Stock automatically: Rice = 48 bags
```

### 3. Receive New Stock
```bash
POST /api/purchases
{
  "supplierId": "supplier-id",
  "items": [{"productId": "sugar-id", "quantity": 100, "costPrice": 1200}]
}
# Stock automatically: Sugar = 300 kg
```

### 4. End of Day Report
```bash
GET /api/reports/sales/daily?date=2026-02-24
```

**Response:**
```json
{
  "date": "2026-02-24",
  "totalSales": 44000,
  "totalTransactions": 1,
  "products": [
    {
      "name": "Rice 25kg",
      "quantitySold": 2,
      "revenue": 44000,
      "profit": 8000
    }
  ]
}
```

---

## 📊 Weekly & Monthly Reports

### Weekly Report (Last 7 Days):
```bash
GET /api/reports/sales/monthly?month=2026-02
# Filter results for last 7 days in your app
```

### Monthly Report:
```bash
GET /api/reports/sales/monthly?month=2026-02
```

**Response:**
```json
{
  "month": "2026-02",
  "totalSales": 1500000,
  "totalProfit": 300000,
  "dailyBreakdown": [
    {"date": "2026-02-01", "sales": 50000},
    {"date": "2026-02-02", "sales": 45000},
    ...
  ],
  "topProducts": [...]
}
```

---

## ✅ Everything is Automatic!

**No manual calculations needed:**
- ✅ Stock updates automatically on sale/purchase
- ✅ Profit calculated automatically
- ✅ Reports generated from real-time data
- ✅ Stock transactions logged automatically
- ✅ Low stock alerts automatic
- ✅ All data available via API

---

## 🚀 Quick Test

```bash
# 1. Login as Cashier
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cashier@store.com","password":"cashier123"}' | jq -r '.accessToken')

# 2. Create a Sale (Stock decreases automatically)
curl -X POST http://localhost:5000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId":"PRODUCT_ID","quantity":2,"sellingPrice":1500}],
    "paymentMethod":"CASH"
  }'

# 3. View Daily Report
curl -X GET "http://localhost:5000/api/reports/sales/daily?date=2026-02-24" \
  -H "Authorization: Bearer $TOKEN"

# 4. Check Stock
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 All Features Working:
✅ Automatic stock decrease on sales  
✅ Automatic stock increase on purchases  
✅ Daily reports  
✅ Weekly reports (via monthly endpoint)  
✅ Monthly reports  
✅ Profit calculations  
✅ Stock transaction history  
✅ Low stock alerts  
✅ Best-selling products  
✅ Stock valuation  

**Your system is production-ready!** 🎉
