import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  complete_url: string;
  terminate_url: string;
  quota_full_url: string;
  created_at: Date;
  updated_at: Date;
}

const VendorSchema = new Schema<IVendor>({
  name: {
    type: String,
    required: true,
  },
  complete_url: {
    type: String,
    required: true,
  },
  terminate_url: {
    type: String,
    required: true,
  },
  quota_full_url: {
    type: String,
    required: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'vendor_lite_vendors'
});

export default mongoose.model<IVendor>('VendorLite', VendorSchema);
