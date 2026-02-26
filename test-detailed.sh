#!/bin/bash

API_URL="https://akariza-backend.onrender.com/api/v1"

echo "=== Detailed API Test ==="
echo ""

# Test 1: Login
echo "TEST 1: Login with jeromeboitenge@gmail.com"
echo "-------------------------------------------"
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jeromeboitenge@gmail.com","password":"Password12!"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo ""

# Get token for next tests
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jeromeboitenge@gmail.com","password":"Password12!"}' | jq -r '.accessToken')

# Test 2: Get organizations WITH token
echo "TEST 2: Get Organizations WITH Bearer Token"
echo "-------------------------------------------"
curl -X GET "$API_URL/organizations" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo ""

# Test 3: Get organizations WITHOUT token (should fail)
echo "TEST 3: Get Organizations WITHOUT Token (should fail)"
echo "-----------------------------------------------------"
curl -X GET "$API_URL/organizations" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo ""

# Test 4: Decode token to see payload
echo "TEST 4: Token Payload"
echo "--------------------"
echo "$TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.'

