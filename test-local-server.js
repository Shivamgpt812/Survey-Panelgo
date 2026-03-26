// Test local server
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

async function testLocalServer() {
  console.log('Testing local server...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await makeRequest('http://localhost:3000/api/health');
    console.log('Health status:', healthResponse.status);
    console.log('Health data:', healthResponse.data);
    
    // Test redirect endpoint
    console.log('\n2. Testing redirect endpoint...');
    const redirectResponse = await makeRequest('http://localhost:3000/api/redirect?pid=123&uid=test&status=2');
    console.log('Redirect status:', redirectResponse.status);
    console.log('Redirect headers:', redirectResponse.headers);
    
    if (redirectResponse.status === 302) {
      console.log('✅ Redirects to:', redirectResponse.headers.location);
    } else {
      console.log('❌ No redirect - Status:', redirectResponse.status);
      console.log('Response data:', redirectResponse.data.substring(0, 500));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('Make sure the local server is running on port 3000');
  }
}

testLocalServer();
