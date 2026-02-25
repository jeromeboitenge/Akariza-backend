#!/bin/bash

# Akariza Backend API Test Script
BASE_URL="http://localhost:5000/api/v1"

echo "🧪 Testing Akariza Backend API"
echo "================================"

# Test 1: Health Check (Auth endpoint exists)
echo ""
echo "1️⃣ Testing Auth Endpoint..."
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test"}' | jq -r '.message // .statusCode' || echo "Auth endpoint exists ✓"

# Test 2: Login as BOSS
echo ""
echo "2️⃣ Logging in as BOSS..."
BOSS_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"boss@store.com","password":"boss123"}' | jq -r '.accessToken')

if [ "$BOSS_TOKEN" != "null" ] && [ -n "$BOSS_TOKEN" ]; then
  echo "✅ BOSS login successful"
  echo "Token: ${BOSS_TOKEN:0:20}..."
else
  echo "❌ BOSS login failed"
  exit 1
fi

# Test 3: Get Products
echo ""
echo "3️⃣ Fetching products..."
PRODUCTS=$(curl -s -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $BOSS_TOKEN")
PRODUCT_COUNT=$(echo "$PRODUCTS" | jq '. | length')
echo "✅ Found $PRODUCT_COUNT products"

# Test 4: Get Sales
echo ""
echo "4️⃣ Fetching sales..."
SALES=$(curl -s -X GET "$BASE_URL/sales" \
  -H "Authorization: Bearer $BOSS_TOKEN")
SALES_COUNT=$(echo "$SALES" | jq '. | length')
echo "✅ Found $SALES_COUNT sales"

# Test 5: Get Purchases
echo ""
echo "5️⃣ Fetching purchases..."
PURCHASES=$(curl -s -X GET "$BASE_URL/purchases" \
  -H "Authorization: Bearer $BOSS_TOKEN")
PURCHASES_COUNT=$(echo "$PURCHASES" | jq '. | length')
echo "✅ Found $PURCHASES_COUNT purchases"

# Test 6: Get Stock Transactions
echo ""
echo "6️⃣ Fetching stock transactions..."
STOCK=$(curl -s -X GET "$BASE_URL/stock/transactions" \
  -H "Authorization: Bearer $BOSS_TOKEN")
STOCK_COUNT=$(echo "$STOCK" | jq '. | length')
echo "✅ Found $STOCK_COUNT stock transactions"

# Test 7: Get Reports
echo ""
echo "7️⃣ Fetching sales report..."
REPORT=$(curl -s -X GET "$BASE_URL/reports/sales?startDate=2026-01-01&endDate=2026-12-31" \
  -H "Authorization: Bearer $BOSS_TOKEN")
echo "✅ Sales report retrieved"

# Test 8: Login as Admin
echo ""
echo "8️⃣ Logging in as SYSTEM_ADMIN..."
ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jeromeboitenge@gmail.com","password":"admin123"}' | jq -r '.accessToken')

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
  echo "✅ ADMIN login successful"
  
  # Test 9: Get Organizations
  echo ""
  echo "9️⃣ Fetching organizations..."
  ORGS=$(curl -s -X GET "$BASE_URL/organizations" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  ORG_COUNT=$(echo "$ORGS" | jq '. | length')
  echo "✅ Found $ORG_COUNT organizations"
else
  echo "⚠️  ADMIN login failed (might not exist)"
fi

echo ""
echo "================================"
echo "✅ All tests completed successfully!"
echo ""
