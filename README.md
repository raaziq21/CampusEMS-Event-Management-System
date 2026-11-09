# Campus Event Management System (EMS)

A production-grade, full-stack Event Management System built for **BCA Cybersecurity College Project Evaluation**. The platform provides secure, role-based workflows for students to discover and register for campus events, faculty organizers to manage their event portfolios, and administrators to govern the platform with full CRUD and oversight capabilities.

---

## 1. Technology Stack

This application is strictly built using the mandatory core web technologies without modern meta-frameworks:

| Tier | Technology | Purpose & Implementation Details |
|------|------------|----------------------------------|
| **Frontend Structure** | HTML5 | Semantic structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<footer>`) |
| **Frontend Styling** | Custom CSS3 | Clean custom design system using CSS Variables, Flexbox, Grid, and responsive breakpoints (no external CSS frameworks like Bootstrap/Tailwind) |
| **Frontend Framework** | AngularJS 1.8.x | Client-side Single Page Application (SPA) architecture with `ngRoute`, two-way data binding, directives, and custom services |
| **Icons & Typography** | FontAwesome 6 & Inter | CDN-loaded vector icons and Google Fonts |
| **Backend Runtime** | Node.js (v18+) | Non-blocking, asynchronous JavaScript event-driven server runtime |
| **Backend Framework** | Express.js 5.x | RESTful API server, routing, custom middleware pipeline, and static SPA serving |
| **Database** | MongoDB Atlas (Cloud) | Multi-node replica set cloud document database with persistent storage |
| **ODM / Modeling** | Mongoose 9.x | Strict schema validation, compound unique indexing, hooks, and aggregation pipelines |
| **Security & Auth** | JWT & BcryptJS | Stateless cryptographic token authorization (`Bearer <token>`) and 10-salt-round password encryption |

---

## 2. System Architecture & Features

### Public Portal (Guest Access)
- **Home Landing Page (`#!/`)**: Dynamic hero banner, platform metric counters, featured campus summits, and role architecture highlights.
- **Discover Events Catalog (`#!/events`)**: Real-time keyword search (title/venue/topic), category filter, status filter, and sort options.
- **Event Details Page (`#!/events/:id`)**: Banner media, comprehensive agenda, venue schedule, faculty organizer card, live seat fill progress meter, and instant seat reservation.
- **About Page (`#!/about`)**: Project architecture narrative, technology breakdown, and cybersecurity design principles.
- **Technical Support Page (`#!/contact`)**: Campus helpdesk contacts, department venue info, and inquiry submission form.
- **Login Portal (`#!/login`)**: Secure credential authentication with one-click quick-fill buttons for testing all three roles.
- **Student Registration (`#!/register`)**: Real-time validated participant onboarding.

### Participant Portal (`#!/dashboard/participant/overview`)
- **Telemetry Cards**: Total Enrolled Events, Upcoming Active Summits, and Cancelled Registrations.
- **Bookings Roster**: Searchable and filterable history of student registrations.
- **Seat Cancellation**: Working cancellation modal that releases the seat back to the event capacity pool and updates status in real-time.

### Faculty Organizer Desk (`#!/dashboard/organizer/overview`)
- **Portfolio Analytics**: Assigned Events count, Total Enrolled Students across all assigned events, and Average Seat Fill %.
- **Create Event Modal**: Form with live banner image preview to launch new workshops or seminars.
- **Edit Event Modal**: Update schedule, location, capacity, and change status from `upcoming` to `ongoing` or `completed`.
- **Attendee Roster Modal**: Live list of registered students with search and **Download Attendees CSV** button.

### Administrator Console (`#!/dashboard/admin/overview`)
- **Platform-Wide Analytics**: Total Users (broken down by Student, Organizer, Admin), Total Events (by status), Total Registrations, and Aggregated Seat Utilization Rate %.
- **Recent Platform Telemetry**: Live feeds of recently published events and incoming student registrations.
- **Complete Event CRUD**: Create events (with faculty organizer assignment), edit any event, and delete events with automatic cascading registration cleanup.
- **User & Role Governance**: Directory of all registered users with search and role filters; modify user roles (`Participant`, `Organizer`, `Admin`) with self-demotion protection; delete accounts with self-deletion protection.

### User Profile & Security Center (`#!/dashboard/profile`)
- User identity banner with role badge and membership timestamp.
- **Profile Information Tab**: Update personal name and contact phone number.
- **Security Tab**: Authenticated password change requiring current password verification with bcrypt re-hashing.

---

## 3. Demo Accounts for Academic Evaluation

The database is pre-seeded with realistic college campus data for immediate evaluation:

| Role | Name | Email | Password | Access Level |
|------|------|-------|----------|--------------|
| **Admin** | Prof. Rajesh Sharma | `admin@ems.edu` | `College@2026` | Full platform governance, user role modification, event CRUD |
| **Organizer** | Dr. Anita Roy | `organizer@ems.edu` | `College@2026` | Assigned event management, attendee roster inspection, CSV export |
| **Participant** | Aarav Patel | `participant@ems.edu` | `College@2026` | Event discovery, instant seat booking, registration withdrawal |
| **Participant (2)**| Sneha Kulkarni | `sneha@ems.edu` | `College@2026` | Secondary student account for multi-seat testing |

---

## 4. Local Installation & Setup

### Prerequisites
- Node.js (version 18 or higher)
- Free MongoDB Atlas Cluster (or local MongoDB server)
- Modern Web Browser (Chrome, Edge, Firefox)

### Step-by-Step Instructions

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/your-username/ems-project.git
   cd ems-project
   ```

2. **Install Server Dependencies:**
   ```powershell
   cd server
   npm.cmd install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside the `server/` directory (you can copy `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ems_db?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_here_replace_with_a_strong_random_string
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5000
   BCRYPT_SALT_ROUNDS=10
   ```

4. **Seed Database with Sample Data:**
   Populate demo accounts, 8 realistic events, and student registrations:
   ```powershell
   node seed.js
   ```

5. **Start the Express Unified Server:**
   ```powershell
   node server.js
   ```

6. **Open Application in Browser:**
   Navigate to **`http://localhost:5000`**. The AngularJS frontend is served directly by the Express server.

---

## 5. REST API Endpoint Reference

All protected API endpoints require an `Authorization: Bearer <token>` header, automatically handled by the AngularJS `AuthInterceptor`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new student participant account |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile from token |

### Events (`/api/events`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/events` | Public | List events with search, category, status, and organizer filters |
| `GET` | `/api/events/:id` | Public | Retrieve detailed event information by ID |
| `POST` | `/api/events` | Admin / Organizer | Create a new campus event |
| `PUT` | `/api/events/:id` | Admin / Organizer | Update event details, schedule, capacity, and status |
| `DELETE`| `/api/events/:id` | Admin | Delete event and trigger cascading registration cleanup |
| `PUT` | `/api/events/:id/assign` | Admin | Assign or reassign faculty organizer to event |

### Registrations (`/api/registrations`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/registrations` | Participant | Register authenticated student for an event |
| `GET` | `/api/registrations/my` | Authenticated | Retrieve all registrations for the logged-in student |
| `PUT` | `/api/registrations/:id/cancel`| Participant | Cancel event registration and release seat |
| `GET` | `/api/registrations/event/:id` | Admin / Organizer | Retrieve attendee roster for an event |
| `GET` | `/api/registrations` | Admin | Platform-wide registration records |

### User Management & Profile (`/api/users`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/users/profile/me` | Authenticated | Retrieve user profile details |
| `PUT` | `/api/users/profile/me` | Authenticated | Update user name and phone contact |
| `PUT` | `/api/users/profile/password`| Authenticated | Change account password with current password verification |
| `GET` | `/api/users/stats/dashboard` | Admin | Aggregated platform statistics and capacity utilization |
| `GET` | `/api/users` | Admin | List all registered accounts with role filter |
| `GET` | `/api/users/:id` | Admin | Retrieve single user record by ID |
| `PUT` | `/api/users/:id/role` | Admin | Promote or demote user role (with self-demotion protection) |
| `DELETE`| `/api/users/:id` | Admin | Delete user account (with self-deletion protection) |

---

## 6. Step-by-Step Cloud Deployment Guide (Render.com)

This application is architected for single-service deployment where Express serves both the REST API and the AngularJS SPA static frontend on a single port.

### Deploying on Render.com (Free Tier):

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy: Full-Stack Event Management System"
   git push origin main
   ```

2. **Create a Web Service on Render:**
   - Log into [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** > **Web Service**.
   - Connect your GitHub repository.

3. **Configure the Service Settings:**
   - **Name:** `campus-event-management-system`
   - **Environment:** `Node`
   - **Region:** Any close region (e.g., Singapore / Frankfurt / Oregon)
   - **Branch:** `main`
   - **Build Command:** `npm install --prefix server`
   - **Start Command:** `node server/server.js`

4. **Configure Environment Variables on Render:**
   Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave default, Render sets `PORT` automatically)
   - `MONGODB_URI` = `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ems_db?retryWrites=true&w=majority`
   - `JWT_SECRET` = `<generate-a-strong-random-secret-key>`
   - `JWT_EXPIRES_IN` = `7d`
   - `BCRYPT_SALT_ROUNDS` = `10`
   - `CLIENT_URL` = `https://<your-render-app-name>.onrender.com`

5. **Seed Database on Cloud:**
   Once deployed, run the seed script from Render's **Shell** tab:
   ```bash
   node server/seed.js
   ```

Your application will be live at `https://<your-app-name>.onrender.com`!

---

## 7. Project Folder Structure

```
EMS_Project/
├── package.json                         # Root package.json for cloud deployments
├── .gitignore                           # Excludes node_modules, .env, OS files
├── .env.example                         # Environment variable template
├── ARCHITECTURE.md                      # Architecture decisions & database schemas
├── DEVELOPMENT_PLAN.md                  # 12-stage milestone roadmap
├── PROJECT_REPORT_NOTES.md              # Academic report notes, diagrams & screenshot guide
├── README.md                            # Comprehensive project documentation
│
├── server/                              # ── Backend Tier (Node.js & Express) ──
│   ├── config/
│   │   ├── db.js                        # MongoDB connection & reconnection lifecycle
│   │   └── index.js                     # Centralized environment configuration
│   ├── controllers/
│   │   ├── authController.js            # Login, registration, getMe
│   │   ├── eventController.js           # Full event CRUD & organizer assignment
│   │   ├── registrationController.js    # Event bookings, cancellations, attendee lists
│   │   └── userController.js            # Admin stats, role changes, profile & password
│   ├── middleware/
│   │   ├── auth.js                      # JWT verification & req.user extraction
│   │   ├── authorize.js                 # Role-based access control guard
│   │   ├── errorHandler.js              # Centralized JSON error formatting
│   │   └── notFound.js                  # 404 handler for undefined API routes
│   ├── models/
│   │   ├── Event.js                     # Event schema with virtuals & hooks
│   │   ├── Registration.js              # Compound unique index & seat count hooks
│   │   └── User.js                      # User schema with bcrypt password masking
│   ├── routes/
│   │   ├── auth.js                      # Auth routes
│   │   ├── events.js                    # Event routes
│   │   ├── health.js                    # Server & DB health check route
│   │   ├── registrations.js             # Registration routes
│   │   └── users.js                     # User management & profile routes
│   ├── utils/
│   │   ├── ApiError.js                  # Custom operational error class
│   │   └── responseFormatter.js         # Unified JSON success/error response helpers
│   ├── validators/
│   │   └── index.js                     # express-validator schemas for input hygiene
│   ├── package.json                     # Backend dependencies & scripts
│   ├── seed.js                          # Database seeding script (4 accounts, 8 events)
│   └── server.js                        # Express server entry point & static SPA host
│
└── client/                              # ── Frontend Tier (AngularJS 1.8.x SPA) ──
    ├── index.html                       # Application shell & CDN dependencies
    ├── assets/
    │   └── css/
    │       └── style.css                # Custom CSS3 design system (Variables/Flexbox/Grid)
    └── app/
        ├── app.js                       # AngularJS module, ngRoute & JWT AuthInterceptor
        ├── components/
        │   ├── alert/                   # Toast alerts directive
        │   ├── event-card/              # Reusable event card directive
        │   ├── footer/                  # Academic project footer directive
        │   ├── loader/                  # CSS animation spinner directive
        │   └── navbar/                  # Role-aware sticky navigation directive
        ├── services/
        │   ├── alert.service.js         # Alert notifications service
        │   ├── auth.service.js          # Authentication, token storage, role checks
        │   ├── event.service.js         # Event API service
        │   ├── registration.service.js  # Registration API service
        │   └── user.service.js          # User management & platform stats service
        └── views/
            ├── auth/
            │   ├── login/               # Portal login with quick-fill buttons
            │   └── register/            # Student participant registration
            ├── dashboard/
            │   ├── admin/overview/      # Admin console (Analytics, Events CRUD, Users)
            │   ├── organizer/overview/  # Organizer desk (Events, Modals, CSV export)
            │   ├── participant/overview/# Participant desk (Bookings, Cancellation)
            │   └── profile/             # Profile & security center (Password change)
            └── public/
                ├── about/               # Academic architecture overview
                ├── contact/             # Campus support & inquiry submission
                ├── event-detail/        # Event page with instant seat booking
                ├── events/              # Discover events catalog (Search & filters)
                └── home/                # Landing portal with hero & featured events
```

---

## 8. License & Academic Disclaimer

This project is developed solely for educational purposes as part of the **BCA Cybersecurity Degree Program**. All rights reserved.
