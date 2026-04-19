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
router.get('/redirect', handleVendorRedirect);
router.get('/complete', handleVendorComplete);
router.get('/check-uid/:uid', checkUserIdUnique);
router.post('/validate-pre-screener', validatePreScreener);
router.get('/test', testEndpoint);
router.post('/generate-vendor-link', generateVendorLink);

export default router;
