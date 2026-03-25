// Comprehensive Vendor Survey Debug Test
// Run this in browser console on http://localhost:5173

console.log('🚀 Starting Comprehensive Vendor Survey Debug Test...');

async function debugVendorSurvey() {
  console.log('=== 🔍 COMPREHENSIVE VENDOR SURVEY DEBUG ===');
  
  try {
    // Step 1: Check current state
    console.log('📍 Step 1: Current State Check');
    console.log('Current URL:', window.location.href);
    console.log('Path:', window.location.pathname);
    console.log('Cookies:', document.cookie);
    console.log('Local Storage:', Object.keys(localStorage));
    console.log('Session Storage:', Object.keys(sessionStorage));
    
    // Step 2: Get available surveys
    console.log('\n📋 Step 2: Getting Available Surveys');
    const surveysResponse = await fetch('http://localhost:3000/api/surveys', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('Surveys API Status:', surveysResponse.status);
    
    if (!surveysResponse.ok) {
      const errorText = await surveysResponse.text();
      console.error('❌ Surveys API Error:', errorText);
      return;
    }
    
    const surveysData = await surveysResponse.json();
    console.log('✅ Available surveys:', surveysData.surveys?.length || 0);
    
    if (!surveysData.surveys || surveysData.surveys.length === 0) {
      console.error('❌ No surveys found');
      return;
    }
    
    const testSurvey = surveysData.surveys[0];
    console.log('📋 Using test survey:', {
      id: testSurvey._id,
      title: testSurvey.title,
      status: testSurvey.status
    });
    
    // Step 3: Test direct vendor survey access
    console.log('\n🔗 Step 3: Testing Direct Vendor Survey Access');
    const vendorUrl = `/s/${testSurvey._id}`;
    console.log('📍 Testing URL:', vendorUrl);
    
    // Test the endpoint directly
    const directResponse = await fetch(`http://localhost:3000${vendorUrl}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vendor-flow': 'true'
      },
      credentials: 'include'
    });
    
    console.log('📡 Direct API Response Status:', directResponse.status);
    console.log('📋 Response Headers:', Object.fromEntries(directResponse.headers.entries()));
    
    if (!directResponse.ok) {
      const errorText = await directResponse.text();
      console.error('❌ Direct API Error:', errorText);
      
      if (directResponse.status === 401) {
        console.error('🚨 AUTHENTICATION ERROR - This should not happen for vendor routes!');
      }
      
      return;
    }
    
    const vendorData = await directResponse.json();
    console.log('✅ Direct API Success:', {
      surveyId: vendorData.survey._id,
      surveyTitle: vendorData.survey.title,
      uid: vendorData.uid,
      isVendorFlow: vendorData.isVendorFlow
    });
    
    // Step 4: Test frontend navigation
    console.log('\n🌐 Step 4: Testing Frontend Navigation');
    console.log('📍 Attempting to navigate to:', vendorUrl);
    
    // Store current state
    const currentState = {
      url: window.location.href,
      path: window.location.pathname,
      cookies: document.cookie
    };
    
    // Try navigation
    window.location.href = vendorUrl;
    
    // Wait a bit and check if we were redirected
    setTimeout(() => {
      console.log('\n🔍 Step 5: Post-Navigation Check');
      console.log('Original URL:', currentState.url);
      console.log('Current URL:', window.location.href);
      console.log('Was redirected:', currentState.url !== window.location.href);
      
      if (window.location.pathname === '/auth' || window.location.pathname === '/login') {
        console.error('🚨 LOGIN REDIRECT DETECTED!');
        console.error('❌ This should NOT happen for vendor routes');
        console.error('🍪 Cookies before redirect:', currentState.cookies);
        console.error('🍪 Cookies after redirect:', document.cookie);
      } else if (window.location.pathname === vendorUrl) {
        console.log('✅ Vendor survey page loaded successfully');
      } else {
        console.log('⚠️ Unexpected redirect to:', window.location.pathname);
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ DEBUG TEST ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
  
  console.log('==========================================');
}

// Auto-run debug test
debugVendorSurvey();

// Also expose for manual testing
window.debugVendorSurvey = debugVendorSurvey;

// Additional helper function to test specific survey ID
window.testSpecificSurvey = async (surveyId) => {
  console.log(`🔍 Testing specific survey: ${surveyId}`);
  
  try {
    const response = await fetch(`http://localhost:3000/s/${surveyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vendor-flow': 'true'
      },
      credentials: 'include'
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', errorText);
    } else {
      const data = await response.json();
      console.log('Success:', data);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

console.log('🎯 Debug functions loaded!');
console.log('📝 Available commands:');
console.log('  debugVendorSurvey() - Run full debug test');
console.log('  testSpecificSurvey("surveyId") - Test specific survey');
