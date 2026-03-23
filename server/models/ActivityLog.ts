import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: { type: String, enum: ['success', 'info', 'warning', 'error'], required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.timestamp = ret.createdAt;
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
