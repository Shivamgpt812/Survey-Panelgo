import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import path from 'path';
import { connectDb } from './db.js';
import { signToken } from './lib/auth.js';
import { getUIDForUser } from './lib/vendorUid.js';
import { User } from './models/User.js';
import { Survey } from './models/Survey.js';
import { Reward } from './models/Reward.js';
import { Vendor } from './models/Vendor.js';
import { Response } from './models/Response.js';
import { ActivityLog } from './models/ActivityLog.js';
import { SurveyTracking } from './models/SurveyTracking.js';
import { SurveyRedirectLogs } from './models/SurveyRedirectLogs.js';
import { preScreenerTemplates } from './preScreenerTemplates.js';
import { REDIRECT_URLS, getStatusText, isValidStatus } from './config/redirectConfig.js';
import {
  optionalAuth,
  requireAuth,
  requireAdmin,
  type AuthedRequest,
} from './middleware/optionalAuth.js';

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://surveypanelgo.netlify.app',
  'https://surveypanelgo.com',
  'https://www.surveypanelgo.com'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

// ---------- DEBUG: Auth Bypass for Vendor Routes ----------
app.use((req, res, next) => {
  console.log("🔍 AUTH CHECK:", {
    path: req.path,
    method: req.method,
    hasUser: !!req.user,
    cookies: req.cookies,
    headers: {
      'x-vendor-flow': req.headers['x-vendor-flow'],
      'authorization': req.headers.authorization ? '***' : 'none'
    }
  });

  // Bypass auth for vendor routes
  if (req.path.startsWith('/s/') || req.path.startsWith('/api/vendor') || req.headers['x-vendor-flow'] === 'true') {
    console.log("✅ AUTH BYPASSED for vendor route:", req.path);
    return next();
  }

  // Don't block public routes either
  if (req.path.startsWith('/api/health') || req.path.startsWith('/api/surveys') || req.path.startsWith('/api/redirect')) {
    console.log("✅ AUTH BYPASSED for public route:", req.path);
    return next();
  }

  if (!req.user && (req.path.startsWith('/api/') && !req.path.startsWith('/api/health') && !req.path.startsWith('/api/surveys') && !req.path.startsWith('/api/redirect') && !req.path.startsWith('/api/vendors'))) {
    console.log("❌ AUTH BLOCKED → redirecting to login:", req.path);
    return res.status(401).json({ message: "Auth required" });
  }

  next();
});

app.get('/api/health', (_req, res) => {
  res.send('Backend running');
});

// ---------- Vendor Survey Routes (No Login Required) ----------
app.get('/s/:token', async (req, res) => {
  try {
    console.log('=== 📥 VENDOR SURVEY LOAD DEBUG ===');
    console.log('📍 Path:', req.path);
    console.log('🔑 Token:', req.params.token);
    console.log('🍪 Cookies:', req.cookies);
    console.log('📋 Headers:', {
      'x-vendor-flow': req.headers['x-vendor-flow'],
      'user-agent': req.headers['user-agent'],
      'referer': req.headers['referer']
    });
    
    const { token } = req.params;
    
    if (!token) {
      console.error('❌ No token provided');
      return res.status(400).json({ error: 'Survey token is required' });
    }

    // Find survey by token (assuming token is the survey ID for now)
    const survey = await Survey.findById(token);
    if (!survey) {
      console.error('❌ Survey not found for token:', token);
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status !== 'active') {
      console.error('❌ Survey not active:', survey.title);
      return res.status(404).json({ error: 'Survey not available' });
    }

    // Generate UID for vendor user with debugging
    console.log('🧠 Generating UID for vendor user...');
    const uid = getUIDForUser(req, res, null);
    console.log('✅ Generated UID:', uid);
    console.log('🍪 Vendor UID cookie:', req.cookies.vendor_uid);

    console.log('📊 Survey Load Summary:', {
      surveyId: survey._id,
      surveyTitle: survey.title,
      uid,
      isVendorFlow: true,
      hasPreScreener: !!(survey.preScreener && survey.preScreener.length > 0),
      isExternal: survey.isExternal
    });
    console.log('=====================================');

    // Return survey data with vendor context
    res.json({
      survey: survey.toJSON(),
      uid,
      isVendorFlow: true,
      message: 'Vendor survey loaded successfully'
    });

  } catch (error) {
    console.error('❌ VENDOR SURVEY LOAD ERROR:', {
      message: error.message,
      stack: error.stack,
      token: req.params.token,
      cookies: req.cookies
    });
    res.status(500).json({ 
      error: 'Failed to load vendor survey',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function userJson(u: InstanceType<typeof User>) {
  return u.toJSON() as Record<string, unknown>;
}

// ---------- Auth ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };
    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }
    const em = email.toLowerCase().trim();
    const exists = await User.findOne({ email: em });
    if (exists) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const passwordHash = bcrypt.hashSync(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: em,
      passwordHash,
      role: 'user',
      points: 0,
      surveysCompleted: 0,
      memberSince: new Date().toISOString().slice(0, 10),
    });
    const token = signToken(user._id.toString(), user.role);
    res.status(201).json({ token, user: userJson(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = signToken(user._id.toString(), user.role);
    await ActivityLog.create({
      message: `${user.name} logged in`,
      type: 'info',
    });
    res.json({ token, user: userJson(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const u = await User.findById(req.user!._id);
    if (!u) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.json({ user: userJson(u) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

// ---------- Users (admin: panel accounts only, matches "Total Users" analytics) ----------
app.get('/api/users', requireAdmin, async (_req, res) => {
  try {
    const list = await User.find({ role: 'user' }).sort({ name: 1 }).lean();
    res.json({
      users: list.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// ---------- Pre-screener templates (building blocks, not seed data) ----------
app.get('/api/pre-screener-templates', (_req, res) => {
  res.json({ templates: preScreenerTemplates });
});

// ---------- Surveys ----------
app.get('/api/surveys', optionalAuth, async (req: AuthedRequest, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const list = isAdmin
      ? await Survey.find().sort({ createdAt: -1 })
      : await Survey.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ surveys: list.map((s) => s.toJSON()) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load surveys' });
  }
});

app.get('/api/surveys/:id', optionalAuth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(404).json({ error: 'Survey not found' });
      return;
    }
    const survey = await Survey.findById(id);
    if (!survey) {
      res.status(404).json({ error: 'Survey not found' });
      return;
    }
    const isAdmin = req.user?.role === 'admin';
    if (survey.status !== 'active' && !isAdmin) {
      res.status(404).json({ error: 'Survey not found' });
      return;
    }
    res.json({ survey: survey.toJSON() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load survey' });
  }
});

app.post('/api/surveys', requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const doc = await Survey.create(body);
    const sid = doc._id.toString();
    if (doc.questions?.length) {
      doc.questions = doc.questions.map((q: { id?: string; surveyId?: string }) => ({
        ...q,
        surveyId: sid,
      })) as typeof doc.questions;
      await doc.save();
    }
    await ActivityLog.create({
      message: `New survey created: ${doc.title}`,
      type: 'info',
    });
    res.status(201).json({ survey: doc.toJSON() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

app.patch('/api/surveys/:id', requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(404).json({ error: 'Survey not found' });
      return;
    }
    const update = req.body;
    const survey = await Survey.findByIdAndUpdate(id, update, { new: true });
    if (!survey) {
      res.status(404).json({ error: 'Survey not found' });
      return;
    }
    await ActivityLog.create({
      message: `Survey updated: ${survey.title}`,
      type: 'info',
    });
    res.json({ survey: survey.toJSON() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

app.delete('/api/surveys/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const survey = await Survey.findByIdAndDelete(id);
    if (!survey) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await ActivityLog.create({
      message: `Survey deleted: ${survey.title}`,
      type: 'warning',
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

// ---------- Vendors ----------
app.get('/api/vendors', async (_req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json({ vendors: vendors.map((v) => v.toJSON()) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load vendors' });
  }
});

app.post('/api/vendors', requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { name, redirectLinks } = req.body as {
      name?: string;
      redirectLinks?: { complete: string; terminate: string; quotaFull: string };
    };
    if (!name?.trim() || !redirectLinks?.complete || !redirectLinks?.terminate || !redirectLinks?.quotaFull) {
      res.status(400).json({ error: 'Invalid vendor payload' });
      return;
    }
    const v = await Vendor.create({ name: name.trim(), redirectLinks });
    await ActivityLog.create({
      message: `Vendor added: ${v.name}`,
      type: 'info',
    });
    res.status(201).json({ vendor: v.toJSON() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

app.delete('/api/vendors/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const v = await Vendor.findByIdAndDelete(id);
    if (!v) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

// ---------- Rewards ----------
app.get('/api/rewards', async (_req, res) => {
  try {
    const rewards = await Reward.find().sort({ createdAt: -1 });
    res.json({ rewards: rewards.map((r) => r.toJSON()) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load rewards' });
  }
});

// ---------- Responses & completion ----------
app.get('/api/responses', requireAdmin, async (_req, res) => {
  try {
    const responses = await Response.find().sort({ createdAt: -1 });
    res.json({
      responses: responses.map((r) => {
        const j = r.toJSON() as Record<string, unknown>;
        return j;
      }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load responses' });
  }
});

app.post('/api/responses', optionalAuth, async (req: AuthedRequest, res) => {
  try {
    console.log('=== 📤 RESPONSE SUBMISSION DEBUG ===');
    console.log('📍 Path:', req.path);
    console.log('📋 Request body:', req.body);
    console.log('👤 Logged in user:', req.user?._id?.toString());
    console.log('🍪 Cookies:', req.cookies);
    console.log('📋 Headers:', {
      'x-vendor-flow': req.headers['x-vendor-flow'],
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? '***' : 'none'
    });
    
    const { surveyId, status, vendorId, preScreenerAnswers, failureReason } = req.body as {
      surveyId?: string;
      status?: 'complete' | 'terminate' | 'quota_full';
      vendorId?: string;
      preScreenerAnswers?: { questionId: string; value: string | number | boolean }[];
      failureReason?: string;
    };
    
    // Get UID for user (logged in or vendor) with debugging
    console.log('🧠 Resolving UID...');
    const uid = getUIDForUser(req, res, req.user);
    console.log('✅ UID Resolution Summary:', {
      fromUser: req.user?._id?.toString(),
      fromVendorCookie: req.cookies.vendor_uid,
      finalUID: uid,
      isLoggedIn: !!req.user,
      isVendorFlow: req.headers['x-vendor-flow'] === 'true'
    });

    if (!surveyId || !status) {
      console.error('❌ Missing required fields:', { surveyId, status });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!uid) {
      console.error('❌ UID MISSING - THIS SHOULD NEVER HAPPEN');
      console.error('❌ UID Debug Info:', {
        hasUser: !!req.user,
        userId: req.user?._id?.toString(),
        hasVendorCookie: !!req.cookies.vendor_uid,
        vendorCookieValue: req.cookies.vendor_uid
      });
      return res.status(400).json({ error: 'UID missing - contact support' });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      console.error('❌ Survey not found:', surveyId);
      return res.status(404).json({ message: 'Survey not found' });
    }
    const sid = survey._id.toString();

    // Only check for duplicates if user is logged in (not for vendor flow)
    if (req.user && status === 'complete') {
      console.log('=== 🔄 DUPLICATE CHECK DEBUG (LOGGED IN USER) ===');
      console.log('👤 User ID:', uid);
      console.log('📋 Survey ID:', sid);
      console.log('🏪 Vendor ID:', vendorId);
      console.log('📊 Vendor ID type:', typeof vendorId);
      
      // First, let's see all existing responses for this user+survey
      const allExisting = await Response.find({ 
        surveyId: sid, 
        userId: uid, 
        status: 'complete'
      });
      console.log('📈 All existing completions for this user+survey:', allExisting.length);
      allExisting.forEach(r => {
        console.log('- Response vendorId:', r.vendorId, 'type:', typeof r.vendorId);
      });
      
      const existing = await Response.findOne({ 
        surveyId: sid, 
        userId: uid, 
        status: 'complete',
        vendorId: vendorId || null // Match vendorId exactly (null for non-vendor)
      });
      console.log('🎯 Matching completion found:', existing ? 'YES' : 'NO');
      console.log('============================================');
      
      if (existing) {
        console.log('❌ Duplicate completion blocked');
        res.status(400).json({ error: 'Survey already completed' });
        return;
      }
    } else {
      console.log('✅ Skipping duplicate check for vendor flow or non-complete status');
    }

    // Extract user information from pre-screener answers
    const extractUserInfo = (answers: { questionId: string; value: string | number | boolean }[]) => {
      const userInfo: any = {};
      
      answers.forEach(answer => {
        const questionId = answer.questionId.toLowerCase();
        const value = answer.value;
        
        if (questionId.includes('age') && typeof value === 'number') {
          userInfo.age = value;
        } else if (questionId.includes('name') && typeof value === 'string') {
          userInfo.name = value;
        } else if (questionId.includes('email') && typeof value === 'string') {
          userInfo.email = value;
        } else if (questionId.includes('gender') && typeof value === 'string') {
          userInfo.gender = value;
        } else if ((questionId.includes('location') || questionId.includes('city') || questionId.includes('country')) && typeof value === 'string') {
          userInfo.location = value;
        }
      });
      
      return userInfo;
    };

    console.log('💾 Creating response record...');
    const response = await Response.create({
      surveyId: survey._id.toString(),
      vendorId: vendorId || undefined,
      userId: uid, // Always use the UID we generated
      status,
      preScreenerAnswers: preScreenerAnswers || [],
      failureReason: failureReason || undefined,
      userInfo: preScreenerAnswers ? extractUserInfo(preScreenerAnswers) : undefined,
    });

    console.log('✅ Response created successfully:', {
      responseId: response._id,
      surveyId: survey._id,
      userId: uid,
      vendorId,
      status,
      isVendorFlow: !req.user,
      answersCount: preScreenerAnswers?.length || 0
    });

    // Update vendor completion tracking if this is a vendor completion
    if (status === 'complete' && vendorId) {
      try {
        console.log('🏪 Updating vendor completion tracking...');
        await Vendor.findByIdAndUpdate(vendorId, {
          $addToSet: { completedSurveys: survey._id },
          $inc: { totalCompletions: 1 }
        });
        console.log(`✅ Vendor completion tracked: ${vendorId} for survey ${survey._id}`);
      } catch (vendorError) {
        console.error('❌ Failed to update vendor completion tracking:', vendorError);
      }
    }

    const uname =
      req.user && 'name' in req.user ? (req.user as { name?: string }).name : `Vendor User ${uid}`;
    if (status === 'complete') {
      await ActivityLog.create({
        message: `${uname} recorded response (complete) for: ${survey.title}`,
        type: 'success',
      });
    } else if (status === 'terminate') {
      const userInfo = preScreenerAnswers ? extractUserInfo(preScreenerAnswers) : {};
      const ageInfo = userInfo.age ? ` (age: ${userInfo.age})` : '';
      const failureInfo = failureReason ? ` - Reason: ${failureReason}` : '';
      await ActivityLog.create({
        message: `${uname} did not qualify for: ${survey.title}${ageInfo}${failureInfo}${vendorId ? ' (vendor flow)' : ''}`,
        type: 'warning',
      });
    } else if (status === 'quota_full') {
      await ActivityLog.create({
        message: `Quota full for: ${survey.title}`,
        type: 'warning',
      });
    }

    console.log('=== 🎉 RESPONSE SUBMISSION SUCCESS ===');
    res.status(201).json({ response: response.toJSON() });
  } catch (e) {
    console.error('❌ RESPONSE SUBMISSION ERROR:', {
      message: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : 'No stack trace',
      requestBody: req.body,
      cookies: req.cookies,
      hasUser: !!req.user,
      userId: req.user?._id?.toString()
    });
    res.status(500).json({ error: 'Failed to record response' });
  }
});

app.post('/api/internal-complete', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { surveyId, vendorId } = req.body as { surveyId?: string; vendorId?: string };
    if (!surveyId || !mongoose.isValidObjectId(surveyId)) {
      res.status(400).json({ error: 'Invalid survey' });
      return;
    }
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      res.status(404).json({ error: 'Survey not found' });
      return;
    }
    const isAdmin = req.user?.role === 'admin';
    if (survey.status !== 'active' && !isAdmin) {
      res.status(404).json({ error: 'Survey not found' });
      return;
    }
    if (survey.isExternal) {
      res.status(400).json({ error: 'Not an internal survey' });
      return;
    }

    const sid = survey._id.toString();
    const uid = user._id.toString();
    console.log('=== INTERNAL COMPLETION DEBUG ===');
    console.log('User ID:', uid);
    console.log('Survey ID:', sid);
    console.log('Vendor ID:', vendorId);
    console.log('Vendor ID type:', typeof vendorId);
    
    // First, let's see all existing responses for this user+survey
    const allExisting = await Response.find({ 
      surveyId: sid, 
      userId: uid, 
      status: 'complete'
    });
    console.log('All existing completions for this user+survey:', allExisting.length);
    allExisting.forEach(r => {
      console.log('- Response vendorId:', r.vendorId, 'type:', typeof r.vendorId);
    });
    
    const existing = await Response.findOne({ 
      surveyId: sid, 
      userId: uid, 
      status: 'complete',
      vendorId: vendorId || null // Match vendorId exactly (null for non-vendor)
    });
    console.log('Matching completion found:', existing ? 'YES' : 'NO');
    console.log('==============================');
    
    if (existing) {
      res.status(400).json({ error: 'Survey already completed' });
      return;
    }

    await Response.create({
      surveyId: survey._id.toString(),
      userId: user._id.toString(),
      vendorId: vendorId || undefined,
      status: 'complete',
    });

    console.log('Internal completion response created with vendorId:', vendorId, 'for survey:', survey._id.toString());

    // Update vendor completion tracking if this is a vendor completion
    if (vendorId) {
      try {
        await Vendor.findByIdAndUpdate(vendorId, {
          $addToSet: { completedSurveys: survey._id },
          $inc: { totalCompletions: 1 }
        });
        console.log(`Vendor completion tracked: ${vendorId} for survey ${survey._id}`);
      } catch (vendorError) {
        console.error('Failed to update vendor completion tracking:', vendorError);
      }
    }
    user.points += survey.pointsReward;
    user.surveysCompleted += 1;
    await user.save();

    await ActivityLog.create({
      message: `${user.name} completed internal survey: ${survey.title}`,
      type: 'success',
    });

    const fresh = await User.findById(user._id);
    res.json({ user: fresh ? userJson(fresh) : userJson(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to complete survey' });
  }
});

app.get('/api/my-responses', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const list = await Response.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json({ responses: list.map((r) => r.toJSON()) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load responses' });
  }
});

// ---------- Survey Tracking ----------
app.post('/api/survey-tracking/start', optionalAuth, async (req: AuthedRequest, res) => {
  try {
    const { surveyId } = req.body;
    if (!surveyId) {
      res.status(400).json({ error: 'Survey ID is required' });
      return;
    }

    // Generate unique click ID (PID)
    const clickId = `PID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user ID (authenticated or anonymous)
    const userId = req.user?._id?.toString() || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get real IP address
    const xForwardedFor = req.headers['x-forwarded-for'];
    const xRealIP = req.headers['x-real-ip'];
    let ipAddress = (req as any).ip || (req as any).connection?.remoteAddress || 'unknown';
    
    if (Array.isArray(xForwardedFor)) {
      ipAddress = xForwardedFor[0];
    } else if (typeof xForwardedFor === 'string') {
      ipAddress = xForwardedFor.split(',')[0].trim();
    } else if (xRealIP) {
      ipAddress = xRealIP as string;
    }
    
    // Clean up IP address (remove ::ffff: prefix if present)
    ipAddress = ipAddress.replace(/^::ffff:/, '');

    res.json({ 
      clickId, 
      userId, 
      ipAddress,
      message: 'Survey tracking initialized' 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to initialize survey tracking' });
  }
});

app.post('/api/survey-tracking/complete', optionalAuth, async (req: AuthedRequest, res: any) => {
  try {
    const { surveyId, userId, clickId, status } = (req as any).body;
    
    if (!surveyId || !userId || !clickId || !status) {
      res.status(400).json({ error: 'All fields are required: surveyId, userId, clickId, status' });
      return;
    }

    if (!['completed', 'terminated', 'quota_full'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be: completed, terminated, or quota_full' });
      return;
    }

    // Get real IP address
    const xForwardedFor = req.headers['x-forwarded-for'];
    const xRealIP = req.headers['x-real-ip'];
    let ipAddress = (req as any).ip || (req as any).connection?.remoteAddress || 'unknown';
    
    if (Array.isArray(xForwardedFor)) {
      ipAddress = xForwardedFor[0];
    } else if (typeof xForwardedFor === 'string') {
      ipAddress = xForwardedFor.split(',')[0].trim();
    } else if (xRealIP) {
      ipAddress = xRealIP as string;
    }
    
    // Clean up IP address
    ipAddress = ipAddress.replace(/^::ffff:/, '');

    // Create tracking record
    const tracking = await SurveyTracking.create({
      surveyId,
      userId,
      clickId,
      ipAddress,
      status,
      timestamp: new Date(),
    });

    // Determine redirect URL based on status
    let redirectUrl = `/survey-result/${clickId}`;
    
    res.json({ 
      tracking: tracking.toJSON(),
      redirectUrl,
      message: 'Survey tracking completed successfully' 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to complete survey tracking' });
  }
});

app.get('/api/survey-tracking/:clickId', async (req, res) => {
  try {
    const { clickId } = req.params;
    
    const tracking = await SurveyTracking.findOne({ clickId });
    if (!tracking) {
      res.status(404).json({ error: 'Tracking record not found' });
      return;
    }

    res.json({ tracking: tracking.toJSON() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load tracking record' });
  }
});

app.get('/api/survey-tracking', requireAdmin, async (_req: any, res) => {
  try {
    const logs = await SurveyTracking.find().sort({ timestamp: -1 });
    res.json({ 
      logs: logs.map(log => log.toJSON())
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load survey tracking logs' });
  }
});

// ---------- Survey Redirect Tracking ----------
app.get('/api/redirect', async (req, res) => {
  try {
    const { pid, uid, status } = req.query;

    console.log("=== REDIRECT DEBUG ===");
    console.log("Redirect HIT:", { pid, uid, status });
    console.log("Cookies:", req.cookies);
    console.log("Headers:", req.headers);

    // Validate params
    if (!uid || !status) {
      console.error("Missing params:", { pid, uid, status });
      return res.redirect("https://surveypanelgo.netlify.app/error");
    }

    // Auto generate PID if not provided
    const finalPid = pid || "AUTO_" + Date.now();
    console.log("Final PID:", finalPid);

    // Convert status to number
    const statusCode = Number(status);

    const statusMap = {
      1: "Completed",
      2: "Terminated", 
      3: "Quota Full",
      4: "Security Terminated"
    };

    const statusText = statusMap[statusCode] || "Unknown";

    // Save to DB
    try {
      await SurveyRedirectLogs.create({
        pid: finalPid,
        uid,
        status: statusCode,
        statusText,
        ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
        createdAt: new Date()
      });

      console.log("✅ Redirect log saved successfully");
    } catch (dbError) {
      console.error("❌ DB SAVE ERROR:", dbError);
    }

    // Redirect user to frontend (IMPORTANT)
    const BASE_URL = "https://surveypanelgo.netlify.app";

    // Capture IP address
    const rawIp = req.headers["x-forwarded-for"] as string;
    const ip = rawIp
      ? rawIp.split(",")[0].trim()
      : req.socket.remoteAddress || "Unknown";

    // Capture timestamp
    const timestamp = new Date().toISOString();

    // Log redirect data for debugging
    console.log("🔀 Redirect Data:", { finalPid, uid, status, ip, timestamp });

    const redirectPages = {
      1: `/survey-result/success?pid=${finalPid}&uid=${uid}&status=1&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`,
      2: `/survey-result/terminated?pid=${finalPid}&uid=${uid}&status=2&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`,
      3: `/survey-result/quota-full?pid=${finalPid}&uid=${uid}&status=3&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`,
      4: `/survey-result/security?pid=${finalPid}&uid=${uid}&status=4&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`
    };

    const finalPath = redirectPages[statusCode] || `/survey-result?pid=${finalPid}&uid=${uid}&status=${statusCode}&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`;
    const finalUrl = `${BASE_URL}${finalPath}`;

    console.log("🚀 Redirecting to:", finalUrl);
    console.log("==================");

    return res.redirect(finalUrl);
  } catch (error) {
    console.error("❌ REDIRECT CRASH:", error);

    return res.redirect("https://surveypanelgo.netlify.app/error");
  }
});

// ---------- Redirect Analytics ----------
app.get('/api/redirect-logs', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, pid, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (pid) filter.pid = String(pid);
    if (status) filter.status = parseInt(status as string);

    const [logs, total] = await Promise.all([
      SurveyRedirectLogs.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SurveyRedirectLogs.countDocuments(filter)
    ]);

    const statusCounts = await SurveyRedirectLogs.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      logs: logs.map(log => ({
        ...log,
        id: log._id,
        _id: undefined
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<number, number>)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load redirect logs' });
  }
});

// ---------- Analytics & activity ----------
app.get('/api/analytics', requireAdmin, async (_req, res) => {
  try {
    const [allSurveys, users, responses, vendors] = await Promise.all([
      Survey.find(),
      User.find(),
      Response.find(),
      Vendor.find(),
    ]);
    const totalUsers = users.filter((u) => u.role === 'user').length;
    const totalAdmins = users.filter((u) => u.role === 'admin').length;
    const totalPointsDistributed = users.reduce((sum, u) => sum + (u.points || 0), 0);

    const vendorAnalytics: Record<string, { completes: number; terminates: number; quotaFull: number }> =
      {};
    console.log('Total responses found:', responses.length);
    console.log('Total vendors found:', vendors.length);
    
    for (const v of vendors) {
      const vid = v._id.toString();
      const vr = responses.filter((r) => r.vendorId && r.vendorId.toString() === vid);
      console.log(`Vendor ${v.name} (${vid}): ${vr.length} responses`);
      
      vendorAnalytics[vid] = {
        completes: vr.filter((r) => r.status === 'complete').length,
        terminates: vr.filter((r) => r.status === 'terminate').length,
        quotaFull: vr.filter((r) => r.status === 'quota_full').length,
      };
      
      console.log(`Vendor ${v.name} analytics:`, vendorAnalytics[vid]);
    }

    res.json({
      analytics: {
        totalSurveys: allSurveys.length,
        activeSurveys: allSurveys.filter((s) => s.status === 'active').length,
        inactiveSurveys: allSurveys.filter((s) => s.status === 'inactive').length,
        totalUsers,
        totalAdmins,
        totalPointsDistributed,
      },
      vendorAnalytics,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

app.get('/api/activity-logs', requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit);
    res.json({ logs: logs.map((l) => l.toJSON()) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

app.get('/api/export/responses.csv', requireAdmin, async (_req, res) => {
  try {
    const responses = await Response.find().sort({ createdAt: -1 });
    const headers = ['Response ID', 'Survey ID', 'Vendor ID', 'User ID', 'Status', 'Timestamp'];
    const rows = responses.map((r) => {
      const j = r.toJSON() as { id: string; surveyId?: string; vendorId?: string; userId?: string; status?: string; timestamp?: string };
      return [
        j.id,
        j.surveyId || '',
        j.vendorId || 'direct',
        j.userId || '',
        j.status || '',
        j.timestamp ? new Date(j.timestamp as string).toISOString() : '',
      ];
    });
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).send('Export failed');
  }
});

// ---------- Frontend Static Serving (MUST BE LAST) ----------
app.use(express.static('dist'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve('dist/index.html'));
});

const PORT = Number(process.env.PORT) || 10000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

void connectDb(MONGODB_URI).then(() => {
  console.log("MongoDB connected successfully ✅");
  console.log("Server running...");
  app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
  });
});
