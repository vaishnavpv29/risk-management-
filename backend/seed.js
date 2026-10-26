const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Risk = require('./models/Risk');
const Alert = require('./models/Alert');
const Feedback = require('./models/Feedback');
const Mitigation = require('./models/Mitigation');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany();
  await Risk.deleteMany();
  await Alert.deleteMany();
  await Feedback.deleteMany();
  await Mitigation.deleteMany();
  console.log('Cleared existing data');

  // Create users
  const users = await User.create([
    { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { name: 'Risk Manager', email: 'manager@example.com', password: 'manager123', role: 'manager' },
  ]);
  console.log('Users created');

  // Create risks
  const risksData = [
    // Financial
    { name: 'Revenue Decline', category: 'Financial', description: 'Quarterly revenue has declined by 15% due to market slowdown.', probability: 4, severity: 4, impact: 4, owner: 'CFO', status: 'Open' },
    { name: 'Increasing Operational Expenses', category: 'Financial', description: 'Operational costs have risen by 20%, affecting profit margins.', probability: 3, severity: 3, impact: 4, owner: 'Finance Team', status: 'Under Mitigation' },
    { name: 'Cash Flow Problems', category: 'Financial', description: 'Delayed receivables are creating short-term liquidity issues.', probability: 3, severity: 4, impact: 3, owner: 'Finance Team', status: 'Open' },

    // Operational
    { name: 'Production Delay', category: 'Operational', description: 'Supply chain disruptions causing production delays of 2–3 weeks.', probability: 4, severity: 3, impact: 4, owner: 'Operations Manager', status: 'Open' },
    { name: 'System Downtime', category: 'Operational', description: 'Core systems experienced 8 hours of unplanned downtime this quarter.', probability: 3, severity: 4, impact: 4, owner: 'IT Team', status: 'Under Mitigation' },
    { name: 'Employee Shortage', category: 'Operational', description: 'Key department understaffed by 30%, affecting productivity.', probability: 3, severity: 3, impact: 3, owner: 'HR Manager', status: 'Open' },

    // Cybersecurity
    { name: 'Multiple Failed Login Attempts', category: 'Cybersecurity', description: 'Over 500 failed login attempts detected in the past 24 hours, indicating a possible brute-force attack.', probability: 5, severity: 5, impact: 4, owner: 'IT Security Team', status: 'Open' },
    { name: 'Unauthorized Access Attempt', category: 'Cybersecurity', description: 'An unauthorized access attempt to the internal admin panel was detected.', probability: 4, severity: 5, impact: 5, owner: 'IT Security Team', status: 'Under Mitigation' },
    { name: 'Phishing Email Campaign', category: 'Cybersecurity', description: 'Employees received targeted phishing emails impersonating the CEO.', probability: 4, severity: 4, impact: 4, owner: 'IT Security Team', status: 'Open' },

    // Market
    { name: 'Customer Demand Decline', category: 'Market', description: 'Customer demand for flagship product declined by 20% in Q3.', probability: 4, severity: 4, impact: 4, owner: 'Marketing Team', status: 'Open' },
    { name: 'Customer Churn Increase', category: 'Market', description: 'Monthly customer churn rate increased from 3% to 7%.', probability: 3, severity: 4, impact: 4, owner: 'Customer Success Team', status: 'Open' },
    { name: 'Competitor Market Entry', category: 'Market', description: 'A major competitor entered the market with aggressive pricing.', probability: 4, severity: 3, impact: 4, owner: 'Strategy Team', status: 'Open' },

    // Reputation
    { name: 'Negative Customer Reviews', category: 'Reputation', description: 'Negative reviews on Google and Trustpilot have increased by 35%.', probability: 4, severity: 3, impact: 4, owner: 'PR Team', status: 'Open' },
    { name: 'Increase in Customer Complaints', category: 'Reputation', description: 'Customer support complaints increased by 45% this month.', probability: 3, severity: 3, impact: 3, owner: 'Customer Support', status: 'Under Mitigation' },
    { name: 'Social Media Backlash', category: 'Reputation', description: 'A viral social media post has negatively impacted brand image.', probability: 3, severity: 4, impact: 4, owner: 'PR Team', status: 'Open' },
  ];

  const risks = await Risk.create(risksData);
  console.log('Risks created');

  // Create alerts for high/critical risks
  const alertsData = risks
    .filter((r) => r.score >= 61)
    .map((r) => ({
      title: `${r.score >= 81 ? 'Critical' : 'High'} Risk: ${r.name}`,
      message: `The risk "${r.name}" in ${r.category} category has a score of ${r.score}, indicating a ${r.score >= 81 ? 'critical' : 'high'} level threat requiring immediate attention.`,
      category: r.category,
      riskScore: r.score,
      level: r.score >= 81 ? 'Critical' : 'High',
      riskId: r._id,
      status: 'Unread',
    }));

  await Alert.create(alertsData);
  console.log('Alerts created');

  // Sample feedback
  const feedbackData = [
    { customerName: 'Alice Johnson', feedback: 'Excellent service and great support team!', rating: 5 },
    { customerName: 'Bob Smith', feedback: 'The product quality is amazing and delivery was fast.', rating: 5 },
    { customerName: 'Carol White', feedback: 'Good overall experience, nothing to complain about.', rating: 4 },
    { customerName: 'David Brown', feedback: 'The service was terrible and very slow.', rating: 1 },
    { customerName: 'Emma Davis', feedback: 'Very disappointed with the quality, worst purchase ever.', rating: 1 },
    { customerName: 'Frank Miller', feedback: 'Support was helpful and the product is good.', rating: 4 },
    { customerName: 'Grace Wilson', feedback: 'Not great, not terrible. Average experience.', rating: 3 },
    { customerName: 'Henry Moore', feedback: 'Terrible customer service, very unhappy with response time.', rating: 1 },
    { customerName: 'Isabella Taylor', feedback: 'Happy with the product, will recommend to friends.', rating: 4 },
    { customerName: 'James Anderson', feedback: 'Poor product quality, does not match the description.', rating: 2 },
    { customerName: 'Karen Thomas', feedback: 'Amazing experience, satisfied with everything!', rating: 5 },
    { customerName: 'Liam Jackson', feedback: 'Bad customer experience, will not purchase again.', rating: 1 },
  ];

  await Feedback.create(feedbackData);
  console.log('Feedback created');

  // Sample mitigations
  const mitHighRisks = risks.filter((r) => r.score >= 61).slice(0, 3);
  if (mitHighRisks.length > 0) {
    const mitigationData = [
      {
        riskId: mitHighRisks[0]._id,
        action: 'Enable Multi-Factor Authentication (MFA) and conduct a full audit of login logs.',
        owner: 'IT Security Team',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
      },
    ];
    if (mitHighRisks[1]) {
      mitigationData.push({
        riskId: mitHighRisks[1]._id,
        action: 'Implement IP whitelisting and review access control policies.',
        owner: 'IT Security Team',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'Planned',
      });
    }
    if (mitHighRisks[2]) {
      mitigationData.push({
        riskId: mitHighRisks[2]._id,
        action: 'Launch customer retention campaign and improve support response time.',
        owner: 'Customer Success Team',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Planned',
      });
    }
    await Mitigation.create(mitigationData);
    console.log('Mitigations created');
  }

  console.log('✅ Database seeded successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
