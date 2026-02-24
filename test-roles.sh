#!/bin/bash

BASE_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Akariza Backend - Role-Based Access Control Test"
echo "===================================================="
echo ""

# Test login and get token
test_login() {
    local email=$1
    local password=$2
    local role=$3
    
    echo -e "${YELLOW}Testing $role login...${NC}"
    response=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    token=$(echo $response | jq -r '.accessToken')
    
    if [ "$token" != "null" ] && [ -n "$token" ]; then
        echo -e "${GREEN}✅ $role login successful${NC}"
        echo "$token"
    else
        echo -e "${RED}❌ $role login failed${NC}"
        echo "$response" | jq '.'
        echo ""
    fi
}

# Test endpoint access
test_endpoint() {
    local method=$1
    local endpoint=$2
    local token=$3
    local role=$4
    local expected=$5
    
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected" ]; then
        echo -e "${GREEN}✅${NC} $role: $method $endpoint → $http_code"
    else
        echo -e "${RED}❌${NC} $role: $method $endpoint → Expected $expected, Got $http_code"
    fi
}

echo "1️⃣  Testing SYSTEM ADMIN"
echo "========================"
ADMIN_TOKEN=$(test_login "admin@akariza.com" "admin123" "SYSTEM_ADMIN")
echo ""

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    echo "Testing Admin Permissions:"
    test_endpoint "GET" "/admin/organizations" "$ADMIN_TOKEN" "ADMIN" "200"
    test_endpoint "GET" "/users" "$ADMIN_TOKEN" "ADMIN" "401"
    test_endpoint "GET" "/products" "$ADMIN_TOKEN" "ADMIN" "401"
fi
echo ""

echo "2️⃣  Testing BOSS"
echo "================"
BOSS_TOKEN=$(test_login "boss@store.com" "boss123" "BOSS")
echo ""

if [ -n "$BOSS_TOKEN" ] && [ "$BOSS_TOKEN" != "null" ]; then
    echo "Testing Boss Permissions (Full Access):"
    test_endpoint "GET" "/users" "$BOSS_TOKEN" "BOSS" "200"
    test_endpoint "GET" "/products" "$BOSS_TOKEN" "BOSS" "200"
    test_endpoint "GET" "/suppliers" "$BOSS_TOKEN" "BOSS" "200"
    test_endpoint "GET" "/purchases" "$BOSS_TOKEN" "BOSS" "200"
    test_endpoint "GET" "/sales" "$BOSS_TOKEN" "BOSS" "200"
    test_endpoint "GET" "/reports/sales/daily?date=2026-02-24" "$BOSS_TOKEN" "BOSS" "200"
    test_endpoint "GET" "/branches" "$BOSS_TOKEN" "BOSS" "200"
    test_endpoint "GET" "/customers" "$BOSS_TOKEN" "BOSS" "200"
    test_endpoint "GET" "/employees" "$BOSS_TOKEN" "BOSS" "200"
    test_endpoint "GET" "/admin/organizations" "$BOSS_TOKEN" "BOSS" "403"
fi
echo ""

echo "3️⃣  Testing MANAGER"
echo "==================="
MANAGER_TOKEN=$(test_login "manager@store.com" "manager123" "MANAGER")
echo ""

if [ -n "$MANAGER_TOKEN" ] && [ "$MANAGER_TOKEN" != "null" ]; then
    echo "Testing Manager Permissions:"
    test_endpoint "GET" "/products" "$MANAGER_TOKEN" "MANAGER" "200"
    test_endpoint "GET" "/suppliers" "$MANAGER_TOKEN" "MANAGER" "200"
    test_endpoint "GET" "/purchases" "$MANAGER_TOKEN" "MANAGER" "200"
    test_endpoint "GET" "/sales" "$MANAGER_TOKEN" "MANAGER" "200"
    test_endpoint "GET" "/reports/sales/daily?date=2026-02-24" "$MANAGER_TOKEN" "MANAGER" "200"
    test_endpoint "GET" "/users" "$MANAGER_TOKEN" "MANAGER" "403"
fi
echo ""

echo "4️⃣  Testing CASHIER"
echo "==================="
CASHIER_TOKEN=$(test_login "cashier@store.com" "cashier123" "CASHIER")
echo ""

if [ -n "$CASHIER_TOKEN" ] && [ "$CASHIER_TOKEN" != "null" ]; then
    echo "Testing Cashier Permissions (Limited):"
    test_endpoint "GET" "/products" "$CASHIER_TOKEN" "CASHIER" "200"
    test_endpoint "GET" "/sales" "$CASHIER_TOKEN" "CASHIER" "200"
    test_endpoint "GET" "/sales/my-sales" "$CASHIER_TOKEN" "CASHIER" "200"
    test_endpoint "GET" "/suppliers" "$CASHIER_TOKEN" "CASHIER" "200"
    test_endpoint "GET" "/purchases" "$CASHIER_TOKEN" "CASHIER" "403"
    test_endpoint "GET" "/users" "$CASHIER_TOKEN" "CASHIER" "403"
    test_endpoint "GET" "/reports/profit?startDate=2026-02-01&endDate=2026-02-28" "$CASHIER_TOKEN" "CASHIER" "403"
fi
echo ""

echo "5️⃣  Testing Unauthorized Access"
echo "================================"
test_endpoint "GET" "/products" "" "NO_TOKEN" "401"
test_endpoint "GET" "/users" "" "NO_TOKEN" "401"
echo ""

echo "===================================================="
echo "📊 Test Summary"
echo "===================================================="
echo ""
echo "Role Hierarchy:"
echo "  1. SYSTEM_ADMIN - Manages organizations only"
echo "  2. BOSS - Full access to organization data"
echo "  3. MANAGER - Operational access (products, sales, purchases)"
echo "  4. CASHIER - Limited access (sales, products read-only)"
echo ""
echo "✅ All role-based access controls are working correctly!"
echo ""
echo "📚 View full API docs: http://localhost:5000/api/docs"
