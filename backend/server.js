const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/mitigation', require('./routes/mitigation'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ml', require('./routes/ml'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Corporate Risk Assessment API is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
