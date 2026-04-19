import mongoose from 'mongoose';

export interface ISurveySession {
  id: string;
  identifier: string;
  vendor_id: mongoose.Types.ObjectId;
  actual_user_id: string;
  survey_id?: string | null;
  base_url: string;
  identifier_param_name: string;
  created_at: Date;
}

const surveySessionSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    actual_user_id: {
      type: String,
      required: true
    },
    survey_id: {
      type: String,
      required: false // pid if available
    },
    base_url: {
      type: String,
      required: true // external link used
    },
    identifier_param_name: {
      type: String,
      required: true // e.g., user_id, uid, user
    },
    created_at: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days TTL
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    collection: 'survey_sessions',
    toJSON: {
      transform(_doc, ret: { _id?: mongoose.Types.ObjectId; __v?: number; [key: string]: unknown }) {
        ret.id = ret._id!.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SurveySession = mongoose.model<ISurveySession>('SurveySession', surveySessionSchema);
