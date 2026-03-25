/**
 * externalCreate.ts
 *
 * Standalone Express router for external survey creation and router logic.
 * Mounted in index.ts at app.use('/', externalRouter).
 *
 * Routes:
 *   POST /external/create         – create an external survey token (stores in memory)
 *   GET  /external/router         – redirect respondent to vendor-lite with params
 *   GET  /external/data/:token    – return stored survey data (externalUrl + questions + vendor)
 */

import express from 'express';

const router = express.Router();

// ---------------------------------------------------------------------------
// In-memory store for external surveys
// ---------------------------------------------------------------------------
const externalSurveys: Record<string, {
    title: string;
    externalUrl: string;
    questions: { text: string; correctAnswer: string }[];
    vendor: {
        id: string;
        name: string;
        complete_url: string;
        terminate_url: string;
        quota_full_url: string;
    };
}> = {};

// ---------------------------------------------------------------------------
// POST /external/create
// ---------------------------------------------------------------------------
router.post('/external/create', (req, res) => {
    try {
        const { title, externalUrl, questions, vendor } = req.body;

        if (!externalUrl) {
            return res.status(400).json({ success: false, message: 'externalUrl is required' });
        }

        const token = Math.random().toString(36).substring(2, 10);

        externalSurveys[token] = {
            title: title || 'External Survey',
            externalUrl,
            questions: Array.isArray(questions) ? questions : [],
            vendor
        };

        const baseUrl = process.env.BACKEND_URL || 'https://survey-panelgo.onrender.com';
        const link = `${baseUrl}/external/router?token=${token}`;

        console.log('✅ External Survey Created:', { title, externalUrl, token, link });

        return res.json({
            success: true,
            token,
            link
        });
    } catch (err) {
        console.error('External Create Error:', err);
        return res.status(500).json({ success: false });
    }
});

// ---------------------------------------------------------------------------
// GET /external/router
// Query: { rid, transactionId, token }
// ---------------------------------------------------------------------------
router.get('/external/router', (req, res) => {
    try {
        const { rid, transactionId, token } = req.query;

        if (!rid || !transactionId || !token) {
            return res.status(400).send("Missing parameters: rid, transactionId, and token are required");
        }

        const frontendBase = process.env.FRONTEND_URL || 'https://surveypanelgo.netlify.app';

        const params = new URLSearchParams();
        params.set('mode', 'external');
        params.set('rid', String(rid));
        params.set('transactionId', String(transactionId));
        params.set('token', String(token));

        const redirectUrl = `${frontendBase}/vendor-lite?${params.toString()}`;

        console.log('🔀 External Router Redirect:', { rid, transactionId, token, redirectUrl });

        return res.redirect(redirectUrl);
    } catch (err) {
        console.error('External Router Error:', err);
        return res.status(500).send("Router error");
    }
});

// ---------------------------------------------------------------------------
// GET /external/data/:token
// ---------------------------------------------------------------------------
router.get('/external/data/:token', (req, res) => {
    const survey = externalSurveys[req.params.token];

    if (!survey) {
        return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    return res.json({ success: true, survey });
});

export default router;
