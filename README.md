# SmartBNPL AI — Intelligence Platform

> Responsible Buy Now Pay Later Eligibility & Affordability Platform

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ and npm installed

### 1. Install Dependencies

```bash
# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Start the Application

**Option A — Two terminals:**

Terminal 1 (Backend):
```bash
cd server
npm start
# Server runs on http://localhost:5001
```

Terminal 2 (Frontend):
```bash
cd client
npm start
# App opens at http://localhost:3000
```

**Option B — From root (requires concurrently):**
```bash
npm install          # installs concurrently
npm run dev          # starts both
```

## 🌟 Features

| Feature | Description |
|---------|-------------|
| **AI Eligibility Engine** | 14+ factor credit analysis with approval/rejection |
| **EMI Calculator** | Reducing balance formula, all tenure comparisons |
| **Decision Support** | Approved, conditional approval, or rejected with reasons |
| **Eligible Limit** | Estimates safe BNPL principal from income and EMI burden |
| **Risk Scoring** | A/B/C/D grade with color-coded indicators |
| **Recommended Tenure** | Highlights the safest repayment tenure |
| **Smart Recommendations** | Personalized, data-driven suggestions |
| **What-If Simulator** | Real-time parameter adjustment |
| **Interactive Charts** | Pie, Bar, Line, Area charts via Recharts |
| **No Cost EMI Comparison** | Compares no-cost EMI against standard interest EMI |
| **Dark/Light Mode** | Fintech-grade theme toggle |
| **Report Download** | Text report generation |
| **Print Support** | Print-optimized CSS |

## 📦 Tech Stack

- **Frontend:** React 18, Tailwind CSS, Recharts, Axios
- **Backend:** Node.js, Express
- **Automation:** n8n Webhook, Code, IF, Google Sheets/Database, Email
- **Fonts:** Sora, JetBrains Mono
- **Design:** Glassmorphism, Neon Fintech Dark Theme

## 🔁 n8n Automation Layer

The React app uses n8n as the automation layer behind the BNPL simulator. The frontend collects the customer profile, then sends it to an n8n webhook for workflow processing.

Current frontend integration:

```text
React Form → n8n Webhook → Eligibility Result → Dashboard
```

The webhook URL is configured in `client/src/components/InputForm.js` and can be overridden with:

```bash
REACT_APP_N8N_WEBHOOK_URL=https://your-n8n-domain/webhook/bnpl-check
```

Recommended n8n workflows to present:

| Workflow | n8n Flow | Purpose |
|----------|----------|---------|
| **Eligibility Automation** | Webhook → Code Node → IF Node → Google Sheet/DB → Email | Receives customer profile, calculates risk, stores the result, and sends the customer decision |
| **Admin Alert** | Webhook/DB Trigger → IF Node → Slack/Telegram/WhatsApp | Alerts admin for new applications, high-risk cases, or approvals |
| **Daily Report** | Cron → Google Sheet/DB → Code Node → Email | Sends daily totals, approval rate, rejection rate, and average risk score |

Suggested eligibility logic inside the n8n Code node:

```js
let score = 100;
if (defaults > 0) score -= defaults * 25;
if (creditHistory < 6) score -= 20;

const principal = productPrice - downPayment;
const eligibleLimit = monthlyIncome * 0.3;
const emiRatio = monthlyEMI / monthlyIncome;
const riskGrade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'D';
const decision = score >= 70 && emiRatio <= 0.3 ? 'Approved' : score >= 50 ? 'Conditional Approval' : 'Rejected';
```

Fields to store in Google Sheets or a database:

```text
name, email, income, credit_history, defaults, product_price,
eligible_limit, monthly_emi, risk_grade, decision, recommended_tenure
```

Interview line:

> We used n8n to separate automation from the frontend. The React app handles user interaction, while n8n manages eligibility processing, decision branching, data storage, and notifications.

## 📁 Project Structure

```
smartbnpl/
├── client/                  # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   ├── LandingHero.js
│   │   │   ├── InputForm.js
│   │   │   ├── ResultDashboard.js
│   │   │   └── WhatIfSimulator.js
│   │   ├── hooks/
│   │   │   └── useAnimatedCounter.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                  # Express Backend
│   ├── index.js
│   └── package.json
│
├── package.json             # Root scripts
└── README.md
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze` | POST | Full eligibility analysis |
| `/calculate-emi` | POST | EMI calculation only |

### POST /analyze — Request Body
```json
{
  "monthlyIncome": 50000,
  "existingEMI": 5000,
  "creditScore": 720,
  "creditHistory": 24,
  "defaults": 0,
  "productPrice": 25000,
  "downPayment": 5000,
  "tenure": 6,
  "employmentType": "Salaried"
}
```

## 💡 Eligibility Rules

- EMI-to-income ratio must not exceed **50%** (warning at 40%)
- Defaults ≥ 2 → **Auto Reject**
- Credit score < 500 → **Auto Reject**
- Higher down payment → better affordability score
- Salaried employees get lower interest rates

## 🎨 Design System

- **Neon Cyan** `#00E5FF` — Primary accent
- **Neon Green** `#00FF87` — Success / Approved
- **Amber** `#FFB300` — Warning / Moderate
- **Red** `#FF3D71` — Danger / Rejected
- **Surface Dark** `#0A0F1E` — Background
