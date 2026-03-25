/**
 * externalCreate.ts
 *
 * Standalone Express router for external survey creation and router logic.
 * This file is NOT imported by index.ts.
 * Mount it independently if needed, or load via a dedicated loader.
 *
 * Routes provided:
 *   POST /external/create         – create an external survey link with a unique token
 *   GET  /external/router         – redirect incoming respondents to the frontend with their params
 */

import express from 'express';

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /external/create
// ---------------------------------------------------------------------------
router.post('/external/create', (req, res) => {
  try {
    const { title, externalUrl, vendor } = req.body;

    if (!title || !externalUrl) {
      return res.status(400).json({
        success: false,
        message: 'title and externalUrl are required',
      });
    }

    // Generate a short unique token for this survey link
    const token =
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 6);

    // Build the router URL that respondents will receive
    const baseUrl =
      process.env.BACKEND_URL || 'https://survey-panelgo.onrender.com';
    const link = `${baseUrl}/external/router?token=${token}`;

    console.log('✅ External Survey Created:', {
      title,
      externalUrl,
      vendor,
      token,
      link,
    });

    return res.json({
      success: true,
      link,
      token,
    });
  } catch (err) {
    console.error('External Create Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /external/router
// ---------------------------------------------------------------------------
// When a respondent clicks the distributed link they hit this endpoint.
// It appends their panel params (rid, transactionId) and bounces them to
// the vendor-lite public survey page in external mode.
router.get('/external/router', (req, res) => {
  try {
    const { rid, transactionId, token } = req.query;

    const frontendBase =
      process.env.FRONTEND_URL || 'https://surveypanelgo.netlify.app';

    const params = new URLSearchParams();
    params.set('mode', 'external');
    if (rid) params.set('rid', String(rid));
    if (transactionId) params.set('transactionId', String(transactionId));
    if (token) params.set('token', String(token));

    const frontendUrl = `${frontendBase}/vendor-lite?${params.toString()}`;

    console.log('🔀 External Router Redirect:', {
      rid,
      transactionId,
      token,
      frontendUrl,
    });

    return res.redirect(frontendUrl);
  } catch (err) {
    console.error('External Router Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
