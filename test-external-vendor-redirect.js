// Test external vendor redirect flow
const axios = require('axios');

const BASE_URL = 'http://localhost:10000';

async function testExternalFlow() {
  console.log('Testing external vendor redirect flow...');
  
  try {
    // Step 1: Create an external survey
    console.log('\n1. Creating external survey...');
    const createResponse = await axios.post(`${BASE_URL}/external/create`, {
      title: 'Test External Survey',
      externalUrl: 'https://survey.opinionspark.co/init/9d066963-53f6-44e7-82cf-aeb04951f4b5/2502128b-f721-44cf-ad47-89458337f5af?transactionId=[#transaction_id#]&rid=[#userid#]&isManual=true',
      vendor: {
        complete_url: 'https://vendor.com/complete',
        terminate_url: 'https://vendor.com/terminate',
        quota_full_url: 'https://vendor.com/quota'
      }
    });
    
    const { token, link } = createResponse.data;
    console.log('✅ External survey created:', { token, link });
    
    // Step 2: Test the external router redirect
    console.log('\n2. Testing external router redirect...');
    const routerUrl = `${BASE_URL}/external/router?token=${token}&rid=123&transactionId=456`;
    console.log('Router URL:', routerUrl);
    
    const routerResponse = await axios.get(routerUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status < 500
    });
    
    if (routerResponse.status === 302) {
      console.log('✅ Router redirects to:', routerResponse.headers.location);
      
      // Check if source=external is added
      const redirectUrl = routerResponse.headers.location;
      if (redirectUrl.includes('source=external')) {
        console.log('✅ Source flag correctly added');
      } else {
        console.log('❌ Source flag missing');
      }
    } else {
      console.log('Router response:', routerResponse.status, routerResponse.data);
    }
    
    // Step 3: Test vendor data endpoint
    console.log('\n3. Testing vendor data endpoint...');
    const dataResponse = await axios.get(`${BASE_URL}/external/data/${token}`);
    console.log('✅ Vendor data:', dataResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.log('Error:', error.response.status, error.response.data);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}

testExternalFlow();
