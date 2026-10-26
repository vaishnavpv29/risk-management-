const express = require('express');
const router = express.Router();
const Risk = require('../models/Risk');
const Alert = require('../models/Alert');
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// GET /api/dashboard
router.get('/', protect, async (req, res) => {
  try {
    const risks = await Risk.find();
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(5);
    const feedbacks = await Feedback.find();

    const categories = ['Financial', 'Operational', 'Cybersecurity', 'Market', 'Reputation'];
    const categoryScores = {};

    categories.forEach((cat) => {
      const catRisks = risks.filter((r) => r.category === cat && r.status !== 'Resolved');
      if (catRisks.length === 0) {
        categoryScores[cat] = 0;
      } else {
        const avg = catRisks.reduce((sum, r) => sum + r.score, 0) / catRisks.length;
        categoryScores[cat] = Math.round(avg);
      }
    });

    const scores = Object.values(categoryScores).filter((s) => s > 0);
    const overallScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    let overallLevel = 'Low';
    if (overallScore > 80) overallLevel = 'Critical';
    else if (overallScore > 60) overallLevel = 'High';
    else if (overallScore > 30) overallLevel = 'Medium';

    // Top 3 risks by score
    const topRisks = [...risks].sort((a, b) => b.score - a.score).slice(0, 3);

    // Feedback stats
    const total = feedbacks.length;
    const negative = feedbacks.filter((f) => f.sentiment === 'Negative').length;
    const negativePercent = total ? Math.round((negative / total) * 100) : 0;

    // Risk trend — sample monthly data (last 6 months)
    const monthlyTrend = [
      { month: 'Apr', score: 55 },
      { month: 'May', score: 60 },
      { month: 'Jun', score: 58 },
      { month: 'Jul', score: 65 },
      { month: 'Aug', score: 68 },
      { month: 'Sep', score: overallScore },
    ];

    res.json({
      overallScore,
      overallLevel,
      categoryScores,
      topRisks,
      recentAlerts: alerts,
      totalRisks: risks.length,
      openRisks: risks.filter((r) => r.status === 'Open').length,
      resolvedRisks: risks.filter((r) => r.status === 'Resolved').length,
      negativePercent,
      monthlyTrend,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
