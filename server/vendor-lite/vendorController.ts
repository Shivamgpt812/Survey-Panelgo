import { Request, Response } from 'express';
import IVendor from './vendorModel.js';
import IVendorSurvey from './surveyModel.js';
import IVendorResponse from './responseModel.js';
import { SurveyRedirectLogs } from '../models/SurveyRedirectLogs.js';
import { processExternalSurveyLink } from '../lib/surveySessionUtils.js';

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

    console.log("=== SURVEY CREATION DEBUG ===");
    console.log("Type:", type);
    console.log("External Link:", externalLink);
    console.log("PreScreener Questions:", preScreenerQuestions);
    console.log("Valid Questions:", validQuestions);

    const survey = await IVendorSurvey.create({
      title,
      vendor_id,
      pid,
      type: type || 'internal',
      preScreenerQuestions: preScreenerQuestions || [],
      token,
      questions: type === 'external' ? [] : validQuestions,
      externalLink: type === 'external' ? externalLink : undefined
    });

    console.log("=== CREATED SURVEY DEBUG ===");
    console.log("Created survey:", JSON.stringify(survey, null, 2));

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

    console.log("=== SURVEY RETRIEVAL DEBUG ===");
    console.log("Survey Token:", token);
    console.log("Survey PID:", survey.pid);
    console.log("Survey PID Type:", typeof survey.pid);
    console.log("Survey PID Length:", survey.pid ? survey.pid.length : 'undefined');
    console.log("Survey Title:", survey.title);
    console.log("Survey External Link:", survey.externalLink);
    console.log("Survey Type:", survey.type);
    console.log("Full Survey Object:", JSON.stringify(survey, null, 2));

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

const validatePreScreenerAnswers = (preScreenerQuestions: any[], responses: any): { passed: boolean; failedCriteria?: any; debug?: any } => {
  console.log("=== PRE SCREENER VALIDATION DEBUG ===");
  console.log("preScreenerQuestions:", JSON.stringify(preScreenerQuestions, null, 2));
  console.log("responses:", JSON.stringify(responses, null, 2));
  
  for (const question of preScreenerQuestions) {
    if (!question.enabled) {
      console.log(`Question ${question.type} is disabled, skipping`);
      continue;
    }
    
    let userAnswer = responses[question.type];
    let requiredValue = question.value;
    
    // Normalize values for comparison
    if (typeof userAnswer === 'string' && userAnswer.trim() !== '') {
      // Try to convert numeric strings to numbers for comparison
      const numericValue = Number(userAnswer);
      if (!isNaN(numericValue) && question.type === 'age') {
        userAnswer = numericValue;
      } else {
        userAnswer = userAnswer.trim();
      }
    }
    
    if (typeof requiredValue === 'string' && requiredValue.trim() !== '') {
      const numericValue = Number(requiredValue);
      if (!isNaN(numericValue) && question.type === 'age') {
        requiredValue = numericValue;
      } else {
        requiredValue = requiredValue.trim();
      }
    }
    
    console.log("Validating question:", {
      type: question.type,
      userAnswer,
      requiredValue,
      operator: question.operator,
      enabled: question.enabled
    });
    
    // 🔥 CRITICAL FIX: Handle missing answers
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
      console.log(`❌ VALIDATION FAILED: Missing answer for ${question.type}`);
      return { 
        passed: false, 
        failedCriteria: question,
        debug: { reason: 'missing_answer', questionType: question.type }
      };
    }
    
    let passed = false;
    
    if (question.type === 'age') {
      const userAge = parseInt(userAnswer);
      const requiredAge = parseInt(requiredValue);
      console.log("Age validation:", { userAge, requiredAge, operator: question.operator });
      
      if (isNaN(userAge)) {
        console.log("❌ VALIDATION FAILED: Invalid age value");
        return { 
          passed: false, 
          failedCriteria: question,
          debug: { reason: 'invalid_age', userAnswer }
        };
      }
      
      switch (question.operator) {
        case '>=':
          passed = userAge >= requiredAge;
          break;
        case '>':
          passed = userAge > requiredAge;
          break;
        case '<=':
          passed = userAge <= requiredAge;
          break;
        case '<':
          passed = userAge < requiredAge;
          break;
        case '==':
        case '=':
          passed = userAge === requiredAge;
          break;
        default:
          passed = userAge >= requiredAge;
      }
      console.log("Age validation result:", passed);
    } else if (question.type === 'gender') {
      passed = String(userAnswer).toLowerCase() === String(requiredValue).toLowerCase();
      console.log("Gender validation:", { userAnswer, requiredValue, passed });
    } else {
      // 🔥 CRITICAL FIX: For custom/other question types, use generic comparison
      console.log(`Custom question type: ${question.type}, using generic comparison`);
      
      switch (question.operator) {
        case '==':
        case '=':
          passed = String(userAnswer).toLowerCase() === String(requiredValue).toLowerCase();
          break;
        case '!=':
        case '!==':
          passed = String(userAnswer).toLowerCase() !== String(requiredValue).toLowerCase();
          break;
        case '>=':
          passed = Number(userAnswer) >= Number(requiredValue);
          break;
        case '>':
          passed = Number(userAnswer) > Number(requiredValue);
          break;
        case '<=':
          passed = Number(userAnswer) <= Number(requiredValue);
          break;
        case '<':
          passed = Number(userAnswer) < Number(requiredValue);
          break;
        default:
          // Default: pass if user provided any answer
          passed = true;
          console.log(`Unknown operator "${question.operator}", defaulting to pass`);
      }
      console.log(`Custom validation result:`, passed);
    }
    
    if (!passed) {
      console.log("❌ VALIDATION FAILED for question:", question);
      return { 
        passed: false, 
        failedCriteria: question,
        debug: { userAnswer, requiredValue, operator: question.operator }
      };
    }
  }
  
  console.log("✅ ALL VALIDATIONS PASSED");
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
        let redirectUrl = vendor.terminate_url;
        
        console.log("=== VENDOR TERMINATE URL DEBUG (PRE SCREENER) ===");
        console.log("Vendor terminate_url:", redirectUrl);
        console.log("Vendor terminate_url type:", typeof redirectUrl);

        // Use PID from survey, fallback to URL PID if survey PID is missing or invalid
        const finalPid = (survey.pid && survey.pid.length > 0) ? survey.pid : req.query.pid;
        console.log("=== TERMINATE PID COMPARISON DEBUG (PRE SCREENER) ===");
        console.log("Survey PID from database:", survey.pid);
        console.log("PID from URL parameters:", req.query.pid);
        console.log("Final PID being used for terminate:", finalPid);

        // Check if redirectUrl already has query parameters
        const hasQueryParams = redirectUrl.includes('?');
        if (hasQueryParams) {
          redirectUrl = `${redirectUrl}&pid=${finalPid}&uid=${userId || 'pre-screener-validation'}&status=2`;
        } else {
          redirectUrl = `${redirectUrl}?pid=${finalPid}&uid=${userId || 'pre-screener-validation'}&status=2`;
        }
        
        console.log("=== TERMINATE REDIRECT URL DEBUG (PRE SCREENER) ===");
        console.log("Survey PID:", survey.pid);
        console.log("User ID:", userId || 'pre-screener-validation');
        console.log("Terminate URL:", redirectUrl);
        
        return res.json({
          success: true,
          redirectUrl,
          terminated: true,
          reason: 'Failed pre-screener criteria',
          failedCriteria: validation.failedCriteria,
          debug: validation.debug,
          receivedAnswers: preScreenerAnswers,
          questions: survey.preScreenerQuestions
        });
      }
    }

    // Passed pre-screener
    console.log("✅ Pre-screener validation PASSED - user can proceed");
    console.log("Survey type:", survey.type);
    console.log("Survey externalLink:", survey.externalLink);
    console.log("Is external survey:", survey.type === 'external' && !!survey.externalLink);
    
    // 🔥 CRITICAL FIX: For external surveys, generate the dynamic vendor link
    if (survey.type === 'external' && survey.externalLink) {
      console.log("=== EXTERNAL SURVEY - GENERATING DYNAMIC LINK ===");
      console.log("External Link:", survey.externalLink);
      console.log("User ID:", userId);
      
      try {
        // Generate dynamic vendor link with identifier
        const { modifiedUrl, identifier, paramName } = await processExternalSurveyLink(
          survey.externalLink,
          (survey.vendor_id as any)._id.toString(),
          userId || 'anonymous',
          survey.pid
        );
        
        console.log("✅ Generated external survey URL:", modifiedUrl);
        console.log("   Identifier:", identifier);
        console.log("   Param Name:", paramName);
        
        return res.json({
          success: true,
          terminated: false,
          message: 'Pre-screener validation passed',
          isExternal: true,
          externalUrl: modifiedUrl,
          identifier,
          paramName
        });
      } catch (linkError) {
        console.error("❌ Error generating external survey link:", linkError);
        // Fallback: return the original external link without identifier injection
        return res.json({
          success: true,
          terminated: false,
          message: 'Pre-screener validation passed',
          isExternal: true,
          externalUrl: survey.externalLink,
          warning: 'Could not inject tracking identifier'
        });
      }
    }
    
    // For internal surveys, return success as before
    res.json({
      success: true,
      terminated: false,
      message: 'Pre-screener validation passed',
      isExternal: false
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
        let redirectUrl = vendor.terminate_url;
        
        console.log("=== VENDOR TERMINATE URL DEBUG (VALIDATION ERROR) ===");
        console.log("Vendor terminate_url:", redirectUrl);
        console.log("Vendor terminate_url type:", typeof redirectUrl);

        // Use PID from survey, fallback to URL PID if survey PID is missing or invalid
        const finalPid = (survey.pid && survey.pid.length > 0) ? survey.pid : req.query.pid;
        console.log("=== TERMINATE PID COMPARISON DEBUG (VALIDATION ERROR) ===");
        console.log("Survey PID from database:", survey.pid);
        console.log("PID from URL parameters:", req.query.pid);
        console.log("Final PID being used for terminate:", finalPid);

        // Check if redirectUrl already has query parameters
        const hasQueryParams = redirectUrl.includes('?');
        if (hasQueryParams) {
          redirectUrl = `${redirectUrl}&pid=${finalPid}&uid=${userId || 'validation-error'}&status=2`;
        } else {
          redirectUrl = `${redirectUrl}?pid=${finalPid}&uid=${userId || 'validation-error'}&status=2`;
        }
        
        console.log("=== TERMINATE REDIRECT URL DEBUG (VALIDATION ERROR) ===");
        console.log("Survey PID:", survey.pid);
        console.log("User ID:", userId || 'validation-error');
        console.log("Terminate URL:", redirectUrl);
        
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
    const { pid: urlPid } = req.query; // Get PID from URL query params

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
        let terminateUrl = vendor.terminate_url;
        
        console.log("=== VENDOR TERMINATE URL DEBUG ===");
        console.log("Vendor terminate_url:", terminateUrl);
        console.log("Vendor terminate_url type:", typeof terminateUrl);

        // Use PID from survey, fallback to URL PID if survey PID is missing or invalid
        const finalPid = (survey.pid && survey.pid.length > 0) ? survey.pid : urlPid;
        console.log("=== TERMINATE PID COMPARISON DEBUG ===");
        console.log("Survey PID from database:", survey.pid);
        console.log("PID from URL parameters:", urlPid);
        console.log("Final PID being used for terminate:", finalPid);

        // Check if terminateUrl already has query parameters
        const hasQueryParams = terminateUrl.includes('?');
        if (hasQueryParams) {
          terminateUrl = `${terminateUrl}&pid=${finalPid}&uid=${uid}&status=2`;
        } else {
          terminateUrl = `${terminateUrl}?pid=${finalPid}&uid=${uid}&status=2`;
        }
        
        console.log("=== TERMINATE REDIRECT URL DEBUG ===");
        console.log("Survey PID:", survey.pid);
        console.log("User ID:", uid);
        console.log("Terminate URL:", terminateUrl);
        
        return res.json({
          success: true,
          redirectUrl: terminateUrl,
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
    
    console.log("=== VENDOR URL DEBUG ===");
    console.log("Vendor complete_url:", redirectUrl);
    console.log("Vendor complete_url type:", typeof redirectUrl);

    // Use PID from survey, fallback to URL PID if survey PID is missing or invalid
    const finalPid = (survey.pid && survey.pid.length > 0) ? survey.pid : urlPid;
    console.log("=== PID COMPARISON DEBUG ===");
    console.log("Survey PID from database:", survey.pid);
    console.log("PID from URL parameters:", urlPid);
    console.log("Final PID being used:", finalPid);

    // Check if redirectUrl already has query parameters
    const hasQueryParams = redirectUrl.includes('?');
    if (hasQueryParams) {
      redirectUrl = `${redirectUrl}&pid=${finalPid}&uid=${uid}`;
    } else {
      redirectUrl = `${redirectUrl}?pid=${finalPid}&uid=${uid}`;
    }
    
    console.log("=== REDIRECT URL DEBUG ===");
    console.log("Survey PID:", survey.pid);
    console.log("User ID:", uid);
    console.log("Complete URL:", redirectUrl);

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

export const testEndpoint = async (req: Request, res: Response) => {
  console.log("🔥 TEST ENDPOINT HIT!");
  res.json({ success: true, message: "Vendor-lite routes are working!" });
};

export const createSurveySession = async (req: Request, res: Response) => {
  console.log("🔥 createSurveySession endpoint HIT!");
  res.json({ success: true, message: "createSurveySession working!" });
};

export const generateVendorLink = async (req: Request, res: Response) => {
  console.log("🔥 generateVendorLink endpoint HIT!");
  try {
    const { token, userId } = req.body;
    console.log("   Token:", token, "UserId:", userId);

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Survey token and user ID are required'
      });
    }

    // Get survey details to get the actual external URL
    const survey = await IVendorSurvey.findOne({ token: token }).populate({
      path: 'vendor_id',
      model: 'Vendor'
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Only process external surveys
    if (survey.type !== 'external' || !survey.externalLink) {
      return res.status(400).json({
        success: false,
        message: 'This endpoint only works for external surveys'
      });
    }

    console.log("   Found survey:", survey.title);
    console.log("   External link:", survey.externalLink);

    // Replace placeholders in the actual external URL
    let modifiedUrl = survey.externalLink;
    modifiedUrl = modifiedUrl.replace(/XXXX/g, userId);
    modifiedUrl = modifiedUrl.replace(/xxxx/g, userId);
    modifiedUrl = modifiedUrl.replace(/\[USER_ID\]/g, userId);
    modifiedUrl = modifiedUrl.replace(/\[userid\]/g, userId);
    modifiedUrl = modifiedUrl.replace(/\[uid\]/g, userId);
    modifiedUrl = modifiedUrl.replace(/\[UID\]/g, userId);
    
    console.log("   URL after placeholder replacement:", modifiedUrl);

    // Create survey session in database using the actual user ID as identifier
    try {
      const { SurveySession } = await import('../models/SurveySession.js');
      console.log("   SurveySession model imported successfully");
      
      await SurveySession.create({
        identifier: userId, // Use actual user ID as identifier
        vendor_id: survey.vendor_id._id,
        actual_user_id: userId,
        survey_id: survey.pid,
        base_url: survey.externalLink,
        identifier_param_name: 'r'
      });

      console.log("   ✅ Survey session created with user ID as identifier:", userId);
    } catch (dbError) {
      console.error("   ❌ Database error creating survey session:", dbError);
      // Continue without session creation - at least the URL replacement works
    }

    res.json({
      success: true,
      originalUrl: survey.externalLink,
      modifiedUrl: modifiedUrl,
      identifier: userId,
      paramName: 'r'
    });

  } catch (error) {
    const err = error as Error;
    console.error('❌ Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate vendor link',
      error: err.message
    });
  }
};
