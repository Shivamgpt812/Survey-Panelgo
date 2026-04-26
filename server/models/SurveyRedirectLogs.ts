import mongoose, { Schema, Document } from 'mongoose';

export interface ISurveyRedirectLogs extends Document {
  pid: string;
  uid: string;
  status: number;
  statusText: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SurveyRedirectLogsSchema.index({ pid: 1, uid: 1 });
SurveyRedirectLogsSchema.index({ status: 1 });
SurveyRedirectLogsSchema.index({ createdAt: -1 });
SurveyRedirectLogsSchema.index({ createdAt: -1, uid: 1 }); // Compound index for sort + group optimization

export const SurveyRedirectLogs = mongoose.model<ISurveyRedirectLogs>('SurveyRedirectLogs', SurveyRedirectLogsSchema);
