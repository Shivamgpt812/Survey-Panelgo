/**
 * externalCreate.ts
 *
 * Standalone Express router for external survey creation and router logic.
 * Mounted in index.ts at app.use('/', externalRouter).
 *
 * Routes:
 *   POST /external/create         – create an external survey token (stores in memory)
 *   GET  /external/router         – redirect respondent to vendor-lite with params
 *   GET  /external/data/:token    – return stored survey data (externalUrl + questions)
 */

import express from 'express';

const router = express.Router();

// ---------------------------------------------------------------------------
// In-memory store for external surveys
// (survives server lifetime; restarts clear it — acceptable for prototype)
// ---------------------------------------------------------------------------
const externalSurveys: Record<string, {
    title: string;
    externalUrl: string;
    questions: { text: string }[];
}> = {};

// ---------------------------------------------------------------------------
// POST /external/create
// Body: { title, externalUrl, questions }
// ---------------------------------------------------------------------------
router.post('/external/create', (req, res) => {
    try {
        const { title, externalUrl, questions } = req.body as {
            title?: string;
            externalUrl?: string;
            questions?: { text: string }[];
        };

        if (!externalUrl) {
            return res.status(400).json({ success: false, message: 'externalUrl is required' });
        }

        // Generate a short unique token
        const token =
            Math.random().toString(36).substring(2, 10) +
            Math.random().toString(36).substring(2, 6);

        // Persist survey in memory
        externalSurveys[token] = {
            title: title || 'External Survey',
            externalUrl,
            questions: Array.isArray(questions) ? questions : [],
        };

        const baseUrl = process.env.BACKEND_URL || 'https://survey-panelgo.onrender.com';
        const link = `${baseUrl}/external/router?token=${token}`;

        console.log('✅ External Survey Created:', { title, externalUrl, token, link });

        return res.json({ success: true, token, link });
    } catch (err) {
        console.error('External Create Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ---------------------------------------------------------------------------
// GET /external/router
// Query: { token, rid, transactionId }
// Redirects respondent to vendor-lite in external mode
// ---------------------------------------------------------------------------
router.get('/external/router', (req, res) => {
    try {
        const { rid, transactionId, token } = req.query;

        const frontendBase = process.env.FRONTEND_URL || 'https://surveypanelgo.netlify.app';

        const params = new URLSearchParams();
        params.set('mode', 'external');
        if (rid) params.set('rid', String(rid));
        if (transactionId) params.set('transactionId', String(transactionId));
        if (token) params.set('token', String(token));

        const frontendUrl = `${frontendBase}/vendor-lite?${params.toString()}`;

        console.log('🔀 External Router Redirect:', { rid, transactionId, token, frontendUrl });

        return res.redirect(frontendUrl);
    } catch (err) {
        console.error('External Router Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ---------------------------------------------------------------------------
// GET /external/data/:token
// Returns stored survey data so the frontend can render prescreener questions
// ---------------------------------------------------------------------------
router.get('/external/data/:token', (req, res) => {
    const survey = externalSurveys[req.params.token];

    if (!survey) {
        return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    return res.json({ success: true, survey });
});

export default router;
