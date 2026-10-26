const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const { protect } = require('../middleware/auth');

// The 16 feature names expected by ml/ml_api.py (same order as training dataset)
const REQUIRED_FEATURES = [
  'revenue_change_pct',
  'profit_change_pct',
  'expense_change_pct',
  'debt_ratio',
  'customer_demand_change_pct',
  'customer_churn_pct',
  'sales_change_pct',
  'downtime_hours',
  'operational_incidents',
  'delivery_delay_pct',
  'failed_login_attempts',
  'security_incidents',
  'vulnerability_count',
  'negative_feedback_pct',
  'average_rating',
  'sentiment_score',
];

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// Forward a JSON body to the FastAPI service and return the parsed response
function callFastAPI(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url = new URL(path, ML_URL);
    const lib = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(new Error('ETIMEDOUT')); });
    req.write(payload);
    req.end();
  });
}

// POST /api/ml/predict  (requires valid JWT)
router.post('/predict', protect, async (req, res) => {
  try {
    // 1. Check that all 16 features are present
    const missing = REQUIRED_FEATURES.filter((f) => !(f in req.body));
    if (missing.length) {
      return res.status(422).json({
        message: `Missing required fields: ${missing.join(', ')}`,
        missing,
      });
    }

    // 2. Check that every value is a finite number
    const invalid = REQUIRED_FEATURES.filter((f) => {
      const v = req.body[f];
      return typeof v !== 'number' || !isFinite(v);
    });
    if (invalid.length) {
      return res.status(422).json({
        message: `Fields must be finite numbers: ${invalid.join(', ')}`,
        invalid,
      });
    }

    // 3. Build the validated payload (only the 16 known features)
    const payload = {};
    for (const f of REQUIRED_FEATURES) {
      payload[f] = req.body[f];
    }

    // 4. Forward to FastAPI
    const mlRes = await callFastAPI('/predict', payload);

    // Pass the FastAPI status + body straight through
    return res.status(mlRes.status).json(mlRes.body);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.message === 'ETIMEDOUT' || err.code === 'ETIMEDOUT') {
      return res.status(503).json({ message: 'ML service is unavailable. Please ensure the Python API is running on port 8000.' });
    }
    console.error('[ml route]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
