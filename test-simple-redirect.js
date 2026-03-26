// Simple test without axios
const https = require('https');

const BASE_URL = 'https://surveypanelgo.com';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
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

async function testRedirect() {
  console.log('Testing /api/redirect endpoint...');
  
  try {
    const url = `${BASE_URL}/api/redirect?pid=6899051&uid=yuio&status=2`;
    console.log('Calling:', url);
    
    const response = await makeRequest(url);
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data.substring(0, 500));
    
    if (response.status === 302) {
      console.log('✅ Redirects to:', response.headers.location);
    } else {
      console.log('❌ No redirect - Status:', response.status);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRedirect();
