import { Request, Response } from 'express';
import IVendor from './vendorModel.js';
import IVendorSurvey from './surveyModel.js';
import IVendorResponse from './responseModel.js';
import { SurveyRedirectLogs } from '../models/SurveyRedirectLogs.js';

// Helper function to get real IP address
const getRealIPAddress = (req: any): string => {
  // Try various headers for real IP address
  const xForwardedFor = req.headers['x-forwarded-for'];
  const xRealIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
  const xClientIP = req.headers['x-client-ip'];
  
  let ipAddress = 'unknown';
  
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one (original client)
    ipAddress = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor.split(',')[0].trim();
  } else if (cfConnectingIP) {
    ipAddress = cfConnectingIP as string;
  } else if (xRealIP) {
    ipAddress = xRealIP as string;
  } else if (xClientIP) {
    ipAddress = xClientIP as string;
  } else if (req.socket?.remoteAddress) {
    ipAddress = req.socket.remoteAddress;
  } else if (req.connection?.remoteAddress) {
    ipAddress = req.connection.remoteAddress;
  } else if ((req as any).ip) {
    ipAddress = (req as any).ip;
  }
  
  // Clean up IPv6-mapped IPv4 addresses
  if (ipAddress && ipAddress.startsWith('::ffff:')) {
    ipAddress = ipAddress.substring(7);
  }
  
  // Handle localhost addresses
  if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
    return 'localhost';
  }
  
  // Handle private IP ranges
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./ // Link-local
  ];
  
  const isPrivate = privateRanges.some(range => range.test(ipAddress));
  if (isPrivate) {
    return `${ipAddress} (private)`;
  }
  
  return ipAddress || 'unknown';
};

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
          await SurveyRedirectLogs.createLog({
            pid: survey.pid,
            uid: userId || 'pre-screener-validation', // Use actual user ID if provided
            status: 2, // Terminated
            statusText: 'Terminated - Failed Pre-Screener',
            ipAddress: getRealIPAddress(req),
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
        await SurveyRedirectLogs.createLog({
          pid: survey.pid,
          uid: userId || 'validation-error', // Use actual user ID if provided
          status: 2, // Terminated
          statusText: 'Terminated - Validation Error',
          ipAddress: getRealIPAddress(req),
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
          await SurveyRedirectLogs.createLog({
            pid: survey.pid,
            uid,
            status: 2, // Terminated
            statusText: 'Terminated - Failed Pre-Screener',
            ipAddress: getRealIPAddress(req),
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
      await SurveyRedirectLogs.createLog({
        pid: survey.pid,
        uid,
        status: 1, // Completed survey
        statusText: 'Completed',
        ipAddress: getRealIPAddress(req),
        userAgent: req.get('User-Agent') || 'unknown'
      });
      console.log("✅ Redirect log saved for vendor survey:", { pid: survey.pid, uid, status: 1 });
    } catch (logError) {
      console.error("❌ Error saving redirect log:", logError);
    }

    // Since status is always "complete", use complete_url
    let redirectUrl = (survey.vendor_id as any).complete_url;
    
// ...
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
      await SurveyRedirectLogs.createLog({
        pid: pid as string,
        uid: uid as string,
        status: statusCode,
        statusText,
        ipAddress: getRealIPAddress(req),
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
