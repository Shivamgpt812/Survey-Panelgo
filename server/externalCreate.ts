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
        const { title, externalUrl, pid, questions, vendor } = req.body;

        if (!externalUrl) {
            return res.status(400).json({ success: false, message: 'externalUrl is required' });
        }

        const token = Math.random().toString(36).substring(2, 10);

        const surveys = loadSurveys();

        surveys[token] = {
            title: title || 'External Survey',
            externalUrl,
            pid,
            questions: Array.isArray(questions) ? questions : [],
            vendor
        };

        saveSurveys(surveys);

        // Dynamic backend URL detection
        const host = req.get('host');
        const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
        const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;

        const link = `${baseUrl}/external/router?token=${token}&rid=[USER_ID]&transactionId=[TRANSACTION_ID]`;

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
        const { rid, transactionId, token } = req.query;

        if (!rid || !transactionId || !token) {
            return res.status(400).send("Missing parameters: rid, transactionId, and token are required");
        }

        // Find external survey using token with retry logic
        const survey = await findSurveyWithRetry(token as string);

        if (!survey) {
            console.error(`❌ Survey not found for token: ${token}`);
            return res.status(404).send("Survey not found");
        }

        // Check if survey has prescreener questions
        if (Array.isArray(survey.questions) && survey.questions.length > 0) {
            // Dynamic frontend URL detection
            let frontendBase = process.env.FRONTEND_URL;
            if (!frontendBase) {
                // Heuristic for local vs prod
                const backendHost = req.get('host') || "";
                if (backendHost.includes('localhost') || backendHost.includes('127.0.0.1')) {
                    frontendBase = "http://localhost:5173";
                } else {
                    // Use Netlify or production domain
                    frontendBase = "https://surveypanelgo.netlify.app";
                }
            }

            const redirectUrl = `${frontendBase}/vendor-lite?mode=external&token=${token}&rid=${rid}&transactionId=${transactionId}`;
            console.log(`🚀 Redirecting to Frontend Prescreener: ${redirectUrl}`);
            return res.redirect(redirectUrl);
        }

        // Get stored external URL
        let finalUrl = survey.externalUrl;

        // Replace placeholders
        finalUrl = finalUrl.replace('[#transaction_id#]', transactionId as string);
        finalUrl = finalUrl.replace('[#userid#]', rid as string);

        // Store mapping for late interception (if panel redirects to default routes)
        ridToTokenMap[String(rid)] = String(token);

        // Immediately redirect to final external URL
        console.log(`🚀 Redirecting directly to External Survey: ${finalUrl}`);
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

        // --- PUNCH INTO REDIRECT ANALYSIS (Analysis Dashboard) ---
        const statusCode = status === "complete" ? 1 : status === "terminate" ? 2 : status === "quota" ? 3 : 0;
        const statusMap: Record<number, string> = { 1: "Completed", 2: "Terminated", 3: "Quota Full" };

        try {
            const { SurveyRedirectLogs } = await import("./models/SurveyRedirectLogs.js");
            SurveyRedirectLogs.create({
                pid: survey.pid || `EXT_${token}`,
                uid: String(rid), // UID now strictly contains the value of RID as requested
                status: statusCode,
                statusText: statusMap[statusCode] || "Unknown",
                ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress,
                userAgent: req.headers["user-agent"],
                createdAt: new Date()
            }).catch(e => console.error("❌ External log background error:", e));
        } catch (e) {
            console.error("❌ Problem recording external log:", e);
        }
        // ---------------------------------------------------------

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
