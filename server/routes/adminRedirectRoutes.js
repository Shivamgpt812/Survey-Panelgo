const express = require('express');
const RedirectLog = require('../models/RedirectLog');
const router = express.Router();

// Status labels for display
const statusLabels = {
  1: 'Completed',
  2: 'Terminated',
  3: 'Quota Full',
  4: 'Security Terminated'
};

// GET /admin/redirect-logs - Get all redirect logs with filtering
router.get('/redirect-logs', async (req, res) => {
  try {
    const {
      status,
      pid,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build query filter
    const filter = {};
    
    if (status) {
      filter.status = parseInt(status);
    }
    
    if (pid) {
      filter.pid = pid;
    }
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const total = await RedirectLog.countDocuments(filter);
    
    // Get logs with pagination
    const logs = await RedirectLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get status counts for stats
    const statusCounts = await RedirectLog.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      logs: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Get redirect logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /admin/redirect-stats - Get redirect statistics
router.get('/redirect-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
    }

    // Get overall statistics
    const stats = await RedirectLog.aggregate([
      {
        $match: dateFilter
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: '$count' },
          completedCount: {
            $sum: { $cond: { if: { $eq: ['$status', 1] }, then: '$count', else: 0 } }
          },
          terminatedCount: {
            $sum: { $cond: { if: { $eq: ['$status', 2] }, then: '$count', else: 0 } }
          },
          quotafullCount: {
            $sum: { $cond: { if: { $eq: ['$status', 3] }, then: '$count', else: 0 } }
          },
          securityCount: {
            $sum: { $cond: { if: { $eq: ['$status', 4] }, then: '$count', else: 0 } }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalClicks: 0,
      completedCount: 0,
      terminatedCount: 0,
      quotafullCount: 0,
      securityCount: 0
    };

    res.json({
      success: true,
      ...result,
      statusLabels
    });

  } catch (error) {
    console.error('Get redirect stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
