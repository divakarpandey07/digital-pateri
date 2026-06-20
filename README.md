# 🏡 Digital Pateri — Smart Village Portal

> A full-stack smart village management system for **Pateri Gram Panchayat**, Kaimur, Bihar.

![Pateri Portal](https://img.shields.io/badge/Status-Live-brightgreen) ![Node](https://img.shields.io/badge/Node.js-v18+-blue) ![React](https://img.shields.io/badge/React-v19-61dafb) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## 🌟 Features

- 🏛️ **Panchayat Dashboard** — Announcements, notices, village stats
- 👨‍👩‍👧‍👦 **Resident Directory** — 2500+ verified residents with voter-record verified registration
- 📋 **Complaints System** — Register and track panchayat grievances
- 🩺 **Health & Blood Bank** — Blood donor registry
- 🌾 **Agriculture Hub** — Mandi rates, crop alerts, farmer marketplace
- 🗺️ **Village Map** — GPS-tagged village assets and houses
- 🏪 **Marketplace** — Local business directory
- 🤝 **Volunteer Network** — Community volunteer management
- 📊 **Demographics** — Real-time village statistics
- 🤖 **AI Chatbot** — Panchayat assistant powered by Gemini AI
- 📅 **Village Timeline** — Historical milestones
- 🏆 **Achievements** — Village recognition board

---

## 🔐 Resident Registration (Voter Record Verified)

Residents can register using their **official voter list data**:

1. Enter your **Full Name** (as in voter list)
2. Enter **Email** and **Password**
3. Verify using **EITHER**:
   - **Voter ID Card Number (EPIC)** — e.g. `BR/38/231/270048`
   - **Ward Number** — e.g. `01`, `02`, `03`

The system automatically matches your profile from the official voter roster.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (30-day tokens) |
| **Maps** | Leaflet.js |
| **Charts** | Chart.js |
| **AI** | Google Gemini API |
| **Images** | Cloudinary |

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/digital-pateri.git
cd digital-pateri
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Gemini API key etc.

# Seed the database with Pateri resident data
npm run seed

# Start backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start frontend dev server
npm run dev
```

Frontend will run on **http://localhost:5173**  
Backend API will run on **http://localhost:5000**

---

## 📁 Project Structure

```
digital-pateri/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── middleware/        # Auth, error handling
│   ├── services/         # Business logic
│   ├── scripts/
│   │   ├── seed.js           # Main database seeder ⭐
│   │   ├── voters.json       # Official voter roster (2500+ residents)
│   │   ├── ration_data.json  # Ration card data
│   │   └── import_ration_data.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/        # Main page components
│   │   ├── components/   # Reusable components
│   │   ├── store/        # Zustand state management
│   │   └── utils/        # Translations, helpers
│   └── index.html
└── README.md
```

---

## 👤 Default Accounts (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@pateri.in` | `admin123` |
| Mukhiya | `panchayat@pateri.in` | `panchayat123` |
| Sarpanch | `sarpanch@pateri.in` | `sarpanch123` |
| Doctor | `haidar@pateri.in` | `haidar123` |
| Volunteer/Student | `manish@pateri.in` | `manish123` |
| Electrician | `pappu@pateri.in` | `pappu123` |
| Shop Owner | `shanti@pateri.in` | `shanti123` |
| PACS Adhyaksh | `naushad@pateri.in` | `naushad123` |

> ⚠️ Change passwords in production before deploying publicly.

---

## 🌐 Supported Languages

- **Hindi (हिन्दी)**
- **Hinglish (Hindi + English mix)**
- **English**

---

## 📜 License

This project is developed for **Pateri Gram Panchayat**, Kaimur, Bihar.  
For educational and governance digitization purposes.

---

*Made with ❤️ for Digital India — Pateri Smart Village Initiative*
