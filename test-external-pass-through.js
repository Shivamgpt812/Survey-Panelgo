// Simple test for external link pass-through
const axios = require('axios');

const BASE_URL = 'http://localhost:10000';

async function testExternalPassThrough() {
  console.log('Testing external link pass-through...');
  
  try {
    // Test the endpoint with sample parameters
    const response = await axios.get(`${BASE_URL}/external/start?projectId=123&transactionId=456&userid=789`, {
      maxRedirects: 0, // Don't follow redirects to see the response
      validateStatus: (status) => status < 500 // Accept 4xx as expected since survey doesn't exist
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('Expected error (survey not found):', error.response.status, error.response.data);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}

testExternalPassThrough();
