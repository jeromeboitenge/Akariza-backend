#!/bin/bash

# Test Email Diagnostic Script
# Replace YOUR_DEPLOYED_URL with your actual Render URL

DEPLOYED_URL="https://your-app.onrender.com"  # UPDATE THIS!
EMAIL="jeromeboitenge@gmail.com"

echo "🧪 Testing Email Service on Deployed System..."
echo ""

curl -X POST "$DEPLOYED_URL/auth/test-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}" \
  | jq '.'

echo ""
echo "✅ Check the response above for:"
echo "  - success: true/false"
echo "  - apiKeySet: true/false"
echo "  - fromEmail: should be jeromeboitenge@gmail.com"
echo ""
echo "If apiKeySet is false, you need to add SENDGRID_API_KEY to Render environment variables"
