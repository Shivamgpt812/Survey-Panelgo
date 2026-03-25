import { Router } from 'express';
import {
  createVendor,
  getVendors,
  createSurvey,
  getSurveyByToken,
  submitResponse,
  getSurveyResponses
} from './vendorController';

const router = Router();

router.post('/vendor', createVendor);
router.get('/vendors', getVendors);

router.post('/survey', createSurvey);
router.get('/survey/:token', getSurveyByToken);
router.get('/survey/:token/responses', getSurveyResponses);

router.post('/submit', submitResponse);

export default router;
