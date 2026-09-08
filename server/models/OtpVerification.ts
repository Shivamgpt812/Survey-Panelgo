import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 600 }, // TTL index: auto delete after 10 min
  },
  { timestamps: true }
);

otpVerificationSchema.index({ email: 1 });

export const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema);
