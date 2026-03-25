import { Router } from 'express';
import {
  createVendor,
  getVendors,
  deleteVendor,
  createSurvey,
  getSurveyByToken,
  submitResponse,
  getSurveyResponses,
  handleVendorRedirect,
  handleVendorComplete,
  checkUserIdUnique,
  validatePreScreener
} from './vendorController';

const router = Router();

router.post('/vendor', createVendor);
router.get('/vendor', getVendors);  // Add GET route for /vendor
router.get('/vendors', getVendors);
router.delete('/vendors/:id', deleteVendor);

// Alternative POST route for DELETE (for hosting that doesn't support DELETE)
router.post('/vendors/:id/delete', (req, res) => {
  req.params.id = req.params.id;
  deleteVendor(req, res);
});

router.post('/survey', createSurvey);
router.get('/survey/:token', getSurveyByToken);
router.get('/survey/:token/responses', getSurveyResponses);

router.post('/submit', submitResponse);
router.get('/redirect', handleVendorRedirect);
router.get('/complete', handleVendorComplete);
router.get('/check-uid/:uid', checkUserIdUnique);
router.post('/validate-pre-screener', validatePreScreener);

export default router;
