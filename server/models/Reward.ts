import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    pointsCost: { type: Number, required: true },
    image: { type: String },
    category: { type: String, enum: ['giftcard', 'cash', 'product'], required: true },
    inStock: { type: Boolean, default: true },
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

export const Reward = mongoose.model('Reward', rewardSchema);
