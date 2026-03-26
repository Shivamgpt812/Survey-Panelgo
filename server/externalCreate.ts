/**
 * externalCreate.ts
 *
 * Persisted Express router for external survey creation and return flow.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Response as ResponseModel } from './models/Response.js';

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
        const { title, externalUrl, questions, vendor, projectId } = req.body;

        if (!externalUrl) {
            return res.status(400).json({ success: false, message: 'externalUrl is required' });
        }

        const token = Math.random().toString(36).substring(2, 10);

        const surveys = loadSurveys();

        surveys[token] = {
            title: title || 'External Survey',
            externalUrl,
            questions: Array.isArray(questions) ? questions : [],
            vendor,
            projectId: projectId || 'EXT_' + Date.now()
        };

        saveSurveys(surveys);

        const baseUrl = process.env.BACKEND_URL || 'https://survey-panelgo.onrender.com';
        // Updated link format as per requirement
        const link = `${baseUrl}/external/start?projectId=${surveys[token].projectId}&vendorId=${vendor.id || vendor._id}`;

        console.log('✅ External Survey Persisted:', { title, token, link });

        return res.json({ success: true, token, link });
    } catch (err) {
        console.error('External Create Error:', err);
        return res.status(500).json({ success: false });
    }
});

// ---------------------------------------------------------------------------
// GET /external/start (New Requirement)
// ---------------------------------------------------------------------------
router.get('/external/start', (req, res) => {
    try {
        const { projectId, vendorId, transactionId, userid } = req.query;

        if (!projectId || !vendorId) {
            return res.status(400).send("Missing parameters: projectId and vendorId are required");
        }

        const surveys = loadSurveys();
        const token = Object.keys(surveys)
            .find(t => surveys[t].projectId === projectId &&
                (surveys[t].vendor?.id === vendorId || surveys[t].vendor?._id === vendorId));

        if (!token) {
            return res.status(404).send("Survey not found for this project and vendor");
        }

        // 🔥 Use dynamic origin or referer to support both netlify and custom domain
        let frontendBase = (req.headers.origin as string);
        if (!frontendBase && req.headers.referer) {
            const ref = req.headers.referer as string;
            if (ref.includes('surveypanelgo.netlify.app')) frontendBase = "https://surveypanelgo.netlify.app";
            else if (ref.includes('surveypanelgo.com')) frontendBase = "https://surveypanelgo.com";
        }
        if (!frontendBase) frontendBase = "https://surveypanelgo.com";

        const params = new URLSearchParams();
        params.set('mode', 'external');
        params.set('token', token);
        params.set('rid', String(userid || ''));
        params.set('transactionId', String(transactionId || ''));

        // Store mapping for late interception
        if (userid) ridToTokenMap[String(userid)] = token;

        const redirectUrl = `${frontendBase}/v/${token}?mode=external&rid=${userid || ''}&transactionId=${transactionId || ''}`;

        return res.redirect(redirectUrl);
    } catch (err) {
        console.error('External Start Error:', err);
        return res.status(500).send("Start error");
    }
});

// ---------------------------------------------------------------------------
// POST /api/external/punch (New Requirement for prescreener fail)
// ---------------------------------------------------------------------------
router.post('/api/external/punch', async (req, res) => {
    try {
        const { transactionId, userId, projectId, vendorId, status, token } = req.body;

        console.log("🥊 Punching Data Internally:", { transactionId, userId, projectId, vendorId, status });

        // Record response in DB
        await ResponseModel.create({
            surveyId: token || projectId || "UnknownExternal",
            vendorId: vendorId,
            userId: userId || transactionId,
            status: status === 'complete' ? 'complete' : (status === 'quota' ? 'quota_full' : 'terminate'),
            failureReason: status === 'terminate' ? 'Prescreener Failed' : undefined
        });

        return res.json({ success: true });
    } catch (err) {
        console.error("Punch Error:", err);
        return res.status(500).json({ success: false });
    }
});

// ---------------------------------------------------------------------------
// GET /external/router (Legacy Support)
// ---------------------------------------------------------------------------
router.get('/external/router', (req, res) => {
    try {
        const { rid, transactionId, token } = req.query;

        if (!rid || !transactionId || !token) {
            return res.status(400).send("Missing parameters: rid, transactionId, and token are required");
        }

        // 🔥 Use dynamic origin or referer to support both netlify and custom domain
        let frontendBase = (req.headers.origin as string);
        if (!frontendBase && req.headers.referer) {
            const ref = req.headers.referer as string;
            if (ref.includes('surveypanelgo.netlify.app')) frontendBase = "https://surveypanelgo.netlify.app";
            else if (ref.includes('surveypanelgo.com')) frontendBase = "https://surveypanelgo.com";
        }
        if (!frontendBase) frontendBase = "https://surveypanelgo.com";

        const params = new URLSearchParams();
        params.set('mode', 'external');
        params.set('rid', String(rid));
        params.set('transactionId', String(transactionId));
        params.set('token', String(token));

        // Store mapping for late interception (if panel redirects to default routes)
        ridToTokenMap[String(rid)] = String(token);

        // For legacy, we still go to vendor-lite but we could redirect to the new page too
        const redirectUrl = `${frontendBase}/v/${token}?${params.toString()}`;

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
router.get("/external/redirect/:status", async (req, res) => {
    try {
        const { status } = req.params;
        const { rid, token, transactionId } = req.query;

        console.log("🔥 EXTERNAL RETURN HIT:", { status, rid, token });

        const surveys = loadSurveys();
        const survey = surveys[token as string];

        if (!survey) {
            return res.status(404).send("Invalid survey token or token expired");
        }

        // 👉 Step 1: Punch data internally (New Requirement)
        try {
            await ResponseModel.create({
                surveyId: (token as string) || survey.projectId || "ExternalSurvey",
                vendorId: survey.vendor?.id || survey.vendor?._id,
                userId: (rid as string) || (transactionId as string),
                status: status === "complete" ? "complete" : (status === "quota" ? "quota_full" : "terminate")
            });
            console.log("✅ Internal Punch Successful");
        } catch (punchErr) {
            console.error("Internal Punch Failed:", punchErr);
        }

        // 👉 Step 2: Immediately redirect user to VENDOR redirect URL (Modified)
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
