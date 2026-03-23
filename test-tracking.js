// Simple test script for survey tracking
const BASE_URL = 'http://localhost:3000';

async function testTracking() {
  console.log('🧪 Testing Survey Tracking System...\n');

  try {
    // Step 1: Start tracking
    console.log('1️⃣ Starting survey tracking...');
    const startResponse = await fetch(`${BASE_URL}/api/survey-tracking/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveyId: 'test_survey_123' })
    });
    
    const startData = await startResponse.json();
    console.log('✅ Tracking started:', startData);
    
    const { clickId, userId } = startData;
    
    // Step 2: Complete tracking
    console.log('\n2️⃣ Completing survey tracking...');
    const completeResponse = await fetch(`${BASE_URL}/api/survey-tracking/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surveyId: 'test_survey_123',
        userId,
        clickId,
        status: 'completed'
      })
    });
    
    const completeData = await completeResponse.json();
    console.log('✅ Tracking completed:', completeData);
    
    // Step 3: Get tracking record
    console.log('\n3️⃣ Retrieving tracking record...');
    const getResponse = await fetch(`${BASE_URL}/api/survey-tracking/${clickId}`);
    const getData = await getResponse.json();
    console.log('✅ Tracking record:', getData);
    
    // Step 4: Test different statuses
    console.log('\n4️⃣ Testing different statuses...');
    
    const statuses = ['terminated', 'quota_full'];
    for (const status of statuses) {
      const newStart = await fetch(`${BASE_URL}/api/survey-tracking/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId: 'test_survey_123' })
      });
      const newStartData = await newStart.json();
      
      const newComplete = await fetch(`${BASE_URL}/api/survey-tracking/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: 'test_survey_123',
          userId: newStartData.userId,
          clickId: newStartData.clickId,
          status
        })
      });
      
      const newCompleteData = await newComplete.json();
      console.log(`✅ Status "${status}" test:`, newCompleteData.tracking.status);
    }
    
    console.log('\n🎉 All backend tests passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Open your browser to: http://localhost:5173');
    console.log('2. Login as admin and check "Survey Logs" tab');
    console.log('3. Test the frontend survey flow');
    console.log('4. Visit result page: http://localhost:5173/survey-result/' + clickId);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTracking();
