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

        // Detect parameter names from externalUrl if possible
        let customParams = "";
        try {
            const parsedUrl = new URL(externalUrl);
            parsedUrl.searchParams.forEach((val, key) => {
                if (val === "[#userid#]") {
                    customParams += `&${key}=[USER_ID]`;
                } else if (val === "[#transaction_id#]") {
                    customParams += `&${key}=[TRANSACTION_ID]`;
                }
            });
        } catch (e) { }

        // Fallback to defaults if no placeholders detected
        if (!customParams.includes("[USER_ID]")) customParams += "&rid=[USER_ID]";
        if (!customParams.includes("[TRANSACTION_ID]")) customParams += "&transactionId=[TRANSACTION_ID]";

        const link = `${baseUrl}/external/router?token=${token}${customParams}`;

        console.log('✅ External Survey Persisted:', { title, token, link });

        return res.json({ success: true, token, link });
    } catch (err) {
        console.error('External Create Error:', err);
        return res.status(500).json({ success: false });
    }
});

/**
 * Retry mechanism for finding surveys during cold start
 */
async function findSurveyWithRetry(token: string, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        const surveys = loadSurveys();
        const survey = surveys[token];

        if (survey) return survey;

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
}

// ---------------------------------------------------------------------------
// GET /external/router
// ---------------------------------------------------------------------------
router.get('/external/router', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send("Missing parameter: token is required");
        }

        // Find external survey using token with retry logic
        const survey = await findSurveyWithRetry(token as string);

        if (!survey) {
            return res.status(404).send("Survey not found");
        }

        // Extract effective identification from incoming query params by structure matching
        let rid = req.query.rid;
        let transactionId = req.query.transactionId;

        try {
            const parsedExt = new URL(survey.externalUrl);
            parsedExt.searchParams.forEach((val, key) => {
                const incomingVal = req.query[key];
                if (incomingVal) {
                    if (val === "[#userid#]") rid = incomingVal;
                    else if (val === "[#transaction_id#]") transactionId = incomingVal;
                }
            });
        } catch (e) { }

        if (!rid || !transactionId) {
            return res.status(400).send("Missing identification parameters: rid or transactionId equivalent required");
        }

        // Get stored external URL
        let finalUrl = survey.externalUrl;

        // Replace placeholders
        finalUrl = finalUrl.replace('[#transaction_id#]', transactionId as string);
        finalUrl = finalUrl.replace('[#userid#]', rid as string);

        // Store mapping for late interception (if panel redirects to default routes)
        ridToTokenMap[String(rid)] = String(token);

        // Immediately redirect to final external URL
        return res.redirect(finalUrl);
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
