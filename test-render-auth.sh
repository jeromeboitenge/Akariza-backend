#!/bin/bash

# Your Render API URL
API_URL="https://akariza-backend.onrender.com/api/v1"

echo "=== Testing Admin Login and Organizations Access ==="
echo ""

# Step 1: Login
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jeromeboitenge@gmail.com","password":"Password12!"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed - no access token received"
  exit 1
fi

echo "✅ Access Token received"
echo ""

# Step 2: Get Organizations
echo "2. Fetching organizations..."
ORG_RESPONSE=$(curl -s -X GET "$API_URL/organizations" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Organizations Response:"
echo "$ORG_RESPONSE" | jq '.'
echo ""

# Check if successful
if echo "$ORG_RESPONSE" | jq -e '.statusCode == 401' > /dev/null; then
  echo "❌ Still getting 401 Unauthorized"
  echo ""
  echo "Debugging info:"
  echo "Token payload:"
  echo "$ACCESS_TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.'
else
  echo "✅ Successfully accessed organizations!"
fi
