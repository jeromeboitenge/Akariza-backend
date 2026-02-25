# Enhanced Dashboard Features

## 🎯 New Analytics Endpoints

### 1. **GET /analytics/dashboard**
Real-time dashboard with comprehensive metrics

**Response:**
```json
{
  "summary": {
    "todaySales": 450000,
    "todayTransactions": 23,
    "monthSales": 12500000,
    "monthTransactions": 456,
    "yearSales": 45000000,
    "lowStockCount": 5,
    "pendingPayments": 250000,
    "pendingPaymentsCount": 3
  },
  "lowStockProducts": [
    {
      "id": "prod-1",
      "name": "Rice 25kg",
      "sku": "RICE-25",
      "currentStock": 5,
      "minStockLevel": 10
    }
  ],
  "topProductsToday": [
    {
      "productId": "prod-2",
      "productName": "Sugar 1kg",
      "sku": "SUGAR-1",
      "quantitySold": 45,
      "revenue": 67500
    }
  ],
  "recentSales": [
    {
      "id": "sale-1",
      "saleNumber": "SALE-123",
      "totalAmount": 25000,
      "paymentMethod": "CASH",
      "customerName": "John Doe",
      "createdAt": "2026-02-25T10:30:00Z"
    }
  ],
  "cashierPerformance": [
    {
      "userId": "user-1",
      "userName": "Jane Cashier",
      "role": "CASHIER",
      "sales": 150000,
      "transactions": 12
    }
  ]
}
```

**Use Cases:**
- Display on main dashboard
- Real-time business overview
- Quick decision making

---

### 2. **GET /analytics/sales-trends**
Track sales patterns over time

**Query Params:**
- `period`: daily | weekly | monthly (default: daily)
- `days`: number of days to analyze (default: 7)

**Response:**
```json
[
  {
    "date": "2026-02-25",
    "sales": 450000,
    "count": 23
  },
  {
    "date": "2026-02-24",
    "sales": 380000,
    "count": 19
  }
]
```

**Use Cases:**
- Identify peak sales days
- Spot trends and patterns
- Plan inventory accordingly

---

### 3. **GET /analytics/top-products**
Best performing products

**Query Params:**
- `limit`: number of products (default: 10)
- `days`: analysis period (default: 30)

**Response:**
```json
[
  {
    "productId": "prod-1",
    "name": "Rice 25kg",
    "sku": "RICE-25",
    "category": "Grains",
    "quantitySold": 150,
    "revenue": 3300000,
    "transactions": 45,
    "avgPrice": 22000
  }
]
```

**Use Cases:**
- Focus on bestsellers
- Optimize inventory
- Plan promotions

---

### 4. **GET /analytics/low-stock-alerts**
Smart inventory alerts with predictions

**Response:**
```json
[
  {
    "id": "prod-1",
    "name": "Rice 25kg",
    "sku": "RICE-25",
    "currentStock": 5,
    "minStockLevel": 10,
    "reorderPoint": 15,
    "category": "Grains",
    "status": "CRITICAL",
    "daysUntilStockout": 3
  }
]
```

**Status Types:**
- `OUT_OF_STOCK`: 0 items
- `CRITICAL`: Below reorder point
- `LOW`: Below minimum level

**Use Cases:**
- Prevent stockouts
- Automatic reorder suggestions
- Inventory planning

---

### 5. **GET /analytics/revenue-by-category**
Revenue breakdown by product categories

**Query Params:**
- `startDate`: YYYY-MM-DD (required)
- `endDate`: YYYY-MM-DD (required)

**Response:**
```json
[
  {
    "category": "Grains",
    "revenue": 5500000,
    "quantity": 250,
    "transactions": 78
  },
  {
    "category": "Beverages",
    "revenue": 3200000,
    "quantity": 450,
    "transactions": 123
  }
]
```

**Use Cases:**
- Identify profitable categories
- Category performance analysis
- Strategic planning

---

### 6. **GET /analytics/payment-methods**
Payment method breakdown

**Query Params:**
- `startDate`: YYYY-MM-DD (required)
- `endDate`: YYYY-MM-DD (required)

**Response:**
```json
[
  {
    "paymentMethod": "CASH",
    "totalAmount": 8500000,
    "transactions": 234
  },
  {
    "paymentMethod": "MOBILE",
    "totalAmount": 4200000,
    "transactions": 156
  },
  {
    "paymentMethod": "CARD",
    "totalAmount": 1800000,
    "transactions": 45
  }
]
```

**Use Cases:**
- Cash flow management
- Payment preference analysis
- Financial reconciliation

---

## 📊 Dashboard Widgets

### Widget 1: Today's Summary
```
┌─────────────────────────────────┐
│  TODAY'S SALES                  │
│  RWF 450,000                    │
│  23 transactions                │
│  ↑ 15% vs yesterday             │
└─────────────────────────────────┘
```

### Widget 2: Low Stock Alert
```
┌─────────────────────────────────┐
│  ⚠️  LOW STOCK ALERT            │
│  5 products need reorder        │
│  3 critical (< 3 days)          │
│  [View Details]                 │
└─────────────────────────────────┘
```

### Widget 3: Top Products Today
```
┌─────────────────────────────────┐
│  🏆 TOP SELLERS TODAY           │
│  1. Sugar 1kg - 45 units        │
│  2. Rice 25kg - 38 units        │
│  3. Cooking Oil - 32 units      │
└─────────────────────────────────┘
```

### Widget 4: Cashier Performance
```
┌─────────────────────────────────┐
│  👥 CASHIER PERFORMANCE         │
│  Jane: RWF 150,000 (12 sales)   │
│  John: RWF 120,000 (9 sales)    │
│  Mary: RWF 95,000 (7 sales)     │
└─────────────────────────────────┘
```

### Widget 5: Recent Sales
```
┌─────────────────────────────────┐
│  📝 RECENT SALES                │
│  10:45 - John Doe - RWF 25,000  │
│  10:32 - Jane Smith - RWF 18,500│
│  10:15 - Bob Wilson - RWF 42,000│
└─────────────────────────────────┘
```

---

## 🚀 Quick Start

### Test Dashboard Endpoint
```bash
# Login as BOSS
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"boss@store.com","password":"boss123"}' | jq -r '.accessToken')

# Get Dashboard
curl -X GET "http://localhost:5000/api/v1/analytics/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Get Sales Trends (Last 7 Days)
```bash
curl -X GET "http://localhost:5000/api/v1/analytics/sales-trends?days=7" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Get Top 5 Products
```bash
curl -X GET "http://localhost:5000/api/v1/analytics/top-products?limit=5&days=30" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Get Low Stock Alerts
```bash
curl -X GET "http://localhost:5000/api/v1/analytics/low-stock-alerts" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 💡 Integration Tips

### Frontend Dashboard Layout
```
┌──────────────────────────────────────────────────────┐
│  Header: Today's Summary (4 cards)                   │
├──────────────────────────────────────────────────────┤
│  Row 1: Sales Trends Chart | Top Products           │
├──────────────────────────────────────────────────────┤
│  Row 2: Low Stock Alerts | Cashier Performance      │
├──────────────────────────────────────────────────────┤
│  Row 3: Recent Sales | Payment Methods              │
└──────────────────────────────────────────────────────┘
```

### Refresh Intervals
- **Dashboard Summary**: Every 30 seconds
- **Recent Sales**: Every 10 seconds
- **Sales Trends**: Every 5 minutes
- **Low Stock**: Every 1 hour

### Mobile App
- Show summary cards on home screen
- Pull-to-refresh for latest data
- Push notifications for critical stock

---

## 🎨 UI Recommendations

### Color Coding
- **Green**: Positive trends, good stock levels
- **Yellow**: Low stock warnings
- **Red**: Critical alerts, stockouts
- **Blue**: Neutral information

### Icons
- 💰 Sales/Revenue
- 📦 Stock/Inventory
- 👥 Customers/Users
- 📊 Analytics/Reports
- ⚠️ Alerts/Warnings
- 🏆 Top Performers

---

## 📈 Business Insights

### Key Metrics to Track
1. **Daily Sales Target**: Set and track daily goals
2. **Stock Turnover**: How fast products sell
3. **Average Transaction**: Revenue per sale
4. **Customer Frequency**: Repeat purchases
5. **Profit Margins**: By product/category

### Actionable Insights
- **High sales + Low stock** → Reorder immediately
- **Low sales + High stock** → Run promotion
- **Consistent top sellers** → Increase stock
- **Slow movers** → Discount or discontinue

---

## ✅ What's New

✅ Real-time today's sales  
✅ Month and year totals  
✅ Top 5 products today  
✅ Low stock with predictions  
✅ Recent 5 sales  
✅ Cashier performance  
✅ Pending payments tracking  
✅ Sales trends over time  
✅ Revenue by category  
✅ Payment method breakdown  
✅ Smart stock alerts with days until stockout  

**All endpoints are live and ready to use!** 🎉
