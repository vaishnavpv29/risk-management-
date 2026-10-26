const mongoose = require('mongoose');

// Simple keyword-based sentiment analysis
const analyzeSentiment = (text) => {
  const lower = text.toLowerCase();
  const positiveWords = ['good', 'excellent', 'great', 'satisfied', 'amazing', 'happy', 'wonderful', 'love', 'best', 'perfect'];
  const negativeWords = ['bad', 'poor', 'terrible', 'disappointed', 'slow', 'worst', 'unhappy', 'awful', 'horrible', 'hate'];

  let posScore = 0;
  let negScore = 0;
  positiveWords.forEach((w) => { if (lower.includes(w)) posScore++; });
  negativeWords.forEach((w) => { if (lower.includes(w)) negScore++; });

  if (posScore > negScore) return 'Positive';
  if (negScore > posScore) return 'Negative';
  return 'Neutral';
};

const feedbackSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  feedback: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'] },
}, { timestamps: true });

// Auto-analyze sentiment before saving
feedbackSchema.pre('save', function (next) {
  this.sentiment = analyzeSentiment(this.feedback);
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
