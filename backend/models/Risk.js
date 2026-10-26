const mongoose = require('mongoose');

// Risk Score = (Probability × Severity × Impact) normalized to 0-100
// Max raw score = 5 * 5 * 5 = 125, normalize: (score/125) * 100
const getRiskLevel = (score) => {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Medium';
  if (score <= 80) return 'High';
  return 'Critical';
};

const riskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Financial', 'Operational', 'Cybersecurity', 'Market', 'Reputation'],
    required: true,
  },
  description: { type: String },
  probability: { type: Number, min: 1, max: 5, required: true },
  severity: { type: Number, min: 1, max: 5, required: true },
  impact: { type: Number, min: 1, max: 5, required: true },
  score: { type: Number },
  level: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
  owner: { type: String, default: 'Unassigned' },
  status: {
    type: String,
    enum: ['Open', 'Under Mitigation', 'Resolved'],
    default: 'Open',
  },
}, { timestamps: true });

// Auto-calculate score and level before saving
riskSchema.pre('save', function (next) {
  const raw = this.probability * this.severity * this.impact;
  this.score = Math.round((raw / 125) * 100);
  this.level = getRiskLevel(this.score);
  next();
});

riskSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.probability !== undefined || update.severity !== undefined || update.impact !== undefined) {
    // Will be recalculated; fetch current doc if needed
  }
  next();
});

module.exports = mongoose.model('Risk', riskSchema);
