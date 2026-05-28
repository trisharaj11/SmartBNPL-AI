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
# Server runs on http://localhost:5000
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
| **Risk Scoring** | A/B/C/D grade with color-coded indicators |
| **Smart Recommendations** | Personalized, data-driven suggestions |
| **What-If Simulator** | Real-time parameter adjustment |
| **Interactive Charts** | Pie, Bar, Line, Area charts via Recharts |
| **Dark/Light Mode** | Fintech-grade theme toggle |
| **Report Download** | Text report generation |
| **Print Support** | Print-optimized CSS |

## 📦 Tech Stack

- **Frontend:** React 18, Tailwind CSS, Recharts, Axios
- **Backend:** Node.js, Express
- **Fonts:** Sora, JetBrains Mono
- **Design:** Glassmorphism, Neon Fintech Dark Theme

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
