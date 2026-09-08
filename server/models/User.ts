import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    points: { type: Number, default: 0 },
    surveysCompleted: { type: Number, default: 0 },
    memberSince: { type: String, required: true },
    avatar: { type: String },
    panelType: { type: String, default: 'general' },
    isVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    employmentStatus: { type: String, default: '' },
    industry: { type: String, default: '' },
    roleTitle: { type: String, default: '' },
    department: { type: String, default: '' },
    country: { type: String, default: '' },
    revenue: { type: String, default: '' },
    area: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const User = mongoose.model('User', userSchema);
