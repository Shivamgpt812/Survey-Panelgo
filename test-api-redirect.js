// Test API redirect with external flow
const axios = require('axios');

const BASE_URL = 'http://localhost:10000';

async function testApiRedirect() {
  console.log('Testing /api/redirect endpoint...');
  
  try {
    // Step 1: Create external survey
    console.log('\n1. Creating external survey...');
    const createResponse = await axios.post(`${BASE_URL}/external/create`, {
      title: 'Test External Survey',
      externalUrl: 'https://survey.opinionspark.co/test?transactionId=[#transaction_id#]&rid=[#userid#]',
      vendor: {
        complete_url: 'https://vendor.com/complete',
        terminate_url: 'https://vendor.com/terminate',
        quota_full_url: 'https://vendor.com/quota'
      }
    });
    
    const { token } = createResponse.data;
    console.log('✅ Created survey with token:', token);
    
    // Step 2: Simulate external router flow (this populates ridToTokenMap)
    console.log('\n2. Simulating external router flow...');
    const testRid = 'test_user_123';
    
    try {
      await axios.get(`${BASE_URL}/external/router?token=${token}&rid=${testRid}&transactionId=456`, {
        maxRedirects: 0
      });
    } catch (redirectError) {
      // Expected - it redirects to external survey
      console.log('✅ External router redirected (expected)');
    }
    
    // Step 3: Test API redirect (simulates external provider callback)
    console.log('\n3. Testing /api/redirect with external flow...');
    const redirectUrl = `${BASE_URL}/api/redirect?pid=6899051&uid=${testRid}&status=2`;
    console.log('Calling:', redirectUrl);
    
    const redirectResponse = await axios.get(redirectUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status < 500
    });
    
    if (redirectResponse.status === 302) {
      const finalUrl = redirectResponse.headers.location;
      console.log('✅ Redirects to:', finalUrl);
      
      if (finalUrl.includes('vendor.com')) {
        console.log('✅ Correctly redirects to vendor URL');
      } else {
        console.log('❌ Does not redirect to vendor URL');
      }
    } else {
      console.log('❌ No redirect - Status:', redirectResponse.status);
      console.log('Response:', redirectResponse.data);
    }
    
    // Step 4: Test with non-external user (should go to result page)
    console.log('\n4. Testing with non-external user...');
    const nonExternalResponse = await axios.get(`${BASE_URL}/api/redirect?pid=123&uid=non_external_user&status=2`, {
      maxRedirects: 0,
      validateStatus: (status) => status < 500
    });
    
    if (nonExternalResponse.status === 302) {
      const finalUrl = nonExternalResponse.headers.location;
      console.log('✅ Non-external redirects to:', finalUrl);
      
      if (finalUrl.includes('/survey-result/')) {
        console.log('✅ Correctly redirects to result page');
      } else {
        console.log('❌ Does not redirect to result page');
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.log('Error:', error.response.status, error.response.data);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}

testApiRedirect();
