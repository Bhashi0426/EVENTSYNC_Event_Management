# EventSync — Real-Time Event & RSVP Management System

EventSync is a full-stack, API-first application for discovering events, managing RSVPs, and keeping every attendee in sync in real time. It is built with a React frontend and a Node/Express + MongoDB backend, with Socket.io for live updates, JWT authentication, role-based access control, optimistic concurrency, atomic capacity handling, and offline persistence.

> **JavaScript only.** No TypeScript is used anywhere in this project.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Roles & Permissions](#roles--permissions)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Demo Accounts](#demo-accounts)
- [Testing](#testing)
- [Docker](#docker)
- [CI/CD](#cicd)
- [API Documentation](#api-documentation)
- [Key Engineering Details](#key-engineering-details)

---

## Features

- **Authentication** — Register, login, logout, session restore (`/me`) with JWT + bcrypt.
- **Role-based access control** — `participant`, `organizer`, `admin` enforced on the backend.
- **Events** — Create, read, update, delete, with search, category/date/location/availability filters, sorting, and pagination.
- **RSVPs** — Going / Maybe / Not Going, one RSVP per user per event, change or cancel.
- **Capacity protection** — Atomic seat reservation prevents overbooking under concurrency.
- **Optimistic concurrency** — Event edits are versioned; conflicting updates return `409` with a conflict modal.
- **Real-time** — Live attendee counts, event updates, and notifications via Socket.io.
- **Notifications** — In-app bell with unread badge, delivered live over sockets.
- **Offline persistence** — RSVPs taken offline are queued in `localStorage` and synced on reconnect.
- **Admin tools** — User management (role & status) and platform-wide event management.
- **Responsive UI** — Sidebar + top navbar on desktop; drawer navigation on mobile.

---

## Architecture

```
┌──────────────────────────────┐
│          FRONTEND            │
│  React + Vite + Tailwind     │
│  JavaScript                  │
└──────────────┬───────────────┘
               │  REST API (JSON) + Socket.io
               ▼
┌──────────────────────────────┐
│           BACKEND            │
│  Node.js + Express (JS)      │
│  JWT Auth · RBAC · Sockets   │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│           DATABASE           │
│  MongoDB + Mongoose          │
└──────────────────────────────┘
```

The frontend never imports backend code or talks to MongoDB directly — all communication is over the REST API and Socket.io.

---

## Technology Stack

**Frontend:** React, Vite, JavaScript, Tailwind CSS, React Router, Lucide React, Axios, socket.io-client, date-fns.

**Backend:** Node.js, Express, JavaScript, MongoDB, Mongoose, JWT, bcryptjs, Socket.io, express-validator, helmet, cors, express-rate-limit, cookie-parser, morgan, dotenv.

**Testing:** Jest + Supertest (backend, with mongodb-memory-server); Jest + React Testing Library (frontend).

**DevOps:** Docker, Docker Compose, GitHub Actions.

---

## Roles & Permissions

There are exactly three roles: `participant`, `organizer`, `admin`.

New registrations are **always** created as `participant` — there is no role selector on the register page, and the backend ignores any client-supplied role. Only an admin can promote/demote between `participant` and `organizer` (never to admin).

| Feature              | Participant | Organizer | Admin |
| -------------------- | :---------: | :-------: | :---: |
| Dashboard            | Yes | Yes | Yes |
| View Events / Event  | Yes | Yes | Yes |
| RSVP / My RSVPs      | Yes | Yes | Yes |
| Create Event         | No  | Yes | Yes |
| Edit / Delete Own    | No  | Yes | Yes |
| Manage Own Attendees | No  | Yes | Yes |
| User Management      | No  | No  | Yes |
| Change User Role     | No  | No  | Yes |
| Manage All Events    | No  | No  | Yes |

---

## Project Structure

```
eventsync/
├── frontend/           # React + Vite app
│   └── src/
│       ├── components/ # layout, common, events, rsvp, notifications
│       ├── pages/      # auth, dashboard, events, rsvps, admin, profile
│       ├── services/   # axios API clients + socket
│       ├── context/    # Auth, Toast, Socket, Notification, Offline
│       ├── hooks/ routes/ utils/
│       ├── App.jsx  main.jsx  index.css
├── backend/            # Express + Mongoose API
│   └── src/
│       ├── config/ controllers/ models/ routes/
│       ├── middleware/ services/ validators/ sockets/ utils/ seeders/
│       ├── app.js  server.js
│   └── tests/          # Jest + Supertest
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- MongoDB running locally on `mongodb://localhost:27017` **or** a MongoDB Atlas URI
- (Optional) Docker + Docker Compose

Default ports: **Backend `5050`**, **Frontend (Vite) `5173`**, **MongoDB `27017`**.

### Backend Setup

```bash
cd backend
cp .env.example .env        # then edit values as needed
npm install
npm run seed                # optional: load demo data
npm run dev                 # starts on http://localhost:5050
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env        # VITE_API_URL / VITE_SOCKET_URL
npm install
npm run dev                 # starts on http://localhost:5173
```

Open http://localhost:5173 and sign in with a demo account.

---

## Environment Variables

**Backend (`backend/.env`)**

| Variable         | Description                              | Default                              |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| `PORT`           | API port                                 | `5050`                               |
| `NODE_ENV`       | `development` / `production` / `test`    | `development`                        |
| `MONGO_URI`      | MongoDB connection string (local/Atlas)  | `mongodb://localhost:27017/eventsync`|
| `JWT_SECRET`     | Secret used to sign JWTs                  | *(set your own)*                     |
| `JWT_EXPIRES_IN` | Token lifetime                            | `7d`                                 |
| `CLIENT_URL`     | Allowed CORS / Socket.io origin           | `http://localhost:5173`              |
| `DEMO_PASSWORD`  | Password used by the seeder               | `Password123!`                       |

**Frontend (`frontend/.env`)**

| Variable          | Description                | Default                       |
| ----------------- | -------------------------- | ----------------------------- |
| `VITE_API_URL`    | Base URL of the REST API   | `http://localhost:5050/api`   |
| `VITE_SOCKET_URL` | Base URL of the Socket.io  | `http://localhost:5050`       |

> Never commit real secrets. `.env` files are git-ignored; only `.env.example` is tracked.

---

## Database Seeding

```bash
cd backend
npm run seed
```

Seeds **1 admin, 3 organizers, 6 participants, 10 events, 30+ RSVPs, and 10 notifications** with realistic data.

---

## Demo Accounts

> **DEMO ACCOUNTS — DEVELOPMENT ONLY**

| Role        | Email                     | Password       |
| ----------- | ------------------------- | -------------- |
| Admin       | `admin@eventsync.com`     | `Password123!` |
| Organizer   | `organizer@eventsync.com` | `Password123!` |
| Participant | `participant@eventsync.com` | `Password123!` |

(The password matches `DEMO_PASSWORD` in your backend `.env`.)

---

## Testing

**Backend** (Jest + Supertest, in-memory MongoDB — no local DB required):

```bash
cd backend
npm test
```

Covers auth, users, events, RSVPs, capacity, duplicate & **concurrent RSVP** handling, and optimistic-concurrency conflicts.

**Frontend** (Jest + React Testing Library):

```bash
cd frontend
npm test
```

Covers Login validation/flow, EventCard, RSVP buttons, and ProtectedRoute guarding.

---

## Docker

Build and run the full stack (MongoDB + backend + frontend) with one command:

```bash
docker compose up --build
```

- Frontend → http://localhost:8080
- Backend  → http://localhost:5050
- MongoDB  → localhost:27017

To seed inside Docker once containers are up:

```bash
docker compose exec backend npm run seed
```

Override secrets via environment variables (e.g. `JWT_SECRET`, `VITE_API_URL`) or an `.env` file next to `docker-compose.yml`.

---

## CI/CD

`.github/workflows/ci.yml` runs on push/PR:

1. Checkout
2. Install backend deps → run backend tests
3. Install frontend deps → run frontend tests → build frontend

No secrets are committed; CI uses environment variables / GitHub Actions secrets.

---

## API Documentation

All routes are prefixed with `/api`. Responses follow a consistent envelope:

```jsonc
// success
{ "success": true, "data": { /* ... */ } }
// error
{ "success": false, "message": "..." }
// validation
{ "success": false, "message": "Validation failed.", "errors": { "field": "..." } }
// conflict
{ "success": false, "message": "...", "conflict": true, "latestVersion": 4 }
```

### Auth

| Method | Endpoint             | Auth | Body / Notes |
| ------ | -------------------- | ---- | ------------ |
| POST   | `/api/auth/register` | —    | `{ name, email, password }` → creates a **participant** |
| POST   | `/api/auth/login`    | —    | `{ email, password }` → `{ user, token }` |
| GET    | `/api/auth/me`       | Yes  | Current user |
| POST   | `/api/auth/logout`   | Yes  | Clears auth cookie |

### Users

| Method | Endpoint                  | Role  | Notes |
| ------ | ------------------------- | ----- | ----- |
| GET    | `/api/users`              | admin | List/search/filter users |
| GET    | `/api/users/:id`          | auth  | Get a user |
| PUT    | `/api/users/:id`          | self/admin | Update profile / password |
| PATCH  | `/api/users/:id/role`     | admin | `{ role: participant\|organizer }` |
| PATCH  | `/api/users/:id/status`   | admin | `{ status: active\|disabled }` |

### Events

| Method | Endpoint                    | Role | Notes |
| ------ | --------------------------- | ---- | ----- |
| GET    | `/api/events`               | —    | `?search=&category=&date=&location=&status=&availability=&sort=&page=&limit=` |
| GET    | `/api/events/:id`           | —    | Event + stats + your RSVP |
| POST   | `/api/events`               | organizer/admin | Create event |
| PUT    | `/api/events/:id`           | owner/admin | Update (**must send `version`**) |
| DELETE | `/api/events/:id`           | owner/admin | Delete event + its RSVPs |
| GET    | `/api/events/:id/attendees` | owner/admin | Attendees + stats |

### RSVPs

| Method | Endpoint                    | Role | Notes |
| ------ | --------------------------- | ---- | ----- |
| POST   | `/api/events/:eventId/rsvp` | auth | `{ response }` — create/update |
| GET    | `/api/events/:eventId/rsvp` | auth | Your RSVP for the event |
| PUT    | `/api/events/:eventId/rsvp` | auth | `{ response }` — update |
| DELETE | `/api/events/:eventId/rsvp` | auth | Cancel your RSVP |
| GET    | `/api/me/rsvps`             | auth | `?response=going\|maybe\|not_going` |

### Notifications

| Method | Endpoint                        | Role | Notes |
| ------ | ------------------------------- | ---- | ----- |
| GET    | `/api/notifications`            | auth | `?unread=true` |
| PATCH  | `/api/notifications/:id/read`   | auth | Mark one read |
| PATCH  | `/api/notifications/read-all`   | auth | Mark all read |

### Stats

| Method | Endpoint               | Role  | Notes |
| ------ | ---------------------- | ----- | ----- |
| GET    | `/api/stats/overview`  | admin | `{ totalUsers, totalEvents, upcomingEvents, totalRsvps }` |

**HTTP status codes used:** `200, 201, 204, 400, 401, 403, 404, 409, 422, 500`.

### Socket.io events

`event:updated`, `event:cancelled`, `rsvp:created`, `rsvp:updated`, `rsvp:cancelled`, `attendee:updated`, `notification:new`. Clients `event:join` / `event:leave` a room named `event:{id}`; each user has a personal room `user:{id}`.

---

## Key Engineering Details

- **Atomic capacity** — A "going" RSVP reserves a seat via a single conditional document update (`goingCount < capacity` guarded `$inc`). Concurrent requests for the final seat cannot both succeed; the loser receives `409 Conflict`. Verified by a concurrency test.
- **Optimistic concurrency** — Events carry a `version`. Updates must send the version they last saw; a mismatch returns `409` with `latestVersion`, and the UI shows a conflict modal (*View Latest* / *Discard My Changes*).
- **Security** — bcrypt password hashing, JWT auth, RBAC middleware (`requireAuth`, `requireRole`), Helmet, CORS locked to `CLIENT_URL`, rate limiting on auth endpoints, server-side validation on every mutating route. Passwords are never returned.
- **Ownership** — Organizers can only modify their own events; the server verifies `event.organizer === req.user.id` (admins bypass). Client-supplied roles/organizer IDs are never trusted.

---

## Development Commands

```bash
# Backend
cd backend && npm install && npm run dev     # dev server
npm start        # production
npm test         # tests
npm run seed     # seed demo data

# Frontend
cd frontend && npm install && npm run dev    # dev server
npm run build    # production build
npm test         # tests

# Docker
docker compose up --build
```

---

© EventSync — University Software Engineering Project.
