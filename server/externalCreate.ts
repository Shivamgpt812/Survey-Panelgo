/**
 * externalCreate.ts
 *
 * Persisted Express router for external survey creation and return flow.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// ── Shared Mapping for Intercepting Defaults ─────────────────────────────────
// OpinionSpark and other panels sometimes ignore return parameters and hit
// default internal routes. We map rid -> token here to find the right vendor url.
export const ridToTokenMap: Record<string, string> = {};
export const findTokenByRid = (rid: string) => ridToTokenMap[rid];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "externalSurveys.json");

/**
 * Load persisted survey data
 */
export const loadSurveys = () => {
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

        surveys[token] = {
            title: title || 'External Survey',
            externalUrl,
            questions: Array.isArray(questions) ? questions : [],
            vendor
        };

        saveSurveys(surveys);

        const baseUrl = process.env.BACKEND_URL || 'https://survey-panelgo.onrender.com';
        const link = `${baseUrl}/external/router?token=${token}&rid=[USER_ID]&transactionId=[TRANSACTION_ID]`;

        console.log('✅ External Survey Persisted:', { title, token, link });

        return res.json({ success: true, token, link });
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

        // Store mapping for late interception (if panel redirects to default routes)
        ridToTokenMap[String(rid)] = String(token);

        const redirectUrl = `${frontendBase}/vendor-lite?${params.toString()}`;

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
        return res.status(500).json({ success: false });
    }
});

// ---------------------------------------------------------------------------
// GET /external/redirect/:status
// ---------------------------------------------------------------------------
router.get("/external/redirect/:status", (req, res) => {
    try {
        const { status } = req.params;
        const { rid, token, transactionId } = req.query;

        console.log("🔥 EXTERNAL RETURN HIT:", { status, rid, token });

        const surveys = loadSurveys();
        const survey = surveys[token as string];

        if (!survey) {
            return res.status(404).send("Invalid survey token or token expired");
        }

        let redirectUrl = "";

        if (status === "complete") {
            redirectUrl = survey.vendor.complete_url;
        } else if (status === "terminate") {
            redirectUrl = survey.vendor.terminate_url;
        } else if (status === "quota") {
            redirectUrl = survey.vendor.quota_full_url;
        }

        if (!redirectUrl) {
            return res.send("Invalid status or redirect configuration missing");
        }

        const sep = redirectUrl.includes("?") ? "&" : "?";
        const finalUrl = `${redirectUrl}${sep}rid=${rid}&transactionId=${transactionId}`;

        console.log("✅ FINAL EXTERNAL REDIRECT TO VENDOR:", finalUrl);

        res.redirect(finalUrl);

    } catch (err) {
        console.error("Return Error:", err);
        res.status(500).send("Error in return handler");
    }
});

export default router;
