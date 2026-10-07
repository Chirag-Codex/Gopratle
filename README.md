# GoPratle - Requirement Posting Flow

A full-stack requirement posting workflow built with **Next.js** (frontend) and **Node.js + Express + MongoDB** (backend). This application enables event organizers to post tailored requirements across three distinct event categories: **Event Planners**, **Performers**, and **Event Crew**.

---

## 🌟 Features & Multi-Step Flow

The application implements a 4-step wizard that adapts dynamically based on the category selected:

- **Step 1: Event Basics**
  - Event Name, Event Type (Wedding, Corporate, Concert, Festival, Birthday, etc.)
  - Start Date & Time, Optional End Date & Time (with cross-field validation: `endDate >= startDate`)
  - Event Location (City) and Optional Venue
  - **Category Selector**: Choose between **Event Planner**, **Performer**, or **Event Crew**.

- **Step 2: Category-Specific Details (Adaptive)**
  - **Planner**: Expected guests, planning support type (`full`, `partial`, `day-of-coordination`), services needed checkboxes (`venue-sourcing`, `decor`, `catering`, `logistics`, etc.).
  - **Performer**: Performer type (`singer`, `dj`, `band`, `dancer`, etc.), performance duration in minutes, headcount, and genres.
  - **Crew**: Crew role selection (`security`, `sound`, `lighting`, `stage-hand`, `usher`, etc.), number of crew members, and daily shift hours.

- **Step 3: Budget & Logistics (Adaptive)**
  - **Planner**: Minimum & Maximum budget in INR (with cross-field validation: `budgetMax >= budgetMin`), special planning notes.
  - **Performer**: Budget range (min & max), sound system provided (Yes/No), stage provided (Yes/No), technical notes.
  - **Crew**: Daily pay per person in INR, provisions provided (Meals, Transport, Accommodation), briefing instructions.

- **Step 4: Review & Submission**
  - A comprehensive summary card showing all entered information.
  - Step-by-step navigation allowing edits before final submission.
  - Submits payload to the Express backend and saves to MongoDB under the selected category.
  - Success screen confirming submission.

---

## 🏗️ Architecture & Key Design Decisions

### 1. MongoDB Schema Inheritance using Discriminators
Instead of maintaining three disconnected collections or a single messy schema with tons of null fields, we used **Mongoose Discriminators**:
- **Base Collection (`requirements`)**: Stores shared event metadata (`eventName`, `eventType`, `startDate`, `endDate`, `location`, `venue`, `category`).
- **Discriminator Models**:
  - `Planner`: Adds strict sub-schema for `details` (guests, services needed, budget range).
  - `Performer`: Adds strict sub-schema for `details` (performer type, duration, genres, provisions).
  - `Crew`: Adds strict sub-schema for `details` (roles, shift hours, daily pay, provisions).
- **Benefit**: Querying all requirements or filtering by category (`GET /api/requirements?category=planner`) runs over a single indexed collection, while maintaining strict schema validation per category.

### 2. Defensive Request-Level Validation
- The backend controller validates `category` upfront before touching the database.
- Request payload is sanitized by picking only allowed fields, preventing parameter pollution and mass-assignment vulnerabilities.
- Cross-field validations (e.g. `endDate >= startDate` and `budgetMax >= budgetMin`) ensure data integrity at the database layer.

### 3. Unified API Response Envelope
All API endpoints follow a predictable response structure:
- **Success**: `{ success: true, message: "...", data: ... }`
- **Error**: `{ success: false, message: "...", errors?: [{ field, message }] }`

---

## 📁 Project Structure

```text
Gopratle/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # MongoDB connection logic
│   │   ├── controllers/
│   │   │   └── requirementController.js # CRUD handlers
│   │   ├── middleware/
│   │   │   └── errorHandler.js        # Global error & 404 middleware
│   │   ├── models/
│   │   │   └── Requirement.js         # Base schema & Discriminator models
│   │   ├── routes/
│   │   │   └── requirementRoutes.js   # /api/requirements route definitions
│   │   ├── app.js                     # Express app setup (cors, helmet, json)
│   │   └── server.js                  # Server entry & graceful shutdown
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── globals.css                # Tailwind CSS imports & base styles
│   │   ├── layout.js                  # Root layout & page metadata
│   │   └── page.js                    # 4-step adaptive form component
│   ├── .env.example
│   ├── next.config.mjs
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://127.0.0.1:27017/gopratle`) or MongoDB Atlas URI

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Ensure `backend/.env` has:
```env
PORT=5000
MONGODB_URL=mongodb://127.0.0.1:27017/gopratle
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 2. Frontend Setup
Open a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

Ensure `frontend/.env.local` has:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
# Application loads at http://localhost:3000
```

---

## 📡 API Documentation

### 1. Create Requirement
- **Endpoint**: `POST /api/requirements`
- **Content-Type**: `application/json`

#### Example Payload (Event Planner)
```json
{
  "eventName": "Tech Connect 2026",
  "eventType": "corporate",
  "startDate": "2026-11-20T10:00:00.000Z",
  "location": "Bengaluru",
  "venue": "Palace Grounds",
  "category": "planner",
  "details": {
    "expectedGuests": 300,
    "servicesNeeded": ["full-planning", "decor"],
    "budgetMin": 50000,
    "budgetMax": 100000,
    "planningSupport": "full",
    "notes": "Needs corporate decor experience"
  }
}
```

#### Example Payload (Performer)
```json
{
  "eventName": "Live Beats Music Fest",
  "eventType": "concert",
  "startDate": "2026-12-15T18:00:00.000Z",
  "location": "Goa",
  "category": "performer",
  "details": {
    "performerType": "singer",
    "genres": ["Bollywood", "Acoustic"],
    "performanceDurationMinutes": 90,
    "numberOfPerformers": 2,
    "budgetMin": 40000,
    "budgetMax": 80000,
    "soundSystemProvided": true,
    "stageProvided": true,
    "notes": "Microphones and monitors needed"
  }
}
```

#### Example Payload (Crew)
```json
{
  "eventName": "City Marathon Expo",
  "eventType": "festival",
  "startDate": "2026-11-25T06:00:00.000Z",
  "location": "Delhi",
  "category": "crew",
  "details": {
    "roles": [
      { "role": "security", "count": 5 }
    ],
    "shiftHoursPerDay": 8,
    "payPerPersonPerDay": 1500,
    "mealsProvided": true,
    "transportProvided": true,
    "accommodationProvided": false,
    "notes": "Call time is 5:30 AM"
  }
}
```

- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Requirement created successfully",
  "data": {
    "_id": "6ac67c741da496bee452ce2f",
    "eventName": "Tech Connect 2026",
    "eventType": "corporate",
    "startDate": "2026-11-20T10:00:00.000Z",
    "location": "Bengaluru",
    "category": "planner",
    "details": { ... },
    "createdAt": "2026-10-07T22:38:00.000Z"
  }
}
```

### 2. Fetch Requirements
- **Endpoint**: `GET /api/requirements`
- **Optional Query**: `?category=planner` (or `performer`, `crew`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Requirements fetched successfully",
  "data": [ ... ]
}
```

### 3. Fetch Single Requirement
- **Endpoint**: `GET /api/requirements/:id`
- **Response (200 OK)**: Returns the single requirement document.

---

## 🧪 Testing & Edge Cases Handled

The application thoroughly handles and validates edge cases both client-side and server-side:

1. **Invalid Category**:
   - Calling `POST /api/requirements` with `category: "caterer"` returns `400 Bad Request` with message: `"Category must be planner, performer, or crew"`.
2. **End Date Before Start Date**:
   - Client prevents proceeding to Step 2, and Mongoose schema validator rejects with `"End date cannot be before start date"`.
3. **Empty Services Array for Planner**:
   - Schema validator requires at least 1 service; client requires selection before advancing.
4. **Invalid Number Inputs & Budget Mismatch**:
   - Rejects negative budgets and enforces `budgetMax >= budgetMin`.
5. **Malformed MongoDB ID**:
   - `GET /api/requirements/invalidid` gracefully caught by `CastError` handler returning `400 Bad Request` instead of a 500 crash.

---

## 📌 Assumptions & Limitations

1. **Currency**: All budgets and pay figures are assumed to be in Indian Rupees (INR ₹).
2. **Single User / Public Posting**: Authentication (JWT / login) is currently omitted as per assignment scope; any organizer can post a requirement.
3. **File Uploads**: Pitch decks, performer demo reels, or tech riders are currently captured as notes/descriptions rather than binary file uploads (e.g. S3/Cloudinary).

---

## 🔮 Future Improvements

1. **User Authentication & Role-Based Access Control**: Organizer accounts with dashboards to view and manage posted requirements.
2. **Matching Engine**: Automatically notify registered planners, performers, and crew whose profiles match newly posted requirements.
3. **File Attachments**: Upload rider contracts, demo MP3/MP4 files, and floor plans.
4. **Email / SMS Alerts**: Real-time notifications via SendGrid/Twilio upon requirement submission.

