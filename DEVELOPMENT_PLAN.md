# Event Management System — Development Plan

This document outlines the complete stage-by-stage development plan for the Event Management System.

---

## Stage 1: Project Architecture and Folder Structure ✅

**Goal:** Establish project foundation.

- [x] Analyze requirements and identify technical decisions
- [x] Design folder structure for frontend and backend
- [x] Create README.md with project overview
- [x] Create .gitignore
- [x] Create .env.example with placeholder variables
- [x] Create this development plan
- [x] Document architecture decisions

---

## Stage 2: Backend Setup and MongoDB Connection ✅

**Goal:** Get a running Express server connected to MongoDB.

- [x] Initialize `server/package.json` with `npm init`
- [x] Install core dependencies: express, mongoose, dotenv, cors
- [x] Create `server/server.js` — Express app entry point
- [x] Create `server/config/db.js` — MongoDB connection using Mongoose
- [x] Create `server/config/index.js` — centralized config from environment variables
- [x] Add basic health-check route (`GET /api/health`)
- [x] Add global error handling middleware
- [x] Verify Express server starts and responds
- [x] Verify MongoDB connection handling (graceful fallback when unavailable)

**Deliverable:** A running Express server that connects to MongoDB and responds to a health-check request.

---

## Stage 3: Database Models and API Development ✅

**Goal:** Define Mongoose schemas and build CRUD APIs.

- [x] Create `User` model (name, email, password, role, timestamps)
- [x] Create `Event` model (title, description, date, location, capacity, category, status, organizer ref, timestamps, image URL with fallback)
- [x] Create `Registration` model (user ref, event ref, status, timestamps; compound unique index on user+event)
- [x] Build auth controller: register, login, get-me
- [x] Build event API routes: GET all (with filtering/search/pagination), GET by ID, POST, PUT, DELETE
- [x] Build registration API routes: POST register, GET user registrations, GET event registrations, PUT cancel
- [x] Build user API routes (admin): GET all users, GET by ID, PUT role, DELETE, dashboard stats, profile
- [x] Create input validation with express-validator
- [x] Create auth middleware (JWT verification) and authorize middleware (role check)
- [x] Mount all routes in server.js
- [x] Test all endpoints — all pass

**Deliverable:** Complete REST API with full CRUD for events, users, and registrations, backed by MongoDB.

---

## Stage 4: Authentication and Role-Based Authorization ✅

**Goal:** Secure the application with JWT auth and role enforcement.

- [x] Install bcryptjs and jsonwebtoken
- [x] Create auth controller: register, login, get-current-user
- [x] Hash passwords on registration with bcrypt (10 salt rounds)
- [x] Generate JWT on successful login
- [x] Create `auth` middleware — verify JWT and attach user to request
- [x] Create `authorize` middleware — check user role against allowed roles
- [x] Protect all dashboard and management routes
- [x] Create rich database seed script (`server/seed.js`) with demo accounts
- [x] Test protected routes with valid/invalid/missing tokens
- [x] Test role-based access (participant cannot access admin routes, etc.)

**Deliverable:** Fully secured API where every protected route requires valid JWT and correct role.

---

## Stage 5: Frontend Layout and Public Pages ✅

**Goal:** Build the AngularJS SPA shell, custom CSS3 system, and public-facing pages.

- [x] Create `client/index.html` — load AngularJS 1.8.2 via CDN, set up ng-app
- [x] Create `client/app/app.js` — AngularJS module with ngRoute configuration and JWT interceptor
- [x] Create custom CSS3 design system (`client/assets/css/style.css`) with CSS variables, Flexbox & Grid
- [x] Build navbar component with responsive design and role-aware state
- [x] Build footer component with academic and project stack metadata
- [x] Build alert and loader components
- [x] Build reusable event-card directive
- [x] Create home page view and controller with hero section and featured events
- [x] Create events listing page with search, category/status filters, and sorting
- [x] Create event detail page with registration action and capacity meter
- [x] Create about page with architecture and cybersecurity highlights
- [x] Create contact page with department helpdesk information and inquiry form
- [x] Create login page with quick-fill demo credentials
- [x] Create participant registration page
- [x] Configure Express to serve static `client/` frontend directly on port 5000
- [x] Populate MongoDB Atlas using `node seed.js` (4 users, 8 events, sample registrations)
- [x] Verified frontend loads and communicates with backend API

**Deliverable:** A navigable AngularJS SPA with all public and auth pages rendered, styled, and connected to MongoDB Atlas.

---

## Stage 6: Participant & Organizer Functionality + Profile Security ✅

**Goal:** Build the participant dashboard, profile security center, and organizer event management.

- [x] Create participant dashboard layout with sidebar navigation
- [x] Build summary stat cards (Total Registered, Upcoming, Cancelled/Past)
- [x] Build search & status filter for student registrations
- [x] Build registrations table with event category, timing, venue, and status
- [x] Implement working registration cancellation with confirmation modal and live seat count update
- [x] Build user profile management with update form (`PUT /api/users/profile/me`)
- [x] Build password change form with current password verification (`PUT /api/users/profile/password`)
- [x] Build organizer dashboard with analytics (Total Events, Total Registrations, Fill Rate %)
- [x] Build "Create New Event" modal with live banner image preview (`POST /api/events`)
- [x] Build "Edit Event" modal for permitted fields & status update (`PUT /api/events/:id`)
- [x] Build "View Participants" roster modal (`GET /api/registrations/event/:eventId`)
- [x] Implement client-side CSV download/export for student attendee lists
- [x] Connected all actions to real Express APIs & MongoDB Atlas

**Deliverable:** Participants can discover, register, cancel, and manage credentials. Organizers can manage events, update statuses, and export attendee rosters.

---

## Stage 7: Admin Functionality & Platform Management ✅

**Goal:** Build the admin dashboard with full platform management capabilities.

- [x] Create admin dashboard layout with sidebar navigation and tab switching
- [x] Build platform-wide analytics cards (Total Users with role breakdown, Total Events by status, Total Registrations, Seat Utilization %)
- [x] Build Full Event Management tab (view all events across all organizers with search, category, and status filters)
- [x] Implement Admin Create Event modal with Organizer assignment dropdown (`POST /api/events`)
- [x] Implement Admin Edit Event modal with Organizer reassignment (`PUT /api/events/:id`)
- [x] Implement Admin Delete Event modal with cascading registration cleanup (`DELETE /api/events/:id`)
- [x] Implement Attendee Roster modal with search and CSV download for any event
- [x] Build User & Role Governance tab (search by name/email/phone, role filter)
- [x] Implement role promotion/demotion (`PUT /api/users/:id/role`) with self-demotion protection
- [x] Implement user account deletion (`DELETE /api/users/:id`) with self-deletion protection and registration cleanup
- [x] Verified all Admin API endpoints and security guards with automated tests

**Deliverable:** Admin has complete oversight and CRUD authority over events, organizers, and user accounts.

---

## Stage 8: Organizer Functionality ✅

**Goal:** Build the organizer dashboard for assigned event management.

- [x] Create organizer dashboard layout with sidebar
- [x] Build overview showing assigned events summary & analytics
- [x] Build assigned events list with live seat fill progress meters
- [x] Implement edit for permitted event fields and status
- [x] Build participant roster list view for each assigned event
- [x] Implement client-side CSV export of attendees
- [x] Connect all actions to real backend APIs & MongoDB Atlas

**Deliverable:** Organizers can manage their assigned events, view participants, and export rosters.

---

## Stage 9: Frontend-Backend Integration ✅

**Goal:** Ensure seamless integration and polish the user experience.

- [x] Create AngularJS `AuthService` — login, register, token storage, logout
- [x] Create `EventService` — all event API calls
- [x] Create `RegistrationService` — registration API calls
- [x] Create `UserService` — user management & platform statistics API calls
- [x] Add HTTP interceptor for JWT token injection (`Bearer <token>`)
- [x] Add HTTP interceptor for 401 handling (redirect to login with alert)
- [x] Implement route guards (redirect unauthorized users based on role)
- [x] Add form validation with user-friendly error messages
- [x] Add loading spinners and success/error alerts
- [x] Tested complete user flows for Admin, Organizer, and Participant

**Deliverable:** Fully integrated application where every frontend action communicates with the real backend.

---

## Stage 10: Testing, Bug Fixing, and Security Checks ✅

**Goal:** Verify functionality, fix bugs, and harden security.

- [x] Tested all user flows end-to-end (admin, organizer, participant)
- [x] Verified role-based access control (backend rejects unauthorized requests with HTTP 403)
- [x] Verified duplicate registration prevention via MongoDB compound unique index `{ user: 1, event: 1 }`
- [x] Verified input validation via `express-validator` (empty fields, invalid formats, length bounds)
- [x] Verified passwords are encrypted using bcrypt (10 salt rounds) and masked from queries
- [x] Verified JWT expiration and invalid token handling
- [x] Verified CORS configuration and single-port static hosting
- [x] Tested responsive design on desktop, tablet, and mobile breakpoints
- [x] Verified self-demotion and self-deletion administrative guards

**Deliverable:** A stable, secure, and fully verified college project.

---

## Stage 11: GitHub Preparation and Deployment ✅

**Goal:** Prepare the project for submission and cloud deployment.

- [x] Cleaned up code and verified consistent formatting
- [x] Configured root `package.json` with cloud scripts for Render.com / Railway
- [x] Verified `.gitignore` strictly excludes `node_modules/` and `.env` credentials
- [x] Initialized Git repository with `main` branch
- [x] Created clean initial commit ready to push to GitHub
- [x] Prepared step-by-step cloud deployment documentation for Render.com

**Deliverable:** Clean Git repository ready to push to GitHub and deploy to Render.

---

## Stage 12: Documentation and Academic Report Notes ✅

**Goal:** Prepare complete documentation for college submission.

- [x] Created comprehensive `README.md` with tech stack, installation, API table, and deployment guide
- [x] Created `PROJECT_REPORT_NOTES.md` for hardcopy college project report
- [x] Documented Chapter 3 System Design with Mermaid 3-Tier Architecture, ER, and User Workflow diagrams
- [x] Provided a 12-screen checklist with exact URL routes for required report screenshots
- [x] Provided key code walkthroughs (JWT Auth, RBAC, Dynamic Capacity, AngularJS Interceptor, Express SPA)
- [x] Documented Technical Challenges Faced & Engineering Solutions
- [x] Documented Cybersecurity Defense Matrix, Conclusion & Future Scope

**Deliverable:** Complete academic report documentation package for college evaluation.
