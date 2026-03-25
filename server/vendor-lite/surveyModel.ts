import mongoose, { Schema, Document } from 'mongoose';
import IVendor from './vendorModel.js';

export interface IVendorSurvey extends Document {
  title: string;
  token: string;
  pid: string;
  vendor_id: mongoose.Types.ObjectId;
  questions: Array<{
    text: string;
    options: string[];
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
  }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'vendor_lite_surveys'
});

export default mongoose.model<IVendorSurvey>('VendorLiteSurvey', VendorSurveySchema);
