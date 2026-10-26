const mongoose = require('mongoose');

const mitigationSchema = new mongoose.Schema({
  riskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Risk', required: true },
  action: { type: String, required: true },
  owner: { type: String, required: true },
  deadline: { type: Date },
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed'],
    default: 'Planned',
  },
}, { timestamps: true });

module.exports = mongoose.model('Mitigation', mitigationSchema);
