# 🌿 EcoConnect — Smart Waste Management Platform

A full-stack web application with **React frontend**, **Node.js + Express backend**, and **MongoDB database**.

---

## 📁 Project Structure

```
ecoconnect/
├── backend/              ← Node.js + Express + MongoDB
│   ├── config/db.js      ← MongoDB connection
│   ├── middleware/       ← JWT auth middleware
│   ├── models/           ← Mongoose data models
│   ├── routes/           ← API route handlers
│   ├── seed.js           ← Demo data seeder
│   ├── server.js         ← Express app entry point
│   ├── .env              ← Environment variables
│   └── package.json
│
├── frontend/             ← React + Vite
│   ├── src/
│   │   ├── pages/        ← Landing, Login, Signup, Dashboards
│   │   ├── store/        ← Zustand auth state
│   │   └── utils/api.js  ← Axios API calls
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## ⚡ STEP-BY-STEP RUN GUIDE

### PREREQUISITES — Install these first

1. **Node.js v18+** → https://nodejs.org/  (LTS version)
2. **MongoDB Community** → https://www.mongodb.com/try/download/community
3. **VS Code** → https://code.visualstudio.com/

---

### STEP 1 — Open in VS Code

```
File → Open Folder → select the "ecoconnect" folder
```

---

### STEP 2 — Start MongoDB

**Windows:**
- MongoDB should start automatically as a service after installation.
- If not: Press `Win+R`, type `services.msc`, find "MongoDB Server", click Start.
- Or run: `net start MongoDB` in Command Prompt (as Administrator)

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

Verify it's running: open a terminal and type `mongosh` — you should see a MongoDB shell.

---

### STEP 3 — Configure Environment Variables

Open `backend/.env` — it should look like this (already configured):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecoconnect
JWT_SECRET=ecoconnect_super_secret_jwt_key_2025_change_in_production
NODE_ENV=development
```

If you're using **MongoDB Atlas** (cloud), replace `MONGO_URI` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecoconnect
```

---

### STEP 4 — Install Backend Dependencies & Seed Database

Open a terminal in VS Code (`Ctrl + ~`):

```bash
cd backend
npm install
```

Seed demo data (creates test users and sample records):
```bash
node seed.js
```

You should see:
```
✅ Database seeded successfully!
Demo Credentials:
  👥 Citizen:    citizen@demo.com   / demo1234
  🏛️  Government: govt@demo.com     / demo1234
  🏭 Industry:   industry@demo.com  / demo1234
```

Start the backend server:
```bash
npm run dev
```

You should see:
```
  ✅ Running at: http://localhost:5000
  ✅ MongoDB Connected: localhost
```

---

### STEP 5 — Install Frontend Dependencies

Open a **new terminal** (`Ctrl + Shift + 5` or `Terminal → New Terminal`):

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

---

### STEP 6 — Open in Browser

Go to: **http://localhost:5173**

You'll see the EcoConnect landing page! 🎉

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👥 Citizen | citizen@demo.com | demo1234 |
| 🏛️ Government | govt@demo.com | demo1234 |
| 🏭 Industry | industry@demo.com | demo1234 |

---

## 🌐 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login & get JWT token |
| GET | /api/auth/me | Get current user |
| POST | /api/citizen/pickup | Schedule pickup |
| GET | /api/citizen/pickups | Get my pickups |
| POST | /api/citizen/report | Report an issue |
| GET | /api/citizen/leaderboard | Eco points leaderboard |
| GET | /api/government/requests | All pickup requests |
| PUT | /api/government/request/:id/assign | Assign collector |
| PUT | /api/government/request/:id/status | Update status |
| GET | /api/government/analytics | Dashboard analytics |
| GET | /api/government/complaints | Citizen complaints |
| POST | /api/industry/declare | Declare waste |
| GET | /api/industry/declarations | My declarations |
| POST | /api/industry/listing | Create marketplace listing |
| GET | /api/industry/listings | Browse all listings |
| GET | /api/industry/esg | ESG report data |
| GET | /api/industry/compliance | Compliance alerts |

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Ensure Node.js v18+ is installed: `node --version` |
| MongoDB connection error | Start MongoDB service (see Step 2) |
| Port 5000 in use | Change `PORT=5001` in `backend/.env` |
| Port 5173 in use | Run `npm run dev -- --port 3000` in frontend folder |
| Cannot login | Run `node seed.js` in backend folder first |
| CORS error | Make sure both servers are running simultaneously |
| Token expired | Click Logout and log back in |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| State | Zustand (with persistence) |
| HTTP | Axios |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (30-day tokens) |
| Password | bcryptjs (12 rounds) |
| Dev | nodemon |

---

*Built with 🌿 for a sustainable future — EcoConnect 2025*
