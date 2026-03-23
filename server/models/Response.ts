import mongoose from 'mongoose';

const preScreenerAnswerSchema = new mongoose.Schema(
  {
    questionId: String,
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    surveyId: { type: String, required: true },
    vendorId: { type: String },
    userId: { type: String },
    status: { type: String, enum: ['complete', 'terminate', 'quota_full'], required: true },
    preScreenerAnswers: { type: [preScreenerAnswerSchema], default: [] },
    failureReason: { type: String },
    userInfo: {
      name: { type: String },
      email: { type: String },
      age: { type: Number },
      gender: { type: String },
      location: { type: String },
    },
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

export const Response = mongoose.model('Response', responseSchema);
