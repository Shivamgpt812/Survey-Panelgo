const mongoose = require('mongoose');

const redirectLogSchema = new mongoose.Schema({
  pid: {
    type: String,
    required: true,
    trim: true
  },
  uid: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4], // 1=complete, 2=terminate, 3=quotafull, 4=security
    default: 1
  },
  ip: {
    type: String,
    required: true,
    trim: true
  },
  userAgent: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
redirectLogSchema.index({ pid: 1, uid: 1 });
redirectLogSchema.index({ status: 1 });
redirectLogSchema.index({ timestamp: -1 });
redirectLogSchema.index({ ip: 1 });

module.exports = mongoose.model('RedirectLog', redirectLogSchema);
