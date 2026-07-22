# 🏥 SafeDose MedGuide

SafeDose MedGuide is a state-of-the-art, AI-powered medicine safety guide and health assistant application. It provides users with reliable medical information, dosage guidelines, side effects, and potentially dangerous drug-drug interactions, alongside an interactive medical AI chatbot powered by Google Gemini API.

---

## ✨ Key Features

- **🔍 Intelligent Medicine Search:** Find medicines by their brand name, generic name, category, or active ingredients.
- **⚠️ Drug-Drug Interaction Checker:** Verify if combining two medications might lead to adverse side effects or reduce efficacy.
- **💬 AI-Powered Health Assistant:** An empathetic, Gemini-powered chatbot that answers general medical questions, dosage queries, and provides helpful safety tips (with strict medical disclaimers).
- **📋 Detailed Medicine Guides:** View comprehensive detail sheets including dosage forms, strengths, storage conditions, pregnancy warnings, and breastfeeding precautions.
- **💖 Favorites & Bookmarks:** Save frequently searched medicines for quick offline reference.
- **📊 Interactive Dashboard:** A roles-based dashboard allowing users, pharmacists, and system administrators to manage medicines, categories, manufacturers, and view analytics.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React + Vite (SPA)
- **Styling:** Tailwind CSS (Custom Modern Palette & Responsive Design)
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Routing:** React Router DOM

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Security:** Helmet, Rate Limiters, CORS, bcryptjs for password hashing
- **Authentication:** JWT (JSON Web Tokens) with Refresh Tokens
- **AI Engine:** Google Generative AI (Gemini 1.5 Flash API)
- **Logs:** Morgan HTTP request logger

---

## 📁 Repository Structure

```text
SafeDose-MedGuide/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Shared UI components (Navbar, etc.)
│   │   ├── pages/          # Page views (Home, Login, AIChat, Medicines, etc.)
│   │   ├── utils/          # Client-side utility functions
│   │   ├── App.jsx         # App routing and state
│   │   ├── main.jsx        # App entrypoint
│   │   └── index.css       # Global styles & Tailwind directives
│   ├── index.html          # Vite HTML template
│   └── vite.config.js      # Vite build & proxy settings
│
├── server/                 # Backend Node/Express API
│   ├── src/
│   │   ├── config/         # Database and Gemini AI configurations
│   │   ├── controllers/    # API Controllers (Auth, Medicine, AI Chat, etc.)
│   │   ├── middleware/     # Security, rate-limiting, and error handlers
│   │   ├── models/         # Mongoose schemas (User, Medicine, SideEffect, etc.)
│   │   ├── routes/         # Express endpoints
│   │   ├── seeders/        # Initial database seed script and datasets
│   │   └── utils/          # Backend helper functions
│   └── server.js           # API entry point
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))

---

### 1. Setup Backend (Server)

1. **Navigate to the server folder:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `server` directory and configure the variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri_here
   JWT_SECRET=your_super_secure_jwt_secret
   JWT_REFRESH_SECRET=your_super_secure_jwt_refresh_secret
   JWT_EXPIRE=1h
   JWT_REFRESH_EXPIRE=7d
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Seed the Database:**
   Populate the database with roles, test users, categories, manufacturers, medicines, and drug interactions:
   ```bash
   npm run seed
   ```

5. **Start the API server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm run start
   ```
   *The server will run on `http://localhost:5000`. You can check server health at `http://localhost:5000/api/health`.*

---

### 2. Setup Frontend (Client)

1. **Navigate to the client folder:**
   ```bash
   cd ../client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   
   If your package.json is configured with Next.js scripts but you are using the Vite configuration, run Vite directly:
   ```bash
   npx vite
   ```
   
   *Or if you have corrected the scripts inside `client/package.json` to use `vite`:*
   ```bash
   npm run dev
   ```
   *The client application will run on `http://localhost:3000`.*

---

## 🔐 Seeding & Test Credentials

Running `npm run seed` in the `server` directory creates several roles and the following test users for immediate testing:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@safedose.com` | `Admin@123` | Full access, user/medicine management, system configuration |
| **Healthcare Professional (Pharmacist)** | `pharmacist@safedose.com` | `Pharma@123` | Medicine management, report viewing |
| **Regular User (Patient)** | `user@safedose.com` | `User@123` | View medicines, interact with AI chat, manage favorites |

---

## 🛡️ Medical Disclaimer
**SafeDose MedGuide** is an informational tool powered by artificial intelligence. The information provided is for educational and general knowledge purposes only and is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified physician, pharmacist, or healthcare provider regarding any medical condition or prescription regimen.
