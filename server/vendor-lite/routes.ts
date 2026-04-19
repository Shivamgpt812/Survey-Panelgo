import { Router } from 'express';
import {
  createVendor,
  getVendors,
  createSurvey,
  getSurveyByToken,
  submitResponse,
  getSurveyResponses,
  handleVendorRedirect,
  handleVendorComplete,
  checkUserIdUnique,
  validatePreScreener,
  testEndpoint,
  createSurveySession,
  testSurveyEndpoint,
  generateVendorLink
} from './vendorController';

const router = Router();

router.post('/vendor', createVendor);
router.get('/vendor', getVendors);  // Add GET route for /vendor
router.get('/vendors', getVendors);

router.post('/survey', createSurvey);
router.get('/survey/:token', getSurveyByToken);
router.get('/survey/:token/responses', getSurveyResponses);

router.post('/submit', submitResponse);
console.log('🔧 Registering create-survey-session route...');
router.post('/create-survey-session', createSurveySession);
console.log('✅ create-survey-session route registered');
console.log('🔧 Registering test-survey-endpoint route...');
router.post('/test-survey-endpoint', testSurveyEndpoint);
console.log('✅ test-survey-endpoint route registered');
console.log('🔧 Registering generate-vendor-link route...');
router.post('/generate-vendor-link', generateVendorLink);
console.log('✅ generate-vendor-link route registered');
router.get('/redirect', handleVendorRedirect);
router.get('/complete', handleVendorComplete);
router.get('/check-uid/:uid', checkUserIdUnique);
router.post('/validate-pre-screener', validatePreScreener);
router.get('/test', testEndpoint);

export default router;
