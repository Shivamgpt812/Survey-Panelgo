import mongoose from 'mongoose';

const preScreenerSchema = new mongoose.Schema(
  {
    id: String,
    question: String,
    type: String,
    condition: String,
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    id: String,
    surveyId: String,
    type: String,
    question: String,
    options: [String],
    required: Boolean,
  },
  { _id: false }
);

const surveySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
    isExternal: { type: Boolean, required: true },
    pointsReward: { type: Number, required: true },
    timeEstimate: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    isNew: { type: Boolean },
    isPopular: { type: Boolean },
    vendorId: { type: String, default: null }, // Link to vendor
    preScreener: { type: [preScreenerSchema], default: [] },
    questions: { type: [questionSchema], default: [] },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        // Type assertion to allow deletion
        const retToDelete = ret as any;
        delete retToDelete._id;
        delete retToDelete.__v;
        return ret;
      },
    },
  }
);

export const Survey = mongoose.model('Survey', surveySchema);
