# Corporate Risk Assessment & Monitoring System (CRAMS)

A full-stack MERN web application for monitoring and managing corporate risks across five key categories.

## 🚀 Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (JSON Web Tokens)

## 📋 Features

1. **Dashboard** — Corporate Risk Score, category scores, trend charts, top risks, recent alerts
2. **Risk Management** — Full CRUD for risks with auto-calculated scores
3. **Alerts** — Auto-generated for High/Critical risks, mark read/unread
4. **Customer Feedback** — Sentiment analysis (keyword-based), reputation risk detection
5. **Monitoring** — Live organizational metrics with threshold warnings
6. **Mitigation** — Track mitigation actions per risk
7. **JWT Auth** — Admin and Risk Manager roles

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Risk Manager | manager@example.com | manager123 |

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (running locally on port 27017)

### 1. Clone / navigate to the project

```bash
cd d:\projects\inventory
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (already included):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/risk_assessment
JWT_SECRET=corporate_risk_secret_key_2024
JWT_EXPIRE=7d
```

**Seed the database with sample data:**
```bash
npm run seed
```

**Start the backend:**
```bash
npm run dev
```
Backend runs at: http://localhost:5000

### 3. Setup Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## 📊 Risk Score Formula

```
Risk Score = (Probability × Severity × Impact / 125) × 100
```

| Score Range | Level |
|-------------|-------|
| 0 – 30 | 🟢 Low |
| 31 – 60 | 🟡 Medium |
| 61 – 80 | 🟠 High |
| 81 – 100 | 🔴 Critical |

## 🗂️ Project Structure

```
inventory/
├── backend/
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express API routes
│   ├── middleware/     # JWT auth middleware
│   ├── seed.js         # Database seeder
│   └── server.js       # Express entry point
└── frontend/
    └── src/
        ├── components/ # Reusable components
        ├── context/    # React context (Auth)
        └── pages/      # Page components
```

## 🔭 Future Scope

- Machine learning-based risk prediction models
- Real-time notifications (WebSockets)
- ERP/CRM integration
- Advanced analytics and reporting
- Multi-company/tenant support
- Mobile application
- Audit logs and compliance tracking
