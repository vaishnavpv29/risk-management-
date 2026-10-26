const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// GET /api/feedback
router.get('/', protect, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    const total = feedbacks.length;
    const positive = feedbacks.filter((f) => f.sentiment === 'Positive').length;
    const negative = feedbacks.filter((f) => f.sentiment === 'Negative').length;
    const neutral = feedbacks.filter((f) => f.sentiment === 'Neutral').length;

    res.json({
      feedbacks,
      stats: {
        total,
        positive,
        negative,
        neutral,
        positivePercent: total ? Math.round((positive / total) * 100) : 0,
        negativePercent: total ? Math.round((negative / total) * 100) : 0,
        neutralPercent: total ? Math.round((neutral / total) * 100) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/feedback
router.post('/', protect, async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
