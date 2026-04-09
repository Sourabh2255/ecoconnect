# 🌿 EcoConnect — Smart Waste Management System

A full-stack production-ready web app with 4 user roles, AI chatbot, live GPS tracking, and ML waste classification.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- (Optional) Gmail app password for email OTP
- (Optional) Anthropic API key for AI chatbot

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecoconnect
JWT_SECRET=ecoconnect_super_secret_2025
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLAUDE_API_KEY=your_anthropic_api_key
NODE_ENV=development
```

Seed the database:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

Backend runs at: http://localhost:5000

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🏠 Citizen | citizen@demo.com | Demo1234 |
| 🏠 Citizen | eco@demo.com | Demo1234 |
| 🏛️ Officer | officer1@ecoconnect.com | Admin1234 |
| 🏛️ Officer | officer2@ecoconnect.com | Admin1234 |
| 🚛 Collector | collector1@ecoconnect.com | Driver1234 |
| 🚛 Collector | collector2@ecoconnect.com | Driver1234 |
| 🏭 Industry | industry@demo.com | Demo1234 |
| 🏭 Industry | factory@demo.com | Demo1234 |

> All seeded users have `isEmailVerified: true` — no OTP needed for demo login.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Zustand, Axios |
| UI | Lucide React, Recharts, custom CSS-in-JS |
| Maps | Leaflet.js + react-leaflet (OpenStreetMap, free) |
| Backend | Node.js, Express.js, JWT, bcryptjs |
| Database | MongoDB + Mongoose |
| Email | Nodemailer (Gmail SMTP) |
| AI Chatbot | Anthropic Claude API (claude-sonnet-4-5-20251001) |

---

## 👥 User Roles

### 🏠 Citizen
- Self-register with email OTP verification
- Schedule waste pickups (4-step wizard, QR code)
- Live truck GPS tracking (Leaflet map, polls every 15s)
- AI Waste Classifier (upload photo → category + tips + points)
- Report issues (+10 eco points)
- Eco Points & Leaderboard gamification
- Nearby industries & dumping grounds map
- EcoAssist AI Chatbot (Claude-powered)

### 🏛️ Government Officer
- Created via seed only (no self-signup)
- Zone-based data isolation (pune-north / pune-south)
- Assign collectors to pickup requests
- Fleet map with live GPS
- Escalation badges for stale complaints
- Industry waste declaration management
- Zone analytics with charts
- ESG report viewer

### 🚛 Garbage Collector
- Created via seed only (no self-signup)
- On/Off Duty toggle → broadcasts GPS every 10s
- Today's pickups: En Route → Collected buttons
- Auto-notifies officer + citizen on completion
- Route map with all assigned pickup pins

### 🏭 Industry
- Self-register with GST number validation
- Declare industrial waste (hazard levels, QR codes)
- Waste marketplace (buy/sell recyclables)
- Industry-to-industry transfer requests
- ESG reporting (recycling rate, CO₂, grade)
- Nearby industries map

---

## 📡 Key API Endpoints

```
POST   /api/auth/register
POST   /api/auth/verify-email
POST   /api/auth/login
POST   /api/auth/resend-otp

GET    /api/citizen/pickups
POST   /api/citizen/pickup
POST   /api/citizen/classify
GET    /api/citizen/leaderboard

GET    /api/officer/dashboard
PUT    /api/officer/request/:id/assign
GET    /api/tracker/fleet/:zone

PUT    /api/collector/duty-toggle
PUT    /api/collector/pickup/:id/status

POST   /api/industry/declare
GET    /api/industry/marketplace
POST   /api/industry/transfer-request

GET    /api/tracker/:requestId
POST   /api/chat
GET    /api/notifications
```

---

## 🌟 Eco Points System

| Action | Points |
|--------|--------|
| Schedule Pickup | +5 |
| Classify Waste | +5 |
| Report Issue | +10 |
| Pickup Completed | +20 |
| Complete Profile | +15 |
| Daily Login | +3 |
| 7-Day Streak Bonus | +25 |
| >3 Cancellations/Month | -5 |

---

## 📁 Project Structure

```
ecoconnect/
├── backend/
│   ├── config/db.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── index.js (all other models)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── citizen.js
│   │   ├── officer.js
│   │   ├── collector.js
│   │   ├── industry.js
│   │   ├── tracker.js
│   │   ├── chat.js
│   │   └── notifications.js
│   ├── server.js
│   ├── seed.js
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── store/authStore.js
    │   ├── utils/api.js
    │   ├── components/Layout.jsx
    │   └── pages/
    │       ├── Landing.jsx
    │       ├── Login.jsx
    │       ├── Signup.jsx
    │       ├── citizen/Dashboard.jsx
    │       ├── government/OfficerDashboard.jsx
    │       ├── government/CollectorDashboard.jsx
    │       └── industry/Dashboard.jsx
    ├── index.html
    └── vite.config.js
```

---

## 🔧 Configuration Notes

### Email OTP
If you don't have Gmail SMTP configured, OTP emails will fail silently (check console). The seeded users are already verified, so demo login works without email.

### Claude AI Chatbot
Add your `CLAUDE_API_KEY` to `.env`. If missing, the chatbot returns a fallback error message.

### Maps
Uses OpenStreetMap — completely free, no API key needed.

### GPS Simulation
If no real GPS (browser permission denied), collectors broadcast simulated coordinates near Pune (18.52, 73.85).

---

## 🏙️ Location Data

All seed data and GPS coordinates are set around **Pune, Maharashtra, India**.
