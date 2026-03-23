import mongoose from 'mongoose';

const surveyTrackingSchema = new mongoose.Schema(
  {
    surveyId: { type: String, required: true },
    userId: { type: String, required: true },
    clickId: { type: String, required: true, unique: true },
    ipAddress: { type: String, required: true },
    status: { type: String, enum: ['completed', 'terminated', 'quota_full'], required: true },
    timestamp: { type: Date, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        (ret as any).id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete (ret as any).createdAt;
        delete (ret as any).updatedAt;
        return ret;
      },
    },
  }
);

export const SurveyTracking = mongoose.model('SurveyTracking', surveyTrackingSchema);
