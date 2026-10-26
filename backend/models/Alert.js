const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: {
    type: String,
    enum: ['Financial', 'Operational', 'Cybersecurity', 'Market', 'Reputation'],
  },
  riskScore: { type: Number },
  level: { type: String, enum: ['High', 'Critical'] },
  status: { type: String, enum: ['Unread', 'Read'], default: 'Unread' },
  riskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Risk' },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
