import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    redirectLinks: {
      complete: { type: String, required: true },
      terminate: { type: String, required: true },
      quotaFull: { type: String, required: true },
    },
    completedSurveys: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Survey' }],
    totalCompletions: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Vendor = mongoose.model('Vendor', vendorSchema);
