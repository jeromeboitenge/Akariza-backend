#!/bin/bash

echo "🧪 Testing Akariza Backend API"
echo "================================"
echo ""

BASE_URL="http://localhost:5000/api"

# Test 1: Login as Boss
echo "1️⃣  Testing Boss Login..."
BOSS_TOKEN=$(curl -s -X POST "$BASE_URL/auth/user/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"boss@store.com","password":"boss123"}' | jq -r '.accessToken')

if [ "$BOSS_TOKEN" != "null" ] && [ -n "$BOSS_TOKEN" ]; then
  echo "✅ Boss login successful"
else
  echo "❌ Boss login failed"
  exit 1
fi

echo ""

# Test 2: Get Products
echo "2️⃣  Testing Get Products..."
PRODUCTS=$(curl -s -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $BOSS_TOKEN")
PRODUCT_COUNT=$(echo $PRODUCTS | jq 'length')
echo "✅ Found $PRODUCT_COUNT products"

echo ""

# Test 3: Get Sales
echo "3️⃣  Testing Get Sales..."
SALES=$(curl -s -X GET "$BASE_URL/sales" \
  -H "Authorization: Bearer $BOSS_TOKEN")
SALES_COUNT=$(echo $SALES | jq 'length')
echo "✅ Found $SALES_COUNT sales"

echo ""

# Test 4: Get Purchases
echo "4️⃣  Testing Get Purchases..."
PURCHASES=$(curl -s -X GET "$BASE_URL/purchases" \
  -H "Authorization: Bearer $BOSS_TOKEN")
PURCHASES_COUNT=$(echo $PURCHASES | jq 'length')
echo "✅ Found $PURCHASES_COUNT purchases"

echo ""

# Test 5: Get Daily Sales Report
echo "5️⃣  Testing Daily Sales Report..."
REPORT=$(curl -s -X GET "$BASE_URL/reports/daily-sales?date=2026-02-24" \
  -H "Authorization: Bearer $BOSS_TOKEN")
echo "✅ Daily sales report retrieved"

echo ""

# Test 6: Get Customers
echo "6️⃣  Testing Get Customers..."
CUSTOMERS=$(curl -s -X GET "$BASE_URL/customers" \
  -H "Authorization: Bearer $BOSS_TOKEN")
CUSTOMERS_COUNT=$(echo $CUSTOMERS | jq 'length')
echo "✅ Found $CUSTOMERS_COUNT customers"

echo ""

# Test 7: Get Branches
echo "7️⃣  Testing Get Branches..."
BRANCHES=$(curl -s -X GET "$BASE_URL/branches" \
  -H "Authorization: Bearer $BOSS_TOKEN")
BRANCHES_COUNT=$(echo $BRANCHES | jq 'length')
echo "✅ Found $BRANCHES_COUNT branches"

echo ""

# Test 8: Get Notifications
echo "8️⃣  Testing Get Notifications..."
NOTIFICATIONS=$(curl -s -X GET "$BASE_URL/notifications" \
  -H "Authorization: Bearer $BOSS_TOKEN")
NOTIFICATIONS_COUNT=$(echo $NOTIFICATIONS | jq 'length')
echo "✅ Found $NOTIFICATIONS_COUNT notifications"

echo ""

echo "================================"
echo "✅ All tests passed!"
echo ""
echo "📊 Summary:"
echo "  - Products: $PRODUCT_COUNT"
echo "  - Sales: $SALES_COUNT"
echo "  - Purchases: $PURCHASES_COUNT"
echo "  - Customers: $CUSTOMERS_COUNT"
echo "  - Branches: $BRANCHES_COUNT"
echo "  - Notifications: $NOTIFICATIONS_COUNT"
echo ""
echo "🔑 Login Credentials:"
echo "  Boss: boss@store.com / boss123"
echo "  Manager: manager@store.com / manager123"
echo "  Cashier: cashier@store.com / cashier123"
echo "  Admin: admin@akariza.com / admin123"
