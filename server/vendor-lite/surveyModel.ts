import mongoose, { Schema, Document } from 'mongoose';
import IVendor from './vendorModel.js';

export interface IVendorSurvey extends Document {
  title: string;
  token: string;
  pid: string;
  vendor_id: mongoose.Types.ObjectId;
  preScreenerQuestions: Array<{
    type: string;
    question: string;
    operator: string;
    value: any;
    options?: string[];
    enabled: boolean;
  }>;
  questions: Array<{
    text: string;
    options: string[];
    type: 'multiple-choice' | 'rating' | 'text';
  }>;
  created_at: Date;
  updated_at: Date;
}

const VendorSurveySchema = new Schema<IVendorSurvey>({
  title: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  pid: {
    type: String,
    required: true,
  },
  preScreenerQuestions: [{
    type: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    options: [String],
    enabled: {
      type: Boolean,
      required: true,
    }
  }],
  vendor_id: {
    type: Schema.Types.ObjectId,
    ref: 'VendorLite',
    required: true,
  },
  questions: [{
    text: {
      type: String,
      required: true,
    },
    options: [{
      type: String,
      required: true,
    }],
    type: {
      type: String,
      required: true,
      enum: ['multiple-choice', 'rating', 'text']
    }
  }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'vendor_lite_surveys'
});

export default mongoose.model<IVendorSurvey>('VendorLiteSurvey', VendorSurveySchema);
