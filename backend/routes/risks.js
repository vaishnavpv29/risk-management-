const express = require('express');
const router = express.Router();
const Risk = require('../models/Risk');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// Helper: create alert if risk score is high/critical
const createAlertIfNeeded = async (risk) => {
  if (risk.score >= 61) {
    const level = risk.score >= 81 ? 'Critical' : 'High';
    // Check if alert already exists for this risk
    const exists = await Alert.findOne({ riskId: risk._id });
    if (!exists) {
      await Alert.create({
        title: `${level} Risk: ${risk.name}`,
        message: `The risk "${risk.name}" in ${risk.category} category has a score of ${risk.score}, indicating a ${level.toLowerCase()} level threat.`,
        category: risk.category,
        riskScore: risk.score,
        level,
        riskId: risk._id,
      });
    }
  }
};

// GET /api/risks
router.get('/', protect, async (req, res) => {
  try {
    const risks = await Risk.find().sort({ createdAt: -1 });
    res.json(risks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/risks
router.post('/', protect, async (req, res) => {
  try {
    const risk = await Risk.create(req.body);
    await createAlertIfNeeded(risk);
    res.status(201).json(risk);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/risks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { probability, severity, impact } = req.body;
    // Recalculate score if p/s/i provided
    if (probability && severity && impact) {
      const raw = probability * severity * impact;
      req.body.score = Math.round((raw / 125) * 100);
      if (req.body.score <= 30) req.body.level = 'Low';
      else if (req.body.score <= 60) req.body.level = 'Medium';
      else if (req.body.score <= 80) req.body.level = 'High';
      else req.body.level = 'Critical';
    }
    const risk = await Risk.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!risk) return res.status(404).json({ message: 'Risk not found' });
    await createAlertIfNeeded(risk);
    res.json(risk);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/risks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const risk = await Risk.findByIdAndDelete(req.params.id);
    if (!risk) return res.status(404).json({ message: 'Risk not found' });
    // Remove associated alert
    await Alert.deleteOne({ riskId: req.params.id });
    res.json({ message: 'Risk deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
