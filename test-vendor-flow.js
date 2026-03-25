// Test script for vendor survey flow
// Run this in browser console on http://localhost:5173

async function testVendorSurvey() {
  console.log('=== TESTING VENDOR SURVEY FLOW ===');
  
  try {
    // Step 1: Test vendor survey endpoint
    console.log('📍 Step 1: Testing vendor survey endpoint...');
    
    // First, get a list of surveys to find a valid ID
    const surveysResponse = await fetch('http://localhost:3000/api/surveys');
    const surveysData = await surveysResponse.json();
    console.log('Available surveys:', surveysData.surveys?.length || 0);
    
    if (surveysData.surveys && surveysData.surveys.length > 0) {
      const firstSurvey = surveysData.surveys[0];
      console.log('Using survey:', firstSurvey.title);
      
      // Test the vendor survey endpoint
      const vendorResponse = await fetch(`http://localhost:3000/s/${firstSurvey._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-vendor-flow': 'true'
        },
        credentials: 'include'
      });
      
      console.log('Vendor response status:', vendorResponse.status);
      
      if (vendorResponse.ok) {
        const vendorData = await vendorResponse.json();
        console.log('✅ Vendor survey loaded successfully:', {
          surveyId: vendorData.survey._id,
          surveyTitle: vendorData.survey.title,
          uid: vendorData.uid,
          isVendorFlow: vendorData.isVendorFlow
        });
        
        // Step 2: Test response submission
        console.log('📍 Step 2: Testing response submission...');
        
        const submitResponse = await fetch('http://localhost:3000/api/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-vendor-flow': 'true'
          },
          credentials: 'include',
          body: JSON.stringify({
            surveyId: vendorData.survey._id,
            status: 'complete',
            preScreenerAnswers: [
              { questionId: 'age', value: true }
            ]
          })
        });
        
        console.log('Submit response status:', submitResponse.status);
        
        if (submitResponse.ok) {
          const submitData = await submitResponse.json();
          console.log('✅ Response submitted successfully:', {
            responseId: submitData.response._id,
            surveyId: submitData.response.surveyId,
            userId: submitData.response.userId,
            status: submitData.response.status
          });
        } else {
          const submitError = await submitResponse.json();
          console.error('❌ Submit failed:', submitError);
        }
        
        // Step 3: Test redirect with UID
        console.log('📍 Step 3: Testing redirect system...');
        
        const redirectResponse = await fetch(`http://localhost:3000/api/redirect?uid=${vendorData.uid}&status=1&pid=TEST_123`, {
          method: 'GET',
          credentials: 'include'
        });
        
        console.log('Redirect response status:', redirectResponse.status);
        console.log('Redirect location:', redirectResponse.headers.get('location'));
        
      } else {
        const vendorError = await vendorResponse.json();
        console.error('❌ Vendor survey failed:', vendorError);
      }
    } else {
      console.error('❌ No surveys found in database');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
  
  console.log('=== TEST COMPLETE ===');
}

// Auto-run test
testVendorSurvey();

// Also expose function for manual testing
window.testVendorSurvey = testVendorSurvey;
