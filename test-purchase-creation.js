const axios = require('axios');

// Simple test script to verify purchase creation endpoint
async function testPurchaseCreation() {
  const API_BASE_URL = 'https://akariza-backend.onrender.com/api/v1';
  
  // You'll need to replace this with a valid JWT token
  const TEST_TOKEN = 'your-jwt-token-here';
  
  const testData = {
    supplierId: null, // Testing optional supplier
    items: [
      {
        productId: 'test-product-id', // Replace with actual product ID
        quantity: 10,
        costPrice: 1500
      }
    ],
    paymentStatus: 'PAID',
    amountPaid: 15000,
    notes: 'Test purchase creation'
  };

  try {
    console.log('🧪 Testing purchase creation...');
    console.log('📦 Test data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/purchases`, testData, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Purchase created successfully!');
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Purchase creation failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Request Data:', JSON.stringify(testData, null, 2));
    } else if (error.request) {
      console.error('No response received');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Instructions for running this test
console.log(`
🧪 Purchase Creation Test Script

To run this test:
1. Replace 'your-jwt-token-here' with a valid JWT token
2. Replace 'test-product-id' with an actual product ID from your database
3. Run: node test-purchase-creation.js

This will help verify that the purchase creation endpoint is working correctly.
`);

// Uncomment the line below to run the test
// testPurchaseCreation();