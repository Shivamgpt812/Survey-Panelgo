// Test redirect with source parameter
const http = require('http');

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
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

async function testRedirectWithSource() {
  console.log('Testing /api/redirect with source=external...');
  
  try {
    // First create an external survey so we have vendor config
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
    
    console.log('Created survey:', createResponse.data);
    
    // Test redirect with source=external
    console.log('\n2. Testing redirect with source=external...');
    const redirectResponse = await makeRequest('http://localhost:3000/api/redirect?pid=6899051&uid=zxcv&status=2&source=external');
    
    console.log('Redirect status:', redirectResponse.status);
    console.log('Redirect headers:', redirectResponse.headers);
    
    if (redirectResponse.status === 302) {
      const finalUrl = redirectResponse.headers.location;
      console.log('✅ Redirects to:', finalUrl);
      
      if (finalUrl.includes('vendor.com')) {
        console.log('✅ SUCCESS: Redirects to vendor with source parameter!');
      } else {
        console.log('❌ FAIL: Does not redirect to vendor');
      }
    } else {
      console.log('❌ No redirect - Status:', redirectResponse.status);
      console.log('Response data:', redirectResponse.data.substring(0, 500));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRedirectWithSource();
