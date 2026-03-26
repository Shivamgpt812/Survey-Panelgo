// Test complete external flow
const http = require('http');

async function makeRequest(url, maxRedirects = 0) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { maxRedirects }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

async function testCompleteFlow() {
  console.log('Testing complete external flow...');
  
  try {
    // Step 1: Create external survey
    console.log('\n1. Creating external survey...');
    
    const createData = JSON.stringify({
      title: 'Test External Survey',
      externalUrl: 'https://survey.opinionspark.co/test?transactionId=[#transaction_id#]&rid=[#userid#]',
      vendor: {
        complete_url: 'https://vendor.com/complete',
        terminate_url: 'https://vendor.com/terminate',
        quota_full_url: 'https://vendor.com/quota'
      }
    });
    
    const createResponse = await new Promise((resolve, reject) => {
      const req = http.request('http://localhost:3000/external/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(createData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({
          status: res.statusCode,
          headers: res.headers,
          data: JSON.parse(data)
        }));
      });
      
      req.on('error', reject);
      req.write(createData);
      req.end();
    });
    
    console.log('Create status:', createResponse.status);
    console.log('Create data:', createResponse.data);
    
    const { token } = createResponse.data;
    const testRid = 'test_user_external';
    
    // Step 2: Go through external router (populates ridToTokenMap)
    console.log('\n2. Going through external router...');
    try {
      await makeRequest(`http://localhost:3000/external/router?token=${token}&rid=${testRid}&transactionId=456`, 0);
    } catch (err) {
      console.log('Expected redirect from external router');
    }
    
    // Step 3: Test API redirect with external user
    console.log('\n3. Testing /api/redirect with external user...');
    const redirectResponse = await makeRequest(`http://localhost:3000/api/redirect?pid=6899051&uid=${testRid}&status=2`, 0);
    
    console.log('Redirect status:', redirectResponse.status);
    console.log('Redirect headers:', redirectResponse.headers);
    
    if (redirectResponse.status === 302) {
      const finalUrl = redirectResponse.headers.location;
      console.log('✅ Redirects to:', finalUrl);
      
      if (finalUrl.includes('vendor.com')) {
        console.log('✅ SUCCESS: External flow redirects to vendor!');
      } else {
        console.log('❌ FAIL: Does not redirect to vendor');
      }
    } else {
      console.log('❌ No redirect - Status:', redirectResponse.status);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCompleteFlow();
