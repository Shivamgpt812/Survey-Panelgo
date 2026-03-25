/**
 * externalCreate.ts
 *
 * Persisted Express router for external survey creation.
 * Stores data in externalSurveys.json to survive server restarts.
 *
 * Routes:
 *   POST /external/create         – preserve survey config + return router link
 *   GET  /external/router         – redirect respondent to frontend
 *   GET  /external/data/:token    – fetch preserved survey config
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// ---------------------------------------------------------------------------
// Persistence Setup (ESM compatible __dirname)
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "externalSurveys.json");

/**
 * Load persisted survey data
 */
const loadSurveys = () => {
    try {
        if (!fs.existsSync(filePath)) return {};
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data || "{}");
    } catch (err) {
        console.error("Failed to load surveys:", err);
        return {};
    }
};

/**
 * Persist survey data
 */
const saveSurveys = (data: any) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Failed to save surveys:", err);
    }
};

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

        const surveys = loadSurveys();

        // Persist survey definition
        surveys[token] = {
            title: title || 'External Survey',
            externalUrl,
            questions: Array.isArray(questions) ? questions : [],
            vendor
        };

        saveSurveys(surveys);

        const baseUrl = process.env.BACKEND_URL || 'https://survey-panelgo.onrender.com';
        // Link includes informative hints for vendor substitution
        const link = `${baseUrl}/external/router?token=${token}&rid=[USER_ID]&transactionId=[TRANSACTION_ID]`;

        console.log('✅ External Survey Persisted:', { title, token, link });

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
    try {
        const surveys = loadSurveys();
        const survey = surveys[req.params.token];

        if (!survey) {
            return res.status(404).json({ success: false, message: 'Survey not found' });
        }

        return res.json({ success: true, survey });
    } catch (err) {
        console.error('Data Fetch Error:', err);
        return res.status(500).json({ success: false });
    }
});

export default router;
