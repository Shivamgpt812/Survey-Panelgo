// Test connection to backend
async function testConnection() {
  try {
    console.log('🧪 Testing backend connection...');
    
    // Test login endpoint
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@survey.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('✅ Backend connection successful!');
    console.log('Login response:', data);
    
    // Test tracking endpoint
    const trackingResponse = await fetch('http://localhost:3000/api/survey-tracking/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveyId: 'test_survey_123' })
    });
    
    const trackingData = await trackingResponse.json();
    console.log('✅ Tracking endpoint works!');
    console.log('Tracking response:', trackingData);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
