import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface ISurveyRedirectLogs extends Document {
  pid: string;
  uid: string;
  status: number;
  statusText: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  logHash?: string; // Add hash field for deduplication
}

export interface ISurveyRedirectLogsModel extends Model<ISurveyRedirectLogs> {
  generateLogHash(pid: string, uid: string, status: number, timeWindow?: number): string;
  createLog(logData: {
    pid: string;
    uid: string;
    status: number;
    statusText: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<ISurveyRedirectLogs | null>;
}

const SurveyRedirectLogsSchema: Schema = new Schema({
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
    min: 1,
    max: 4
  },
  statusText: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true
  },
  userAgent: {
    type: String,
    required: true,
    trim: true
  },
  logHash: {
    type: String,
    required: true,
    unique: true // Unique index based on hash
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to generate hash for deduplication
SurveyRedirectLogsSchema.statics.generateLogHash = function(pid: string, uid: string, status: number, timeWindow: number = 300) {
  // Create time window (5 minutes by default) to prevent exact duplicates
  const timeWindowMinutes = Math.floor(Date.now() / (timeWindow * 1000));
  const hashInput = `${pid}-${uid}-${status}-${timeWindowMinutes}`;
  return crypto.createHash('sha256').update(hashInput).digest('hex');
};

// Static method for atomic log creation with deduplication
SurveyRedirectLogsSchema.statics.createLog = async function(logData: {
  pid: string;
  uid: string;
  status: number;
  statusText: string;
  ipAddress: string;
  userAgent: string;
}) {
  const logHash = this.generateLogHash(logData.pid, logData.uid, logData.status);
  
  try {
    // Use findOneAndUpdate for atomic operation
    const log = await this.findOneAndUpdate(
      { logHash },
      { 
        $setOnInsert: {
          ...logData,
          logHash,
          createdAt: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        lean: true
      }
    );
    
    // If the log already existed, log a message for debugging
    if (!log.createdAt || (log.createdAt as Date).getTime() < Date.now() - 1000) {
      console.log("🔄 Duplicate redirect log prevented:", { 
        pid: logData.pid, 
        uid: logData.uid, 
        status: logData.status,
        hash: logHash.substring(0, 8) + "..."
      });
    } else {
      console.log("✅ New redirect log created:", { 
        pid: logData.pid, 
        uid: logData.uid, 
        status: logData.status 
      });
    }
    
    return log;
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      console.log("🔄 Duplicate redirect log prevented by unique constraint:", { 
        pid: logData.pid, 
        uid: logData.uid, 
        status: logData.status 
      });
      return null; // Return null for duplicates
    }
    throw error; // Re-throw other errors
  }
};

SurveyRedirectLogsSchema.index({ pid: 1, uid: 1 });
SurveyRedirectLogsSchema.index({ status: 1 });
SurveyRedirectLogsSchema.index({ createdAt: -1 });
SurveyRedirectLogsSchema.index({ logHash: 1 });

export const SurveyRedirectLogs = mongoose.model<ISurveyRedirectLogs, ISurveyRedirectLogsModel>('SurveyRedirectLogs', SurveyRedirectLogsSchema);
