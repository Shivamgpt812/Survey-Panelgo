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
import { SurveySession } from './models/SurveySession.js';
import { OtpVerification } from './models/OtpVerification.js';
import { sendOtpEmail, sendPasswordResetEmail } from './lib/mailer.js';
import { preScreenerTemplates } from './preScreenerTemplates.js';
import { REDIRECT_URLS, getStatusText, isValidStatus } from './config/redirectConfig.js';
import { extractProjectIdFromUrl } from './lib/surveySessionUtils.js';
import vendorLiteRoutes from './vendor-lite/routes.js';
import externalRouter, { loadSurveys, ridToTokenMap } from './externalCreate.js';
import {
  optionalAuth,
  requireAuth,
  requireAdmin,
  type AuthedRequest,
} from './middleware/optionalAuth.js';
import { OAuth2Client } from 'google-auth-library';

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
    const { name, email, phone, password } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
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
      phone: (phone || '').trim(),
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

    // STRICT ISOLATION: Panelists cannot log in via the normal /auth portal
    if (
      user.role !== 'admin' &&
      user.panelType &&
      ['b2b', 'b2c', 'patients-carers', 'healthcare-professionals'].includes(user.panelType)
    ) {
      const panelName = panelDisplayNames[user.panelType] || `${user.panelType.toUpperCase()} Panel`;
      res.status(403).json({
        error: `This account is registered under the ${panelName}. You cannot log in through the main portal. Please log in at /panels/${user.panelType}/login`,
        panelType: user.panelType,
      });
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
    if (u.surveysCompleted === 0 && u.points > 0) {
      u.points = 0;
      await u.save();
    }
    res.json({ user: userJson(u) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

// ---------- Panel Authentication & OTP ----------
const panelDisplayNames: Record<string, string> = {
  b2b: 'B2B Panel',
  b2c: 'B2C Panel',
  'patients-carers': 'Patients & Carers Panel',
  'healthcare-professionals': 'Healthcare Professionals Panel',
};

// 1. Send OTP via Gmail SMTP
app.post('/api/panel-auth/send-otp', async (req, res) => {
  try {
    const { email, panelType } = req.body as { email?: string; panelType?: string };
    if (!email?.trim()) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const em = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: em });
    if (existingUser) {
      if (
        existingUser.panelType &&
        ['b2b', 'b2c', 'patients-carers', 'healthcare-professionals'].includes(existingUser.panelType)
      ) {
        const existingPanelName = panelDisplayNames[existingUser.panelType] || existingUser.panelType;
        if (existingUser.panelType !== panelType) {
          res.status(409).json({
            error: `An account with this email is already registered under the ${existingPanelName}. Please sign in at /panels/${existingUser.panelType}/login.`,
          });
          return;
        }
      }
      res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP record
    await OtpVerification.deleteMany({ email: em });
    await OtpVerification.create({ email: em, otp, expiresAt });

    const panelName = panelDisplayNames[panelType || ''] || 'Survey Panel Go';
    const sent = await sendOtpEmail(em, otp, panelName);

    if (!sent) {
      res.status(500).json({ error: 'Failed to send OTP email. Please verify your email address and try again.' });
      return;
    }

    res.json({ success: true, message: `Verification code sent to ${em}` });
  } catch (e) {
    console.error('Error in send-otp:', e);
    res.status(500).json({ error: 'Server error sending verification code' });
  }
});

// 2. Verify OTP and Register Panel User
app.post('/api/panel-auth/verify-and-register', async (req, res) => {
  try {
    const { name, email, phone, password, panelType, otp } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      panelType?: string;
      otp?: string;
    };

    if (!name?.trim() || !email?.trim() || !password || !otp?.trim()) {
      res.status(400).json({ error: 'Name, email, password, and OTP are required' });
      return;
    }

    const em = email.toLowerCase().trim();

    // Verify OTP record
    const otpRecord = await OtpVerification.findOne({ email: em, otp: otp.trim() });
    if (!otpRecord) {
      res.status(400).json({ error: 'Invalid or expired verification code' });
      return;
    }

    if (new Date() > otpRecord.expiresAt) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      return;
    }

    // Clean up used OTP
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    // Check if user already exists
    const existing = await User.findOne({ email: em });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: em,
      phone: (phone || '').trim(),
      passwordHash,
      role: 'user',
      points: 0,
      surveysCompleted: 0,
      memberSince: new Date().toISOString().slice(0, 10),
      panelType: panelType || 'general',
      isVerified: true,
      onboardingCompleted: false,
    });

    const token = signToken(user._id.toString(), String(user.role));

    await ActivityLog.create({
      message: `New panelist ${user.name} registered for ${panelDisplayNames[panelType || ''] || 'Panel'}`,
      type: 'info',
    });

    res.status(201).json({
      token,
      user: userJson(user),
      needsOnboarding: true,
      message: 'Account created successfully. Please complete your profile.'
    });
  } catch (e) {
    console.error('Error in verify-and-register:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 3. Panel Login
app.post('/api/panel-auth/login', async (req, res) => {
  try {
    const { email, password, panelType } = req.body as {
      email?: string;
      password?: string;
      panelType?: string;
    };

    if (!email?.trim() || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // STRICT PANEL MATCHING (Accounts must match the specific panel portal, unless Admin)
    const validPanels = ['b2b', 'b2c', 'patients-carers', 'healthcare-professionals'];
    const requestedPanel = panelType?.toLowerCase().trim();
    const userPanel = user.panelType?.toLowerCase().trim();

    if (user.role === 'admin') {
      // Admins are unrestricted and can log in from ANY panel login or portal!
    } else if (userPanel && validPanels.includes(userPanel)) {
      if (requestedPanel && userPanel !== requestedPanel) {
        const userPanelName = panelDisplayNames[userPanel] || userPanel.toUpperCase();
        const requestedPanelName = panelDisplayNames[requestedPanel] || requestedPanel.toUpperCase();
        res.status(403).json({
          error: `Access Denied: This account is registered exclusively under the ${userPanelName}. You cannot log in through the ${requestedPanelName} portal. Please sign in at /panels/${userPanel}/login.`,
          correctPanel: userPanel,
        });
        return;
      }
    } else {
      // User has no specific panel or is a general portal user
      if (requestedPanel && validPanels.includes(requestedPanel)) {
        const requestedPanelName = panelDisplayNames[requestedPanel] || requestedPanel.toUpperCase();
        res.status(403).json({
          error: `This account was not created for the ${requestedPanelName}. Please sign up for this panel or log in through the main portal.`,
        });
        return;
      }
    }

    if (user.surveysCompleted === 0 && user.points > 0) {
      user.points = 0;
      await user.save();
    }

    const token = signToken(user._id.toString(), String(user.role));

    await ActivityLog.create({
      message: `${user.name} logged into ${panelDisplayNames[panelType || user.panelType || ''] || 'Panel'}`,
      type: 'info',
    });

    res.json({
      token,
      user: userJson(user),
      needsOnboarding: !user.onboardingCompleted,
    });
  } catch (e) {
    console.error('Error in panel login:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 4. Send Password Reset OTP via Gmail SMTP
app.post(['/api/auth/forgot-password/send-otp', '/api/panel-auth/forgot-password/send-otp'], async (req, res) => {
  try {
    const { email, panelType } = req.body as { email?: string; panelType?: string };
    if (!email?.trim()) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const em = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: em });
    if (!existingUser) {
      res.status(404).json({ error: 'No registered account found with this email address. Please check your email or sign up.' });
      return;
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP record
    await OtpVerification.deleteMany({ email: em });
    await OtpVerification.create({ email: em, otp, expiresAt });

    const panelName = panelDisplayNames[panelType || existingUser.panelType || ''] || 'Survey Panel Go';
    const sent = await sendPasswordResetEmail(em, otp, panelName);

    if (!sent) {
      res.status(500).json({ error: 'Failed to send password reset code. Please verify your email and try again.' });
      return;
    }

    await ActivityLog.create({
      message: `Password reset code requested for ${em}`,
      type: 'info',
    });

    res.json({ success: true, message: `Password reset verification code sent to ${em}` });
  } catch (e) {
    console.error('Error in forgot-password/send-otp:', e);
    res.status(500).json({ error: 'Server error sending verification code' });
  }
});

// 5. Verify Reset OTP and Update Password in Database
app.post(['/api/auth/forgot-password/verify-and-reset', '/api/panel-auth/forgot-password/verify-and-reset'], async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body as {
      email?: string;
      otp?: string;
      newPassword?: string;
    };

    if (!email?.trim() || !otp?.trim() || !newPassword) {
      res.status(400).json({ error: 'Email, verification code, and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const em = email.toLowerCase().trim();

    // Verify OTP record
    const otpRecord = await OtpVerification.findOne({ email: em, otp: otp.trim() });
    if (!otpRecord) {
      res.status(400).json({ error: 'Invalid or incorrect verification code. Please check and try again.' });
      return;
    }

    if (new Date() > otpRecord.expiresAt) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      return;
    }

    const user = await User.findOne({ email: em });
    if (!user) {
      res.status(404).json({ error: 'User account not found' });
      return;
    }

    // Hash new password and save to database
    const passwordHash = bcrypt.hashSync(newPassword, 12);
    user.passwordHash = passwordHash;
    await user.save();

    // Clean up used OTP
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    await ActivityLog.create({
      message: `${user.name} successfully reset their password`,
      type: 'info',
    });

    res.json({ success: true, message: 'Password reset successfully! You can now sign in with your new password.' });
  } catch (e) {
    console.error('Error in forgot-password/verify-and-reset:', e);
    res.status(500).json({ error: 'Server error resetting password' });
  }
});

// 4. Complete Onboarding Profile Form
app.post('/api/panel-auth/complete-profile', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const {
      employmentStatus,
      industry,
      roleTitle,
      department,
      country,
      revenue,
      area,
      city,
      pincode,
    } = req.body as {
      employmentStatus?: string;
      industry?: string;
      roleTitle?: string;
      department?: string;
      country?: string;
      revenue?: string;
      area?: string;
      city?: string;
      pincode?: string;
    };

    if (!country?.trim() || !employmentStatus?.trim()) {
      res.status(400).json({ error: 'Country and employment status are required' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      {
        $set: {
          employmentStatus: employmentStatus?.trim() || '',
          industry: industry?.trim() || '',
          roleTitle: roleTitle?.trim() || '',
          department: department?.trim() || '',
          country: country?.trim() || '',
          revenue: revenue?.trim() || '',
          area: area?.trim() || '',
          city: city?.trim() || '',
          pincode: pincode?.trim() || '',
          onboardingCompleted: true,
          isVerified: true,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await ActivityLog.create({
      message: `${updatedUser.name} completed their panel onboarding profile`,
      type: 'info',
    });

    res.json({
      success: true,
      user: userJson(updatedUser),
      message: 'Profile completed successfully!',
    });
  } catch (e) {
    console.error('Error in complete-profile:', e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 5. Get current panel user profile
app.get('/api/panel-auth/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const u = await User.findById(req.user!._id);
    if (!u) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (u.surveysCompleted === 0 && u.points > 0) {
      u.points = 0;
      await u.save();
    }
    res.json({ user: userJson(u) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load panel profile' });
  }
});


// ---------- Google OAuth ----------
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('Google auth request received:', req.body);
    const { token } = req.body;
    if (!token) {
      console.log('No token provided in request');
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    console.log('Verifying Google ID token...');
    // Verify ID token directly (no code exchange needed)
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('Google token payload:', payload);
    
    if (!payload || !payload.email) {
      console.log('Invalid payload or missing email');
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    console.log('Looking for user with email:', payload.email);
    // Check if user exists
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      console.log('Creating new user for:', payload.email);
      // Create new user
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        passwordHash: 'google-oauth-user', // Placeholder for Google users
        role: 'user',
        memberSince: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        createdAt: new Date(),
      });
    } else {
      console.log('Found existing user:', user.email);
    }

    console.log('Generating JWT token for user:', user._id);
    // Generate JWT token
    const jwtToken = signToken(String(user._id), user.role);
    
    console.log('Google authentication successful for:', payload.email);
    res.json({ 
      token: jwtToken, 
      user: userJson(user) 
    });
  } catch (e) {
    console.error('Google auth error details:', e);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ---------- Users (admin: all accounts with full details) ----------
app.get('/api/users', requireAdmin, async (_req, res) => {
  try {
    const list = await User.find().sort({ createdAt: -1 }).lean();
    res.json({
      users: list.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role || 'user',
        panelType: u.panelType || 'general',
        points: u.points || 0,
        surveysCompleted: u.surveysCompleted || 0,
        memberSince: u.memberSince || '',
        onboardingCompleted: Boolean(u.onboardingCompleted),
        employmentStatus: u.employmentStatus || '',
        industry: u.industry || '',
        roleTitle: u.roleTitle || '',
        department: u.department || '',
        country: u.country || '',
        revenue: u.revenue || '',
        area: u.area || '',
        city: u.city || '',
        pincode: u.pincode || '',
        rewardsRedeemed: u.rewardsRedeemed || 0,
        lastRedemption: u.lastRedemption || '',
        createdAt: u.createdAt,
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
    const rewards = await Reward.find().sort({ pointsCost: 1 });
    res.json({ rewards: rewards.map((r) => r.toJSON()) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load rewards' });
  }
});

app.post('/api/rewards/redeem', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { rewardId } = req.body as { rewardId?: string };
    if (!rewardId) {
      res.status(400).json({ error: 'Reward ID is required' });
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      res.status(404).json({ error: 'Reward not found' });
      return;
    }

    if (!reward.inStock) {
      res.status(400).json({ error: 'This reward is currently out of stock' });
      return;
    }

    // Minimum 5,000 points threshold to redeem
    if (user.points < 5000) {
      res.status(400).json({
        error: `Minimum 5,000 points required to redeem rewards. You currently have ${user.points.toLocaleString()} points (${(5000 - user.points).toLocaleString()} more points needed).`,
      });
      return;
    }

    if (user.points < reward.pointsCost) {
      res.status(400).json({
        error: `Insufficient points for this reward. Cost is ${reward.pointsCost.toLocaleString()} points, but you have ${user.points.toLocaleString()} points.`,
      });
      return;
    }

    // Deduct points and track redemption
    user.points -= reward.pointsCost;
    user.rewardsRedeemed = (user.rewardsRedeemed || 0) + 1;
    user.lastRedemption = reward.name;
    await user.save();

    await ActivityLog.create({
      message: `${user.name} redeemed reward: ${reward.name} for ${reward.pointsCost} points`,
      type: 'info',
    });

    res.json({
      success: true,
      message: `🎉 Successfully redeemed ${reward.name}! Your reward voucher details have been dispatched.`,
      user: userJson(user),
      reward: reward.toJSON(),
    });
  } catch (e) {
    console.error('Error redeeming reward:', e);
    res.status(500).json({ error: 'Failed to redeem reward' });
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

// ---------- Survey Session Register (Vendor Flow) ----------
app.post('/api/survey-session/register', async (req, res) => {
  try {
    const { surveyId, vendorId, uid } = req.body;
    if (!uid || !vendorId) {
      return res.status(400).json({ error: 'uid and vendorId are required' });
    }

    const cleanUid = String(uid).trim();
    const cleanVendorId = String(vendorId).trim();

    // Verify vendor
    let vendor: any = null;
    if (mongoose.Types.ObjectId.isValid(cleanVendorId)) {
      vendor = await Vendor.findById(cleanVendorId);
    }
    if (!vendor) {
      try {
        const { default: VendorLite } = await import('./vendor-lite/vendorModel.js');
        if (VendorLite && mongoose.Types.ObjectId.isValid(cleanVendorId)) {
          vendor = await VendorLite.findById(cleanVendorId);
        }
      } catch (err) {
        console.warn('VendorLite import/lookup error:', err);
      }
    }

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Try extracting actual project ID from the survey link or document
    let extractedPid: string | null = null;
    if (surveyId) {
      try {
        let sDoc: any = null;
        if (mongoose.Types.ObjectId.isValid(String(surveyId).trim())) {
          sDoc = await Survey.findById(surveyId);
        }
        if (!sDoc) {
          const { default: SurveyLite } = await import('./vendor-lite/surveyModel.js').catch(() => ({ default: null }));
          if (SurveyLite && mongoose.Types.ObjectId.isValid(String(surveyId).trim())) {
            sDoc = await SurveyLite.findById(surveyId);
          }
        }
        if (sDoc) {
          extractedPid = extractProjectIdFromUrl(sDoc.link || sDoc.externalLink) || sDoc.pid || null;
        }
      } catch (err) {
        console.warn('Error extracting project ID in session register:', err);
      }
    }

    // Upsert session in SurveySession collection
    const session = await SurveySession.findOneAndUpdate(
      { identifier: cleanUid },
      {
        identifier: cleanUid,
        vendor_id: vendor._id,
        actual_user_id: cleanUid,
        survey_id: surveyId ? String(surveyId).trim() : null,
        project_id: extractedPid,
        base_url: 'vendor_flow',
        identifier_param_name: 'uid',
        created_at: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Registered vendor survey session: UID=${cleanUid}, Vendor=${vendor.name || vendor.vendor_name || vendor._id}, ProjectID=${extractedPid || 'N/A'}`);
    res.json({ success: true, session, projectId: extractedPid });
  } catch (e) {
    console.error('Failed to register survey session:', e);
    res.status(500).json({ error: 'Failed to register survey session' });
  }
});

// ---------- Survey Redirect Tracking ----------
app.get('/api/redirect', async (req, res) => {
  try {
    // 🔥 STEP 1: IDENTIFY PARAMS - Handle pid, projectid, projectId, project_id, survey_id, uid, user_id, user, status
    const { pid, projectid, projectId, project_id, survey_id, surveyId, sid, project, uid, user_id, user, status } = req.query;
    const effectiveUid = String(uid || user_id || user || '').trim();
    const rawPid = String(pid || projectid || projectId || project_id || survey_id || surveyId || sid || project || '').trim();

    console.log("🔥 /api/redirect HIT ==========================================");
    console.log("   Incoming PID/ProjectID:", rawPid || "None provided");
    console.log("   UID:", effectiveUid);
    console.log("   Status:", status);
    console.log("   Request URL:", req.url);
    console.log("================================================================");

    // 🔥 VALIDATION: Reject if uid looks like an IP address
    const isIpAddress = (str: string) => {
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      return ipPattern.test(str);
    };

    if (effectiveUid && isIpAddress(effectiveUid)) {
      console.error("❌ INVALID UID: IP address detected instead of user ID:", effectiveUid);
      return res.status(400).json({
        success: false,
        error: 'Invalid uid parameter: IP address detected. Please provide a valid user ID.'
      });
    }

    // 🔥 STEP 2: LOOKUP SESSION - Find session by uid
    let surveySession: any = null;
    let vendor: any = null;

    if (effectiveUid) {
      try {
        console.log("🔍 STEP 2: Looking up survey session for uid:", effectiveUid);
        surveySession = await SurveySession.findOne({ identifier: effectiveUid })
          .populate('vendor_id')
          .exec();

        if (surveySession) {
          console.log("✅ STEP 2: Survey session FOUND");
          console.log("   - Session ID:", surveySession._id);
          console.log("   - Identifier:", surveySession.identifier);
          console.log("   - Vendor ID (from session):", surveySession.vendor_id?._id || surveySession.vendor_id);
          console.log("   - Actual User ID:", surveySession.actual_user_id);
          console.log("   - Survey ID:", surveySession.survey_id);
          console.log("   - Stored Project ID:", surveySession.project_id);

          vendor = surveySession.vendor_id;

          if (!vendor || (!vendor.complete_url && !vendor.redirectLinks?.complete)) {
            console.log("⚠️ Vendor not populated or missing URLs, trying VendorLite lookup...");
            try {
              const { default: VendorLite } = await import('./vendor-lite/vendorModel.js');
              const vendorLite = await VendorLite.findById(surveySession.vendor_id);
              if (vendorLite) {
                console.log("✅ Found vendor in VendorLite collection");
                vendor = vendorLite;
              }
            } catch (vendorLookupError) {
              const error = vendorLookupError as Error;
              console.error("❌ Error looking up VendorLite:", error.message);
            }
          }
        } else {
          // Fallback: Check Response collection for previous vendor submission
          const lastResponse: any = await Response.findOne({
            userId: effectiveUid,
            vendorId: { $exists: true, $ne: null }
          }).sort({ createdAt: -1 });

          if (lastResponse && lastResponse.vendorId) {
            console.log("✅ Found vendor via recent Response record:", lastResponse.vendorId);
            if (mongoose.Types.ObjectId.isValid(lastResponse.vendorId)) {
              vendor = await Vendor.findById(lastResponse.vendorId);
              if (!vendor) {
                const { default: VendorLite } = await import('./vendor-lite/vendorModel.js').catch(() => ({ default: null }));
                if (VendorLite) vendor = await VendorLite.findById(lastResponse.vendorId);
              }
            }
            if (vendor) {
              surveySession = {
                actual_user_id: effectiveUid,
                vendor_id: vendor._id,
                identifier: effectiveUid
              };
            }
          }
        }
      } catch (sessionError) {
        console.error("❌ Error looking up survey session:", sessionError);
      }
    } else {
      console.log("⚠️ STEP 2: No uid provided");
    }

    // Determine the most accurate Project ID / PID
    let resolvedPid = (rawPid && !rawPid.startsWith('AUTO_')) ? rawPid : '';
    if (!resolvedPid && surveySession) {
      if (surveySession.project_id) {
        resolvedPid = surveySession.project_id;
      } else if (surveySession.survey_id) {
        try {
          let sDoc: any = null;
          if (mongoose.Types.ObjectId.isValid(surveySession.survey_id)) {
            sDoc = await Survey.findById(surveySession.survey_id);
          }
          if (!sDoc) {
            const { default: SurveyLite } = await import('./vendor-lite/surveyModel.js').catch(() => ({ default: null }));
            if (SurveyLite && mongoose.Types.ObjectId.isValid(surveySession.survey_id)) {
              sDoc = await SurveyLite.findById(surveySession.survey_id);
            }
          }
          if (sDoc) {
            resolvedPid = extractProjectIdFromUrl(sDoc.link || sDoc.externalLink) || sDoc.pid || '';
          }
        } catch (e) {
          console.warn("Survey PID lookup error:", e);
        }
      }
    }
    const finalPid = resolvedPid || (rawPid ? rawPid : "AUTO_" + Date.now());

    // If survey session found, handle vendor redirect
    if (surveySession && vendor) {
      const statusCode = Number(status) || 1;

      console.log("📋 STEP 3: Vendor data loaded");
      console.log("   - Vendor ID:", vendor?._id || vendor?.id);
      console.log("   - Final PID:", finalPid);
      console.log("   - Has Complete URL:", !!(vendor?.complete_url || vendor?.redirectLinks?.complete));
      console.log("   - Has Terminate URL:", !!(vendor?.terminate_url || vendor?.redirectLinks?.terminate));
      console.log("   - Has Quota URL:", !!(vendor?.quota_full_url || vendor?.redirectLinks?.quotaFull));

      let vendorUrl = "";
      if (statusCode === 1) {
        vendorUrl = vendor.complete_url || vendor.redirectLinks?.complete || "";
        console.log(`🎯 Status 1 (Complete): URL = ${vendorUrl || "NOT FOUND"}`);
      } else if (statusCode === 2) {
        vendorUrl = vendor.terminate_url || vendor.redirectLinks?.terminate || "";
        console.log(`🎯 Status 2 (Terminate): URL = ${vendorUrl || "NOT FOUND"}`);
      } else if (statusCode === 3) {
        vendorUrl = vendor.quota_full_url || vendor.redirectLinks?.quotaFull || "";
        console.log(`🎯 Status 3 (Quota Full): URL = ${vendorUrl || "NOT FOUND"}`);
      } else if (statusCode === 4) {
        vendorUrl = vendor.terminate_url || vendor.redirectLinks?.terminate || "";
        console.log(`🎯 Status 4 (Security): URL = ${vendorUrl || "NOT FOUND"}`);
      }

      if (vendorUrl) {
        let finalVendorUrl = vendorUrl.trim();
        const userPlaceholderRegex = /\[(identifier|uid|user_id|userid|id|rid|respid|click_id|clickid|respondent_id|value)\]|\{(identifier|uid|user_id|userid|id|rid|respid|click_id|clickid|respondent_id|value)\}|###(UID|USER_ID|IDENTIFIER|RID)###|%%(UID|USER_ID|IDENTIFIER|RID)%%/gi;
        const pidPlaceholderRegex = /\[(pid|projectid|project_id)\]|\{(pid|projectid|project_id)\}|\[#pid#\]|\[#PID#\]|###(PID|PROJECTID)###|%%(PID|PROJECTID)%%/gi;
        
        let hadUserPlaceholder = false;
        if (userPlaceholderRegex.test(finalVendorUrl)) {
          hadUserPlaceholder = true;
          finalVendorUrl = finalVendorUrl.replace(userPlaceholderRegex, encodeURIComponent(String(surveySession.actual_user_id)));
        }

        if (pidPlaceholderRegex.test(finalVendorUrl)) {
          finalVendorUrl = finalVendorUrl.replace(pidPlaceholderRegex, encodeURIComponent(finalPid));
        }

        try {
          const parsed = new URL(finalVendorUrl);
          const targetUserKeys = ['uid', 'user_id', 'userid', 'rid', 'respid', 'id', 'user'];
          let foundUserKey = false;
          for (const k of targetUserKeys) {
            if (parsed.searchParams.has(k)) {
              foundUserKey = true;
              const cur = parsed.searchParams.get(k) || '';
              if (!cur || cur === String(surveySession.actual_user_id) || /^(\[.*\]|\{.*\}|###.*###|%%.*%%|XXXXX?)$/i.test(cur) || !hadUserPlaceholder) {
                parsed.searchParams.set(k, String(surveySession.actual_user_id));
              } else {
                parsed.searchParams.set(k, cur);
              }
            }
          }
          if (!foundUserKey && !hadUserPlaceholder) {
            parsed.searchParams.set('uid', String(surveySession.actual_user_id));
          }

          const targetPidKeys = ['pid', 'projectid', 'project_id'];
          for (const k of targetPidKeys) {
            if (parsed.searchParams.has(k)) {
              const cur = parsed.searchParams.get(k) || '';
              if (!cur || /^(\[.*\]|\{.*\}|###.*###|%%.*%%|AUTO_.*|XXXXX?)$/i.test(cur)) {
                parsed.searchParams.set(k, finalPid);
              }
            }
          }

          finalVendorUrl = parsed.toString();
        } catch {
          if (!hadUserPlaceholder) {
            finalVendorUrl = finalVendorUrl.replace(/\[identifier\]/gi, String(surveySession.actual_user_id));
          }
        }

        console.log("🚀 Vendor redirect from session:", {
          statusCode,
          vendorId: vendor?._id || vendor?.id,
          actualUserId: surveySession.actual_user_id,
          pid: finalPid,
          finalRedirectUrl: finalVendorUrl,
          source: 'survey_session'
        });

        // Non-blocking log creation with accurate PID
        const statusMap: Record<string, string> = {
          "1": "Completed",
          "2": "Terminated",
          "3": "Quota Full",
          "4": "Security Terminated"
        };
        SurveyRedirectLogs.create({
          pid: finalPid,
          uid: String(surveySession.actual_user_id),
          status: statusCode,
          statusText: statusMap[String(statusCode)] || "Unknown",
          ipAddress: req.ip || req.socket.remoteAddress || "0.0.0.0",
          userAgent: req.get('User-Agent') || "Unknown"
        }).catch(err => console.error("Error creating redirect log:", err));

        // For AJAX requests, return JSON
        if (req.get('Accept')?.includes('application/json')) {
          return res.json({
            success: true,
            pid: finalPid,
            redirectUrl: finalVendorUrl,
            hasVendorRedirect: true,
            source: 'survey_session'
          });
        }

        // For regular browser requests, redirect directly to vendor
        return res.redirect(finalVendorUrl);
      }
    }

    // 🔥 STEP 6: FALLBACK - If no vendor session found, return hasVendorRedirect: false for AJAX
    console.log("⚠️ No survey session found for vendor redirect");

    if (req.get('Accept')?.includes('application/json')) {
      return res.json({
        success: true,
        pid: finalPid,
        hasVendorRedirect: false,
        message: 'No vendor redirect configured for this user'
      });
    }

    const BASE_URL = "https://surveypanelgo.netlify.app";

    if (!effectiveUid || !status) {
      return res.redirect(`${BASE_URL}/error`);
    }

    const statusCode = Number(status) || 1;
    const statusMap: Record<string, string> = {
      "1": "Completed",
      "2": "Terminated",
      "3": "Quota Full",
      "4": "Security Terminated"
    };

    const statusText = statusMap[String(statusCode)] || "Unknown";
    const rawIp = req.headers["x-forwarded-for"] as string;
    const ip = rawIp
      ? rawIp.split(",")[0].trim()
      : req.socket.remoteAddress || "Unknown";
    const timestamp = new Date().toISOString();

    SurveyRedirectLogs.create({
      pid: finalPid,
      uid: effectiveUid,
      status: statusCode,
      statusText: statusText,
      ipAddress: ip,
      userAgent: req.get('User-Agent') || "Unknown"
    }).catch(err => console.error("Error creating redirect log:", err));

    // Check for external survey mapping to enable auto-forwarding to vendors
    let vendorRedirectUrl = "";
    try {
      const { findTokenByUid, loadSurveys } = await import('./externalCreate.js');
      const token = await findTokenByUid(effectiveUid);
      const fallbackToken = await (async () => {
        if (!token) {
          const { findTokenByRid } = await import('./externalCreate.js');
          return findTokenByRid(effectiveUid);
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
          else if (statusCode === 4) vendorUrl = survey.vendor.terminate_url;

          if (vendorUrl) {
            vendorRedirectUrl = vendorUrl.trim();
            const placeholderRegex = /\[(identifier|uid|user_id|userid|id|rid|respid|click_id|clickid|pid|respondent_id|value)\]|\{(identifier|uid|user_id|userid|id|rid|respid|click_id|clickid|pid|respondent_id|value)\}|###(UID|USER_ID|IDENTIFIER|RID)###|%%(UID|USER_ID|IDENTIFIER|RID)%%/gi;
            if (placeholderRegex.test(vendorRedirectUrl)) {
              vendorRedirectUrl = vendorRedirectUrl.replace(placeholderRegex, encodeURIComponent(effectiveUid));
            } else {
              const sep = vendorRedirectUrl.includes("?") ? "&" : "?";
              vendorRedirectUrl = `${vendorRedirectUrl}${sep}uid=${encodeURIComponent(effectiveUid)}`;
            }
            console.log(`🔥 Found vendor redirect for UID ${effectiveUid}: ${vendorRedirectUrl}`);
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
        redirectUrl: vendorRedirectUrl || undefined,
        hasVendorRedirect: !!vendorRedirectUrl
      });
    }

    // For regular browser requests
    if (vendorRedirectUrl) {
      return res.redirect(vendorRedirectUrl);
    }

    const redirectPages: Record<number, string> = {
      1: `/survey-result/success?pid=${finalPid}&uid=${encodeURIComponent(effectiveUid)}&status=1&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`,
      2: `/survey-result/terminated?pid=${finalPid}&uid=${encodeURIComponent(effectiveUid)}&status=2&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`,
      3: `/survey-result/quota-full?pid=${finalPid}&uid=${encodeURIComponent(effectiveUid)}&status=3&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`,
      4: `/survey-result/security?pid=${finalPid}&uid=${encodeURIComponent(effectiveUid)}&status=4&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(timestamp)}`
    };

    const finalPath = redirectPages[statusCode] || redirectPages[2];
    const finalUrl = `${BASE_URL}${finalPath}`;

    console.log("🚀 Redirecting to frontend result:", finalUrl);
    return res.redirect(finalUrl);

  } catch (error) {
    console.error("❌ REDIRECT CRASH:", error);
    console.error("   Error message:", error.message);
    console.error("   Stack trace:", error.stack);
    console.error("   Request URL:", req.url);
    console.error("   Query params:", req.query);
    
    const fallback = "https://surveypanelgo.netlify.app";
    // For AJAX requests, return JSON error
    if (req.get('Accept')?.includes('application/json')) {
      return res.status(500).json({ 
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (pid) filter.pid = String(pid).trim();
    if (status && !isNaN(parseInt(status as string))) {
      filter.status = parseInt(status as string);
    }

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
      const dateFilter: any = {};
      if (startDate) {
        const start = new Date(startDate as string);
        if (!isNaN(start.getTime())) {
          dateFilter.$gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate as string);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          dateFilter.$lte = end;
        }
      }
      if (Object.keys(dateFilter).length > 0) {
        filter.createdAt = dateFilter;
      }
    }

    // Use aggregation pipeline for efficient deduplication and pagination at database level
    const pipeline: any[] = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$uid',
          doc: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$doc' }
      },
      { $sort: { createdAt: -1 } } // Re-sort after grouping to maintain date order
    ];

    // Get total count of unique records for pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await SurveyRedirectLogs.aggregate(countPipeline);
    const totalUnique = countResult[0]?.total || 0;

    // Add pagination to main pipeline
    pipeline.push(
      { $skip: skip },
      { $limit: limitNum }
    );

    // Execute aggregation
    const paginatedLogs = await SurveyRedirectLogs.aggregate(pipeline);

    // Calculate status counts from all unique records (using aggregation)
    const statusCountPipeline = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { uid: '$uid', status: '$status' },
          doc: { $first: '$$ROOT' }
        }
      },
      {
        $group: {
          _id: '$_id.status',
          count: { $sum: 1 }
        }
      }
    ];
    const statusCountResult = await SurveyRedirectLogs.aggregate(statusCountPipeline);
    const uniqueStatusCounts = statusCountResult.reduce((acc, item) => {
      if (item && item._id !== undefined) {
        acc[item._id] = item.count;
      }
      return acc;
    }, {} as Record<number, number>);

    res.json({
      logs: (paginatedLogs || []).map(log => ({
        ...log,
        id: log._id,
        _id: undefined
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalUnique,
        pages: Math.max(1, Math.ceil(totalUnique / limitNum))
      },
      statusCounts: uniqueStatusCounts
    });
  } catch (e) {
    console.error('Failed to load redirect logs:', e);
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
