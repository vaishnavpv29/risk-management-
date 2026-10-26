const express = require('express');
const router = express.Router();
const Mitigation = require('../models/Mitigation');
const Risk = require('../models/Risk');
const { protect } = require('../middleware/auth');

// GET /api/mitigation
router.get('/', protect, async (req, res) => {
  try {
    const mitigations = await Mitigation.find().populate('riskId', 'name category score level').sort({ createdAt: -1 });
    res.json(mitigations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/mitigation
router.post('/', protect, async (req, res) => {
  try {
    const mitigation = await Mitigation.create(req.body);
    // Update risk status to Under Mitigation
    await Risk.findByIdAndUpdate(req.body.riskId, { status: 'Under Mitigation' });
    const populated = await mitigation.populate('riskId', 'name category score level');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/mitigation/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const mitigation = await Mitigation.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('riskId', 'name category score level');
    if (!mitigation) return res.status(404).json({ message: 'Mitigation not found' });
    // If completed, update risk status to Resolved
    if (req.body.status === 'Completed') {
      await Risk.findByIdAndUpdate(mitigation.riskId, { status: 'Resolved' });
    }
    res.json(mitigation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
