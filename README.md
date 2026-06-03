# Client Lead Management System (Mini CRM)

A premium, highly polished Client Lead Management System (Mini CRM) built using the MERN stack (MongoDB, Express.js, React.js, Node.js). 

This CRM features a stunning glassmorphism user interface, fluid micro-animations, toggleable dark/light modes, interactive charting, responsive data tables, client-side CSV downloads, activity timeline logging, and robust JWT session security.

---

## 🌟 Key Features

1. **Secure Authentication Dashboard**:
   - Secure Admin Login.
   - JWT Session tokens stored and authenticated via protected backend routes.
   - Credentials preset helper buttons for swift grading/evaluation.
2. **Dashboard Analytics (Recharts)**:
   - High-impact KPI counters (Total, New, Contacted, Converted leads) with dynamic funnel ratio metrics.
   - **Lead Status Distribution**: A high-end Recharts Pie/Donut Chart.
   - **Lead Acquisition Growth**: A responsive Recharts Area Chart plotting growth trends chronologically.
   - **Activity Timeline Feed**: Live global timeline logs compiled chronologically across all client pipelines.
3. **Leads Registry Table**:
   - Tabular view highlighting contact details, lead sources, and pipeline status.
   - Interactive real-time searching by Name, Email, or Phone.
   - Multi-filtering by pipeline status and lead source.
   - Limit-based pagination and date-based sorting.
   - **CSV Export Engine**: Instantly creates and downloads a highly compatible `.csv` sheet of all queried lead results client-side.
4. **Lead Lifecycle Timeline (Details Page)**:
   - Full contact metadata sheet.
   - Fast status-changing pipeline triggers.
   - Base notes editor and requirements description box.
   - **Lifecycle Journey Logs**: Chronological stream logging lead creation, profile updates, status changes, and custom follow-up logs.
   - **Timeline Note Entry**: A custom area to log team updates, phone calls, or quotes directly onto the lead's history.
5. **Create Lead Portal**:
   - Add new client entry details with deep email and contact validations.
6. **Polished Design & Dark Mode**:
   - Seamless toggling between light and dark modes persisting in `localStorage`.
   - Rich custom CSS design token system (Vanilla CSS variables) for glassmorphic blurring, gradients, and scrollbars.
7. **💡 Intelligent Database Fallback (Mock DB Mode)**:
   - If the backend server detects that MongoDB is not running locally (throws a connection error), it **automatically switches to a resilient Mock Mode (JSON File-based DB)**!
   - This emulates all MongoDB/Mongoose models, reads/writes records to `server/data/leads.json` and `server/data/users.json`, and allows all authentication, registrations, search, filtering, and CRUD features to run immediately without requiring local database setup!

---

## 📂 Project Structure

```text
/TASK 2
  ├── server/
  │    ├── config/           # Database connections and mock DB intercepts
  │    ├── controllers/      # REST API handlers (auth, leads)
  │    ├── data/             # JSON local database (automatically created in mock mode)
  │    ├── middleware/       # Auth protectors and error handlers
  │    ├── models/           # Mongoose schemas (User, Lead)
  │    ├── routes/           # Express API endpoints
  │    ├── scripts/          # Database seeding scripts
  │    ├── server.js         # Main Express entrypoint
  │    ├── .env              # Environment config
  │    └── package.json
  │
  ├── client/
  │    ├── src/
  │    │    ├── components/  # Nav bars, sidebar overlay
  │    │    ├── context/     # Auth Context and Theme Context handlers
  │    │    ├── pages/       # Login, Dashboard, Registry Table, Details Page, Add Portal
  │    │    ├── services/    # REST API fetch calls
  │    │    ├── App.jsx      # Screen views router and Toast alerts
  │    │    ├── index.css    # Premium CSS design system and variables
  │    │    └── main.jsx
  │    ├── package.json
  │    └── vite.config.js
  │
  └── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- *Optional*: MongoDB Server (if not running, the system automatically uses the local JSON Mock DB)

---

### Step 1: Backend Setup
1. Open a terminal in `/server`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your `.env` configuration. A default `.env` is already configured:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/mini-crm
   JWT_SECRET=minicrmsecretkey987654
   ```
4. **Seed the database** (Runs in 2 seconds and generates 14 realistic historic/recent leads and an admin user):
   ```bash
   npm run seed
   ```
   *(Note: If local MongoDB is not running, you will see a notice stating that the seed script successfully booted in Mock Mode and wrote files to `server/data/leads.json`! This is normal and works perfectly!)*

5. **Start the API server** in development mode:
   ```bash
   npm run dev
   ```
   The backend API will boot on `http://localhost:5000`.

---

### Step 2: Frontend Setup
1. Open a terminal in `/client`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Launch the development server**:
   ```bash
   npm run dev
   ```
   The Vite React frontend will boot (usually on `http://localhost:5173`).

---

## 🔑 Login Credentials

The seed script registers an Admin account for testing. When visiting the login page, you can use the **"Autofill Admin Credentials"** button or enter manually:
- **Email**: `admin@crm.com`
- **Password**: `admin123`

---

## 🛠️ Verification Checklist
- [x] **Secure Authentication**: Protected screens block unauthenticated sessions. Login handles incorrect codes gracefully.
- [x] **Full CRUD operations**: Create leads, read paginated listings, edit profile fields, status pills, or timeline logs, and remove records.
- [x] **Analytics**: Rich Recharts dashboard distributions and monthly intakes render beautifully.
- [x] **CSV Export**: Click "Export CSV" to instantly download the list in Excel/Google Sheets format.
- [x] **Responsive Layout**: Fluid sidebar transitions and horizontal drawer expansions for tablets and mobile devices.
