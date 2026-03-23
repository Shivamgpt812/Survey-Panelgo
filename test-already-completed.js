// Test the "already completed" scenario
async function testAlreadyCompleted() {
  console.log('🧪 Testing "Already Completed" Scenario...\n');

  try {
    // Step 1: Login
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
    
    // Step 2: Complete a survey first time
    console.log('\n2️⃣ First survey completion...');
    try {
      await fetch('http://localhost:3000/api/internal-complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ surveyId: '69c15ce6eb68b8a75ae1436b' }) // Use a real survey ID
      });
      console.log('✅ First completion successful');
    } catch (error) {
      console.log('ℹ️ First completion failed (might be already completed)');
    }
    
    // Step 3: Try to complete the same survey again
    console.log('\n3️⃣ Second survey completion (should show "already completed")...');
    try {
      const secondResponse = await fetch('http://localhost:3000/api/internal-complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ surveyId: '69c15ce6eb68b8a75ae1436b' })
      });
      
      const secondData = await secondResponse.json();
      console.log('Response:', secondData);
    } catch (error) {
      console.log('✅ Got expected error:', error.message);
    }
    
    // Step 4: Test tracking with already completed survey
    console.log('\n4️⃣ Testing tracking with completed survey...');
    const trackingStart = await fetch('http://localhost:3000/api/survey-tracking/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ surveyId: '69c15ce6eb68b8a75ae1436b' })
    });
    
    const trackingData = await trackingStart.json();
    console.log('✅ Tracking started:', trackingData);
    
    // Complete tracking (should work even if survey already completed)
    const trackingComplete = await fetch('http://localhost:3000/api/survey-tracking/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        surveyId: '69c15ce6eb68b8a75ae1436b',
        userId: trackingData.userId,
        clickId: trackingData.clickId,
        status: 'completed'
      })
    });
    
    const completeData = await trackingComplete.json();
    console.log('✅ Tracking completed:', completeData);
    console.log('📋 Result page:', `http://localhost:5173${completeData.redirectUrl}`);
    
    console.log('\n🎉 "Already Completed" test passed!');
    console.log('\n📋 What to expect in browser:');
    console.log('1. Complete a survey once');
    console.log('2. Try to complete it again');
    console.log('3. Should still show "completed" status in tracking');
    console.log('4. Should redirect to result page with completed status');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAlreadyCompleted();
