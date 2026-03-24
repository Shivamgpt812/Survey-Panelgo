const express = require('express');
const RedirectLog = require('../models/RedirectLog');
const router = express.Router();

// Status mapping
const statusMap = {
  'complete': 1,
  'terminate': 2,
  'quotafull': 3,
  'security': 4
};

const statusLabels = {
  1: 'Completed',
  2: 'Terminated',
  3: 'Quota Full',
  4: 'Security Terminated'
};

// Anti-spam: Check for duplicate within last 5 seconds
const checkForSpam = async (pid, uid, ip) => {
  try {
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const existingLog = await RedirectLog.findOne({
      pid: pid,
      uid: uid,
      ip: ip,
      timestamp: { $gte: fiveSecondsAgo }
    });
    return !!existingLog;
  } catch (error) {
    console.error('Spam check error:', error);
    return false;
  }
};

// Main redirect route
router.get('/:type?', async (req, res) => {
  try {
    // Extract query parameters
    const { pid, uid, status } = req.query;
    const { type } = req.params;

    // Validate required parameters
    if (!pid || !uid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: pid and uid'
      });
    }

    // Determine status
    let finalStatus = 1; // default to completed
    if (status) {
      finalStatus = parseInt(status);
    } else if (type) {
      finalStatus = statusMap[type.toLowerCase()] || 1;
    }

    // Capture IP and User Agent
    const ip = req.headers["x-forwarded-for"]?.split(',')[0]?.trim() || 
                req.socket.remoteAddress || 
                'Unknown';
    
    const userAgent = req.headers["user-agent"] || 'Unknown';

    // Anti-spam check
    const isSpam = await checkForSpam(pid, uid, ip);
    if (isSpam) {
      console.log('Spam detected - skipping save:', { pid, uid, ip });
    } else {
      // Save to database
      const redirectLog = new RedirectLog({
        pid: pid,
        uid: uid,
        status: finalStatus,
        ip: ip,
        userAgent: userAgent,
        timestamp: new Date()
      });

      await redirectLog.save();
      console.log('Redirect log saved:', { pid, uid, status: finalStatus, ip });
    }

    // Get redirect target URL from environment or use fallback
    const redirectUrl = process.env.REDIRECT_TARGET_URL || 'https://surveypanelgo.netlify.app';
    const finalUrl = `${redirectUrl}/survey-result/success?pid=${pid}&uid=${uid}&status=${finalStatus}&ip=${encodeURIComponent(ip)}&time=${encodeURIComponent(new Date().toISOString())}`;

    // Redirect user
    res.redirect(finalUrl);

  } catch (error) {
    console.error('Redirect route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
