import mongoose, { Schema, Document } from 'mongoose';
import IVendorSurvey from './surveyModel.js';

export interface IVendorResponse extends Document {
  uid: string;
  pid: mongoose.Types.ObjectId;
  ip: string;
  status: string;
  answers?: any;
  created_at: Date;
  updated_at: Date;
}

const VendorResponseSchema = new Schema<IVendorResponse>({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  pid: {
    type: Schema.Types.ObjectId,
    ref: 'VendorLiteSurvey',
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'complete',
  },
  answers: {
    type: Schema.Types.Mixed,
    required: false,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'vendor_lite_responses'
});

export default mongoose.model<IVendorResponse>('VendorLiteResponse', VendorResponseSchema);
