import mongoose from 'mongoose';

const respondentMappingSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  pid: {
    type: String,
    required: false
  },
  startIp: {
    type: String,
    required: false
  },
  endIp: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: true
  }
});

// Clean up expired mappings
respondentMappingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RespondentMapping = mongoose.models.RespondentMapping || mongoose.model('RespondentMapping', respondentMappingSchema);

export default RespondentMapping;
