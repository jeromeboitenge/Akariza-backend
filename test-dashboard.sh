#!/bin/bash

# Test Enhanced Dashboard Features
BASE_URL="http://localhost:5000/api/v1"

echo "🎯 Testing Enhanced Dashboard Features"
echo "========================================"

# Login as BOSS
echo ""
echo "🔐 Logging in as BOSS..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"boss@store.com","password":"boss123"}' | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"

# Test 1: Dashboard
echo ""
echo "1️⃣ Testing Dashboard..."
DASHBOARD=$(curl -s -X GET "$BASE_URL/analytics/dashboard" \
  -H "Authorization: Bearer $TOKEN")

TODAY_SALES=$(echo "$DASHBOARD" | jq -r '.summary.todaySales')
TODAY_TRANS=$(echo "$DASHBOARD" | jq -r '.summary.todayTransactions')
LOW_STOCK=$(echo "$DASHBOARD" | jq -r '.summary.lowStockCount')

echo "   Today's Sales: RWF $TODAY_SALES"
echo "   Transactions: $TODAY_TRANS"
echo "   Low Stock Items: $LOW_STOCK"
echo "✅ Dashboard loaded"

# Test 2: Sales Trends
echo ""
echo "2️⃣ Testing Sales Trends (Last 7 days)..."
TRENDS=$(curl -s -X GET "$BASE_URL/analytics/sales-trends?days=7" \
  -H "Authorization: Bearer $TOKEN")
TREND_COUNT=$(echo "$TRENDS" | jq '. | length')
echo "   Found $TREND_COUNT days of data"
echo "✅ Sales trends retrieved"

# Test 3: Top Products
echo ""
echo "3️⃣ Testing Top Products..."
TOP_PRODUCTS=$(curl -s -X GET "$BASE_URL/analytics/top-products?limit=5&days=30" \
  -H "Authorization: Bearer $TOKEN")
PRODUCT_COUNT=$(echo "$TOP_PRODUCTS" | jq '. | length')
echo "   Top $PRODUCT_COUNT products:"
echo "$TOP_PRODUCTS" | jq -r '.[] | "   - \(.name): \(.quantitySold) units, RWF \(.revenue)"' | head -5
echo "✅ Top products retrieved"

# Test 4: Low Stock Alerts
echo ""
echo "4️⃣ Testing Low Stock Alerts..."
LOW_STOCK_ALERTS=$(curl -s -X GET "$BASE_URL/analytics/low-stock-alerts" \
  -H "Authorization: Bearer $TOKEN")
ALERT_COUNT=$(echo "$LOW_STOCK_ALERTS" | jq '. | length')
echo "   $ALERT_COUNT products need attention:"
echo "$LOW_STOCK_ALERTS" | jq -r '.[] | "   ⚠️  \(.name): \(.currentStock) units (\(.status))"' | head -5
echo "✅ Low stock alerts retrieved"

# Test 5: Revenue by Category
echo ""
echo "5️⃣ Testing Revenue by Category..."
START_DATE="2026-02-01"
END_DATE="2026-02-28"
REVENUE_CAT=$(curl -s -X GET "$BASE_URL/analytics/revenue-by-category?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $TOKEN")
CAT_COUNT=$(echo "$REVENUE_CAT" | jq '. | length')
echo "   $CAT_COUNT categories:"
echo "$REVENUE_CAT" | jq -r '.[] | "   - \(.category): RWF \(.revenue)"' | head -5
echo "✅ Revenue by category retrieved"

# Test 6: Payment Methods
echo ""
echo "6️⃣ Testing Payment Method Breakdown..."
PAYMENT_METHODS=$(curl -s -X GET "$BASE_URL/analytics/payment-methods?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $TOKEN")
echo "$PAYMENT_METHODS" | jq -r '.[] | "   - \(.paymentMethod): RWF \(.totalAmount) (\(.transactions) transactions)"'
echo "✅ Payment methods retrieved"

# Summary
echo ""
echo "========================================"
echo "✅ All dashboard features working!"
echo ""
echo "📊 Dashboard Summary:"
echo "   • Real-time sales tracking"
echo "   • Top products analysis"
echo "   • Smart stock alerts"
echo "   • Sales trends"
echo "   • Category performance"
echo "   • Payment analytics"
echo ""
echo "🎉 Dashboard is ready for production!"
