import { Request, Response } from 'express';
import IVendor from './vendorModel.js';
import IVendorSurvey from './surveyModel.js';
import IVendorResponse from './responseModel.js';

export const generateRandomToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const generateUID = (): string => {
  return "V_" + Math.random().toString(36).substring(2, 10);
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    const { name, complete_url, terminate_url, quota_full_url } = req.body;

    if (!name || !complete_url || !terminate_url || !quota_full_url) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, complete_url, terminate_url, quota_full_url'
      });
    }

    const vendor = await IVendor.create({
      name,
      complete_url,
      terminate_url,
      quota_full_url
    });

    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await IVendor.find().sort({ created_at: -1 });
    
    res.json({
      success: true,
      vendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createSurvey = async (req: Request, res: Response) => {
  try {
    const { title, vendor_id, questions } = req.body;

    if (!title || !vendor_id) {
      return res.status(400).json({
        success: false,
        message: 'Title and vendor_id are required'
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required'
      });
    }

    // Validate questions structure
    const validQuestions = questions.filter((q: any) => 
      q.text && 
      q.options && 
      Array.isArray(q.options) && 
      q.options.length > 0 &&
      q.options.some((opt: string) => opt.trim())
    );

    if (validQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid question with options is required'
      });
    }

    const vendor = await IVendor.findById(vendor_id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const token = generateRandomToken();

    const survey = await IVendorSurvey.create({
      title,
      vendor_id,
      token,
      questions: validQuestions
    });

    res.json({
      success: true,
      token,
      link: `/v/${token}`,
      survey
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSurveyByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const survey = await IVendorSurvey.findOne({ token }).populate({
      path: 'vendor_id',
      model: 'VendorLite'
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    res.json({
      success: true,
      survey
    });
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const submitResponse = async (req: Request, res: Response) => {
  try {
    const { token, answers } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const survey = await IVendorSurvey.findOne({ token }).populate({
      path: 'vendor_id',
      model: 'VendorLite'
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    const uid = generateUID();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const status = "complete";

    const response = await IVendorResponse.create({
      uid,
      pid: survey._id,
      ip,
      status,
      answers
    });

    // Since status is always "complete", use complete_url
    let redirectUrl = (survey.vendor_id as any).complete_url;

    redirectUrl = `${redirectUrl}?pid=${survey._id}&uid=${uid}`;

    res.json({
      success: true,
      redirectUrl,
      response
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSurveyResponses = async (req: Request, res: Response) => {
  try {
    const { surveyId } = req.params;

    const responses = await IVendorResponse.find({ pid: surveyId }).populate({
      path: 'pid',
      model: 'VendorLiteSurvey'
    });

    res.json({
      success: true,
      responses
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
