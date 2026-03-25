import { Request, Response } from 'express';
import IVendor from './vendorModel.js';
import IVendorSurvey from './surveyModel.js';
import IVendorResponse from './responseModel.js';
import { SurveyRedirectLogs } from '../models/SurveyRedirectLogs.js';

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

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    const vendor = await IVendor.findByIdAndDelete(id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createSurvey = async (req: Request, res: Response) => {
  try {
    const { title, vendor_id, pid, preScreenerQuestions, questions, type, externalLink } = req.body;

    if (!title || !vendor_id || !pid) {
      return res.status(400).json({
        success: false,
        message: 'Title, vendor_id, and pid are required'
      });
    }

    let validQuestions: any[] = [];

    // Handle external surveys
    if (type === 'external') {
      if (!externalLink || !externalLink.trim()) {
        return res.status(400).json({
          success: false,
          message: 'External survey link is required for external surveys'
        });
      }
    } else {
      // Internal survey validation
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one question is required for internal surveys'
        });
      }

      // Validate questions structure
      validQuestions = questions.filter((q: any) => 
        q.text && 
        q.type && 
        (
          (q.type === 'multiple-choice' && q.options && Array.isArray(q.options) && q.options.length > 0 && q.options.some((opt: string) => opt.trim())) ||
          (q.type !== 'multiple-choice')
        )
      );

      if (validQuestions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one valid question is required. Multiple-choice questions must have options.'
        });
      }
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
      pid,
      preScreenerQuestions: preScreenerQuestions || [],
      token,
      questions: type === 'external' ? [] : validQuestions,
      externalLink: type === 'external' ? externalLink : undefined
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

const validatePreScreenerAnswers = (preScreenerQuestions: any[], responses: any): { passed: boolean; failedCriteria?: any } => {
  console.log("=== PRE SCREENER VALIDATION DEBUG ===");
  console.log("preScreenerQuestions:", preScreenerQuestions);
  console.log("responses:", responses);
  
  for (const question of preScreenerQuestions) {
    if (!question.enabled) continue;
    
    const userAnswer = responses[question.type];
    const requiredValue = question.value;
    
    console.log("Validating question:", {
      type: question.type,
      userAnswer,
      requiredValue,
      operator: question.operator,
      enabled: question.enabled
    });
    
    let passed = false;
    
    if (question.type === 'age') {
      const userAge = parseInt(userAnswer);
      console.log("Age validation:", { userAge, requiredValue, operator: question.operator });
      
      switch (question.operator) {
        case '>=':
          passed = userAge >= requiredValue;
          break;
        case '>':
          passed = userAge > requiredValue;
          break;
        case '<=':
          passed = userAge <= requiredValue;
          break;
        case '<':
          passed = userAge < requiredValue;
          break;
        default:
          passed = userAge >= requiredValue;
      }
      console.log("Age validation result:", passed);
    } else if (question.type === 'gender') {
      passed = userAnswer === requiredValue;
      console.log("Gender validation:", { userAnswer, requiredValue, passed });
    }
    
    if (!passed) {
      console.log("VALIDATION FAILED for question:", question);
      return { passed: false, failedCriteria: question };
    }
  }
  
  console.log("ALL VALIDATIONS PASSED");
  return { passed: true };
};

export const validatePreScreener = async (req: Request, res: Response) => {
  try {
    console.log("=== VALIDATE PRE SCREENER ENDPOINT DEBUG ===");
    const { token, preScreenerAnswers, userId } = req.body;
    
    console.log("Received data:", { token, preScreenerAnswers, userId });

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

    // Validate pre-screener if present
    if (survey.preScreenerQuestions && survey.preScreenerQuestions.length > 0) {
      console.log("Pre-screener questions found, validating...");
      const validation = validatePreScreenerAnswers(survey.preScreenerQuestions, preScreenerAnswers || {});
      
      console.log("Validation result:", validation);
      
      if (!validation.passed) {
        console.log("Pre-screener validation FAILED - terminating user");
        // User failed pre-screener - log as terminated and redirect
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        
        // Log the failed pre-screener attempt
        try {
          await SurveyRedirectLogs.create({
            pid: survey.pid,
            uid: userId || 'pre-screener-validation', // Use actual user ID if provided
            status: 2, // Terminated
            statusText: 'Terminated - Failed Pre-Screener',
            ipAddress: ip,
            userAgent: req.get('User-Agent') || 'unknown'
          });
          console.log("✅ Pre-screener failure logged:", { pid: survey.pid, status: 2 });
        } catch (logError) {
          console.error("❌ Error logging pre-screener failure:", logError);
        }

        // Return terminate redirect URL
        const vendor = survey.vendor_id as any;
        const redirectUrl = `${vendor.terminate_url}?pid=${survey.pid}&uid=${userId || 'pre-screener-validation'}&status=2&reason=pre-screener-failed`;
        
        return res.json({
          success: true,
          redirectUrl,
          terminated: true,
          reason: 'Failed pre-screener criteria',
          failedCriteria: validation.failedCriteria
        });
      }
    }

    // Passed pre-screener
    console.log("Pre-screener validation PASSED - user can proceed");
    res.json({
      success: true,
      terminated: false,
      message: 'Pre-screener validation passed'
    });

  } catch (error) {
    console.error('Error validating pre-screener:', error);
    const { userId } = req.body;
    
    // Log the validation error as terminated
    try {
      // Try to get survey details for logging
      const survey = await IVendorSurvey.findOne({ token: req.body.token }).populate({
        path: 'vendor_id',
        model: 'VendorLite'
      });
      
      if (survey) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        await SurveyRedirectLogs.create({
          pid: survey.pid,
          uid: userId || 'validation-error', // Use actual user ID if provided
          status: 2, // Terminated
          statusText: 'Terminated - Validation Error',
          ipAddress: ip,
          userAgent: req.get('User-Agent') || 'unknown'
        });
        console.log("✅ Validation error logged:", { pid: survey.pid, status: 2 });
        
        // Return terminate redirect URL
        const vendor = survey.vendor_id as any;
        const redirectUrl = `${vendor.terminate_url}?pid=${survey.pid}&uid=${userId || 'validation-error'}&status=2&reason=validation-error`;
        
        return res.json({
          success: true,
          redirectUrl,
          terminated: true,
          reason: 'Validation error occurred'
        });
      }
    } catch (logError) {
      console.error("❌ Error logging validation failure:", logError);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const submitResponse = async (req: Request, res: Response) => {
  try {
    const { token, answers, userId, preScreenerAnswers } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    if (!userId || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
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

    // Validate pre-screener if present
    if (survey.preScreenerQuestions && survey.preScreenerQuestions.length > 0) {
      const validation = validatePreScreenerAnswers(survey.preScreenerQuestions, preScreenerAnswers || {});
      
      if (!validation.passed) {
        // User failed pre-screener - log as terminated and redirect
        const uid = userId.trim();
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        
        // Log the failed pre-screener attempt
        try {
          await SurveyRedirectLogs.create({
            pid: survey.pid,
            uid,
            status: 2, // Terminated
            statusText: 'Terminated - Failed Pre-Screener',
            ipAddress: ip,
            userAgent: req.get('User-Agent') || 'unknown'
          });
          console.log("✅ Pre-screener failure logged:", { pid: survey.pid, uid, status: 2 });
        } catch (logError) {
          console.error("❌ Error logging pre-screener failure:", logError);
        }

        // Return terminate redirect URL
        const vendor = survey.vendor_id as any;
        const redirectUrl = `${vendor.terminate_url}?pid=${survey.pid}&uid=${uid}&status=2&reason=pre-screener-failed`;
        
        return res.json({
          success: true,
          redirectUrl,
          terminated: true,
          reason: 'Failed pre-screener criteria',
          failedCriteria: validation.failedCriteria
        });
      }
    }

    const uid = userId.trim();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const status = "complete";

    const response = await IVendorResponse.create({
      uid,
      pid: survey._id,
      ip,
      status,
      answers
    });

    // Log redirect data for analytics
    try {
      await SurveyRedirectLogs.create({
        pid: survey.pid,
        uid,
        status: 1, // Completed survey
        statusText: 'Completed',
        ipAddress: ip,
        userAgent: req.get('User-Agent') || 'unknown'
      });
      console.log("✅ Redirect log saved for vendor survey:", { pid: survey.pid, uid, status: 1 });
    } catch (logError) {
      console.error("❌ Error saving redirect log:", logError);
      // Don't fail the response if logging fails
    }

    // Since status is always "complete", use complete_url
    let redirectUrl = (survey.vendor_id as any).complete_url;

    redirectUrl = `${redirectUrl}?pid=${survey.pid}&uid=${uid}`;

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

export const handleVendorComplete = async (req: Request, res: Response) => {
  try {
    const { pid, uid, status = '1' } = req.query; // Default to completed status

    console.log("Vendor Complete HIT:", { pid, uid, status });

    // Forward to the main redirect handler
    return handleVendorRedirect(req, res);
  } catch (error) {
    console.error('Vendor complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const handleVendorRedirect = async (req: Request, res: Response) => {
  try {
    const { pid, uid, status } = req.query;

    console.log("Vendor Redirect HIT:", { pid, uid, status });

    // Validate params
    if (!pid || !uid || !status) {
      console.error("Missing params:", { pid, uid, status });
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: pid, uid, status'
      });
    }

    // Get survey and vendor info
    const survey = await IVendorSurvey.findOne({ pid: pid }).populate({
      path: 'vendor_id',
      model: 'VendorLite'
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    const vendor = survey.vendor_id as any;
    const statusCode = parseInt(status as string);
    
    // Log redirect data for analytics
    try {
      const statusText = getStatusText(statusCode);
      await SurveyRedirectLogs.create({
        pid: pid as string,
        uid: uid as string,
        status: statusCode,
        statusText,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      });
      console.log("✅ Vendor redirect log saved:", { pid, uid, status: statusCode });
    } catch (logError) {
      console.error("❌ Error saving vendor redirect log:", logError);
    }

    // Determine redirect URL based on status
    let redirectUrl;
    switch (statusCode) {
      case 1: // Completed
        redirectUrl = vendor.complete_url;
        break;
      case 2: // Terminated
        redirectUrl = vendor.terminate_url;
        break;
      case 3: // Quota Full
        redirectUrl = vendor.quota_full_url;
        break;
      case 4: // Security Terminated
        redirectUrl = vendor.terminate_url; // Use terminate URL for security
        break;
      default:
        redirectUrl = vendor.complete_url; // Default to complete
    }

    // Add parameters to redirect URL
    const separator = redirectUrl.includes('?') ? '&' : '?';
    redirectUrl = `${redirectUrl}${separator}pid=${pid}&uid=${uid}&status=${status}`;

    res.json({
      success: true,
      redirectUrl,
      message: 'Redirect processed successfully'
    });
  } catch (error) {
    console.error('Vendor redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const checkUserIdUnique = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user ID already exists in responses
    const existingResponse = await IVendorResponse.findOne({ uid });
    
    res.json({
      success: true,
      available: !existingResponse // true if available, false if already used
    });
  } catch (error) {
    console.error('Error checking user ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getStatusText = (status: number): string => {
  switch (status) {
    case 1: return 'Completed';
    case 2: return 'Terminated';
    case 3: return 'Quota Full';
    case 4: return 'Security Terminated';
    default: return 'Unknown';
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
