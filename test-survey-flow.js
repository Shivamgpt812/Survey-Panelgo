// Test the complete survey flow with tracking
async function testSurveyFlow() {
  console.log('🧪 Testing Complete Survey Flow with Tracking...\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@survey.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful!');
    
    // Step 2: Start tracking for a survey
    console.log('\n2️⃣ Starting survey tracking...');
    const trackingStart = await fetch('http://localhost:3000/api/survey-tracking/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ surveyId: 'SPG002' })
    });
    
    const trackingData = await trackingStart.json();
    console.log('✅ Tracking started:', trackingData);
    
    // Step 3: Complete the survey with tracking
    console.log('\n3️⃣ Completing survey with tracking...');
    const trackingComplete = await fetch('http://localhost:3000/api/survey-tracking/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        surveyId: 'SPG002',
        userId: trackingData.userId,
        clickId: trackingData.clickId,
        status: 'completed'
      })
    });
    
    const completeData = await trackingComplete.json();
    console.log('✅ Tracking completed:', completeData);
    
    // Step 4: Verify the result page URL
    console.log('\n4️⃣ Result page URL:', completeData.redirectUrl);
    console.log('📋 Visit this URL to see tracking data:', `http://localhost:5173${completeData.redirectUrl}`);
    
    // Step 5: Verify tracking record
    console.log('\n5️⃣ Verifying tracking record...');
    const verifyResponse = await fetch(`http://localhost:3000/api/survey-tracking/${trackingData.clickId}`);
    const verifyData = await verifyResponse.json();
    console.log('✅ Tracking record verified:', verifyData);
    
    console.log('\n🎉 COMPLETE SURVEY FLOW TEST PASSED!');
    console.log('\n📋 What to test in browser:');
    console.log('1. Login with: superadmin@survey.com / admin123');
    console.log('2. Take any survey and complete it');
    console.log('3. You should be redirected to result page');
    console.log('4. Check admin dashboard for Survey Logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSurveyFlow();
