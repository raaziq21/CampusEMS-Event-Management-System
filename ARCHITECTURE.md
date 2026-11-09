# Architecture Decisions

This document records key architectural and technical decisions for the Event Management System.

---

## 1. Monorepo Structure

**Decision:** Keep frontend (`client/`) and backend (`server/`) in a single repository.

**Rationale:** Simplifies development, version control, and college submission. The project is not large enough to warrant separate repositories.

---

## 2. AngularJS 1.x with ngRoute

**Decision:** Use AngularJS 1.x with `ngRoute` for client-side routing.

**Rationale:** Required by the project specification. ngRoute is the standard AngularJS routing module and is sufficient for this application's routing needs. ui-router would add unnecessary complexity.

---

## 3. Frontend Served by Express (Production) / Standalone (Development)

**Decision:** In production, Express serves the `client/` folder as static files. During development, the client can be served separately or via Express.

**Rationale:** Simplifies deployment to a single server process. No separate frontend build pipeline is needed since AngularJS 1.x does not require compilation.

---

## 4. REST API Design

**Decision:** Build a RESTful API with these base routes:

| Route Prefix          | Purpose                  |
|---------------------- |------------------------- |
| `POST /api/auth/register` | User registration     |
| `POST /api/auth/login`    | User login            |
| `GET /api/auth/me`        | Get current user      |
| `GET/POST/PUT/DELETE /api/events` | Event CRUD    |
| `GET/POST/DELETE /api/registrations` | Registration management |
| `GET/PUT/DELETE /api/users`    | User management (admin) |

**Rationale:** Clean RESTful conventions. Prefixed with `/api/` to separate API routes from static file serving.

---

## 5. MongoDB Collections

### Users Collection
```
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: 'admin', 'organizer', 'participant', default: 'participant'),
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Events Collection
```
{
  title: String (required),
  description: String (required),
  date: Date (required),
  endDate: Date,
  location: String (required),
  category: String (required),
  capacity: Number (required),
  registeredCount: Number (default: 0),
  status: String (enum: 'upcoming', 'ongoing', 'completed', 'cancelled', default: 'upcoming'),
  organizer: ObjectId (ref: User),
  image: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Registrations Collection
```
{
  user: ObjectId (ref: User, required),
  event: ObjectId (ref: Event, required),
  status: String (enum: 'confirmed', 'cancelled', default: 'confirmed'),
  registeredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
Compound unique index on { user, event } to prevent duplicates.
```

**Decision on Schedules collection:** Not needed. Event dates are stored directly on the Event document. A separate Schedules collection would add unnecessary complexity for this application's scope.

---

## 6. Authentication Flow

1. User registers → password hashed with bcrypt → saved to MongoDB
2. User logs in → bcrypt compares password → JWT generated with user ID and role
3. Client stores JWT in localStorage
4. Client sends JWT in `Authorization: Bearer <token>` header
5. Server middleware verifies JWT → attaches user to request
6. Role middleware checks `req.user.role` against allowed roles

---

## 7. Authorization Strategy

**Decision:** Enforce authorization on the backend for every protected route using middleware.

```
router.get('/admin/users', auth, authorize('admin'), userController.getAll);
router.put('/events/:id', auth, authorize('admin', 'organizer'), eventController.update);
```

Frontend role checks (hiding buttons, menu items) are for UX convenience only — never for security.

---

## 8. Error Handling

**Decision:** Use a centralized error handling middleware in Express.

All controllers throw errors or call `next(error)`, and the error middleware returns a consistent JSON response:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": []
}
```

---

## 9. Frontend Component Pattern

**Decision:** Use AngularJS directives for reusable UI components (navbar, footer, event card, sidebar, alert, loader).

Each component lives in its own folder with:
- `component-name.directive.js` — directive definition
- `component-name.html` — template
- `component-name.css` — scoped styles (if needed)

---

## 10. CSS Strategy

**Decision:** Use plain CSS3 with a custom design system. No CSS framework (Bootstrap, Tailwind, etc.) unless we decide otherwise later.

**Rationale:** Keeps dependencies minimal and demonstrates CSS proficiency for the college project. A CSS variables-based design system provides consistency.
