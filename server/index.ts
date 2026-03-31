import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import path from 'path';
import { connectDb } from './db.js';
import { signToken } from './lib/auth.js';
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
import vendorLiteRoutes from './vendor-lite/routes.js';
import externalRouter, { loadSurveys, ridToTokenMap } from './externalCreate.js';
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
  origin: [
    'http://localhost:5173',
    'https://surveypanelgo.netlify.app',
    'https://surveypanelgo.com',
    'https://www.surveypanelgo.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.send('Backend running');
});

// Vendor-lite routes
app.use('/vendor-lite', vendorLiteRoutes);

// External survey routes (isolated: POST /external/create, GET /external/router)
app.use('/', externalRouter);
console.log('✅ External routes mounted successfully');

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
    const token = signToken(user._id.toString(), String(user.role));
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
    const token = signToken(user._id.toString(), String(user.role));
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
      doc.questions = doc.questions.map((q: any) => ({
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
    const { surveyId, status, vendorId, preScreenerAnswers, failureReason } = req.body as {
      surveyId?: string;
      status?: 'complete' | 'terminate' | 'quota_full';
      vendorId?: string;
      preScreenerAnswers?: { questionId: string; value: string | number | boolean }[];
      failureReason?: string;
    };
    const userId = req.user?.id; // May be undefined for vendor flow without login

    if (!surveyId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    const sid = survey._id.toString();

    // Only check for duplicates if user is logged in
    if (userId && status === 'complete') {
      console.log('=== DUPLICATE CHECK DEBUG ===');
      console.log('User ID:', userId);
      console.log('Survey ID:', sid);
      console.log('Vendor ID:', vendorId);
      console.log('Vendor ID type:', typeof vendorId);

      // First, let's see all existing responses for this user+survey
      const allExisting = await Response.find({
        surveyId: sid,
        userId: userId,
        status: 'complete'
      });
      console.log('All existing completions for this user+survey:', allExisting.length);
      allExisting.forEach(r => {
        console.log('- Response vendorId:', r.vendorId, 'type:', typeof r.vendorId);
      });

      const existing = await Response.findOne({
        surveyId: sid,
        userId: userId,
        status: 'complete',
        vendorId: vendorId || null // Match vendorId exactly (null for non-vendor)
      });
      console.log('Matching completion found:', existing ? 'YES' : 'NO');
      console.log('==========================');

      if (existing) {
        res.status(400).json({ error: 'Survey already completed' });
        return;
      }
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

    const r = await Response.create({
      surveyId: survey._id.toString(),
      vendorId: vendorId || undefined,
      userId: userId,
      status,
      preScreenerAnswers: preScreenerAnswers || [],
      failureReason: failureReason || undefined,
      userInfo: preScreenerAnswers ? extractUserInfo(preScreenerAnswers) : undefined,
    });

    console.log('Response created with vendorId:', vendorId, 'for survey:', survey._id.toString());

    // Update vendor completion tracking if this is a vendor completion
    if (status === 'complete' && vendorId) {
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

    const uname =
      req.user && 'name' in req.user ? (req.user as { name?: string }).name : 'A respondent';
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

    res.status(201).json({ response: r.toJSON() });
  } catch (e) {
    console.error(e);
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

    console.log("🔥 Redirect HIT:", { pid, uid, status });

    // 🔥 Explicitly use the Netlify domain where the frontend is reliable
    const BASE_URL = "https://surveypanelgo.netlify.app";

    if (!uid || !status) {
      console.error("❌ Missing required parameters (uid/status)");
      // For AJAX requests, return JSON error
      if (req.get('Accept')?.includes('application/json')) {
        return res.status(400).json({ error: "Missing required parameters (uid/status)" });
      }
      return res.redirect(`${BASE_URL}/error`);
    }

    const finalPid = pid || "AUTO_" + Date.now();
    const statusCode = Number(status);

    const statusMap: Record<number, string> = {
      1: "Completed",
      2: "Terminated",
      3: "Quota Full",
      4: "Security Terminated"
    };

    const statusText = statusMap[statusCode] || "Unknown";

    // Non-blocking log creation to avoid delaying the redirect
    SurveyRedirectLogs.create({
      pid: finalPid,
      uid,
      status: statusCode,
      statusText,
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
      createdAt: new Date()
    }).catch(err => console.error("❌ Background log error:", err));

    // Capture diagnostic info
    const rawIp = req.headers["x-forwarded-for"] as string;
    const ip = rawIp
      ? rawIp.split(",")[0].trim()
      : req.socket.remoteAddress || "Unknown";
    const timestamp = new Date().toISOString();

    // 🔥 Check for external survey mapping to enable auto-forwarding to vendors
    let vendorRedirectUrl = "";
    try {
      const { findTokenByUid, loadSurveys } = await import('./externalCreate.js');
      // First try to find token by UID from database
      const token = await findTokenByUid(String(uid));
      
      // Fallback to old method if database lookup fails
      const fallbackToken = await (async () => {
        if (!token) {
          const { findTokenByRid } = await import('./externalCreate.js');
          return findTokenByRid(String(uid));
        }
        return token;
      })();
      
      const finalToken = token || fallbackToken;
      
      if (finalToken) {
        const surveys = loadSurveys();
        const survey = surveys[finalToken];
        if (survey && survey.vendor) {
          let vendorUrl = "";
          if (statusCode === 1) vendorUrl = survey.vendor.complete_url;
          else if (statusCode === 2) vendorUrl = survey.vendor.terminate_url;
          else if (statusCode === 3) vendorUrl = survey.vendor.quota_full_url;

          if (vendorUrl) {
            const sep = vendorUrl.includes("?") ? "&" : "?";
            vendorRedirectUrl = `${vendorUrl}${sep}rid=${uid}&uid=${uid}&pid=${survey.pid || ''}&transactionId=AUTO`;
            console.log(`🔥 Found vendor redirect for UID ${uid}: ${vendorRedirectUrl}`);
          }
        }
      }
    } catch (e: any) {
      console.warn("⚠️ Intercept lookup skipped or failed:", e.message);
    }

    // For AJAX requests, return JSON with vendor redirect URL
    if (req.get('Accept')?.includes('application/json')) {
      return res.json({
        success: true,
        redirectUrl: vendorRedirectUrl,
        hasVendorRedirect: !!vendorRedirectUrl
      });
    }

    // For regular browser requests, redirect as before
    const redirectPages = {
      1: `/survey-result/success?pid=${finalPid}&uid=${uid}&status=1&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`,
      2: `/survey-result/terminated?pid=${finalPid}&uid=${uid}&status=2&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`,
      3: `/survey-result/quota-full?pid=${finalPid}&uid=${uid}&status=3&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`,
      4: `/survey-result/security?pid=${finalPid}&uid=${uid}&status=4&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`
    };

    const finalPath = redirectPages[statusCode] || `/survey-result?pid=${finalPid}&uid=${uid}&status=${statusCode}&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`;
    let finalUrl = `${BASE_URL}${finalPath}`;

    if (vendorRedirectUrl) {
      finalUrl += `&redirect=${encodeURIComponent(vendorRedirectUrl)}`;
    }

    console.log("🚀 Redirecting NOW to:", finalUrl);
    return res.redirect(finalUrl);

  } catch (error) {
    console.error("❌ REDIRECT CRASH:", error);
    const fallback = "https://surveypanelgo.netlify.app";
    // For AJAX requests, return JSON error
    if (req.get('Accept')?.includes('application/json')) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.redirect(`${fallback}/error`);
  }
});

// ---------- Intercept External Flow Default Redirects ----------
// When an external provider ignores our custom callback URL and 
// hits these default routes instead, we intercept and reroute.
app.get("/survey/redirect/:type", async (req, res) => {
  const { type } = req.params;
  const { uid } = req.query as { uid: string };

  console.log("� INTERCEPTED:", type, uid);
  console.log("RID MAP CURRENT STATE:", ridToTokenMap);

  const { findTokenByRid, loadSurveys } = await import('./externalCreate.js');
  const token = findTokenByRid(uid);

  if (token) {
    const surveys = loadSurveys();
    const survey = surveys[token];

    if (!survey) {
      return res.send("Survey not found");
    }

    let redirectUrl = "";

    if (type === "complete") {
      redirectUrl = survey.vendor.complete_url;
    }

    if (type === "terminate") {
      redirectUrl = survey.vendor.terminate_url;
    }

    if (type === "quotafull" || type === "quota") {
      redirectUrl = survey.vendor.quota_full_url;
    }

    if (!redirectUrl) {
      return res.send("Vendor URL configuration missing");
    }

    const sep = redirectUrl.includes("?") ? "&" : "?";
    redirectUrl += `${sep}rid=${uid}`;

    return res.redirect(redirectUrl);
  }

  // fallback (internal flow)
  res.send("Internal redirect fallback");
});

// ---------- Redirect Analytics ----------
app.get('/api/redirect-logs', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, pid, status, search, startDate, endDate } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (pid) filter.pid = String(pid);
    if (status) filter.status = parseInt(status as string);

    // Add general search functionality
    if (search) {
      const searchTerm = String(search).trim();
      if (searchTerm) {
        filter.$or = [
          { pid: { $regex: searchTerm, $options: 'i' } },
          { uid: { $regex: searchTerm, $options: 'i' } },
          { statusText: { $regex: searchTerm, $options: 'i' } },
          { ipAddress: { $regex: searchTerm, $options: 'i' } }
        ];
      }
    }

    // Add date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const endDateTime = new Date(endDate as string);
        endDateTime.setHours(23, 59, 59, 999); // End of day
        filter.createdAt.$lte = endDateTime;
      }
    }

    // Get all matching records first for proper deduplication
    const allLogs = await SurveyRedirectLogs.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Remove duplicates based on combination of pid, uid, and statusText
    const uniqueLogs = allLogs.filter((log, index, self) => {
      return index === self.findIndex((l) => 
        l.pid === log.pid && 
        l.uid === log.uid && 
        l.statusText === log.statusText
      );
    });

    // Apply pagination to unique records
    const paginatedLogs = uniqueLogs.slice(skip, skip + limitNum);

    // Calculate status counts from unique records only
    const uniqueStatusCounts = uniqueLogs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    res.json({
      logs: paginatedLogs.map(log => ({
        ...log,
        id: log._id,
        _id: undefined
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: uniqueLogs.length, // Total unique records
        pages: Math.ceil(uniqueLogs.length / limitNum)
      },
      statusCounts: uniqueStatusCounts
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
      const j = r.toJSON() as unknown as { id: string; surveyId?: string; vendorId?: string; userId?: string; status?: string; timestamp?: string };
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

// ---------- External Link Pass-Through ----------
app.get('/external/start', async (req, res) => {
  try {
    const { projectId, transactionId, userid } = req.query;

    if (!projectId) {
      return res.status(400).send('Missing projectId parameter');
    }

    if (!transactionId || !userid) {
      return res.status(400).send('Missing transactionId or userid parameters');
    }

    // Find the survey by projectId
    const survey = await Survey.findById(projectId);
    if (!survey) {
      return res.status(404).send('Survey not found');
    }

    if (!survey.isExternal || !survey.link) {
      return res.status(400).send('Survey is not external or has no link configured');
    }

    // Replace placeholders in the external URL
    let finalUrl = survey.link;
    finalUrl = finalUrl.replace('[#transaction_id#]', transactionId as string);
    finalUrl = finalUrl.replace('[#userid#]', userid as string);

    // Immediate redirect to the final URL
    return res.redirect(finalUrl);
  } catch (error) {
    console.error('External pass-through error:', error);
    return res.status(500).send('Internal server error');
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
