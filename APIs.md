# Backend-Frontend Mapping Documentation

This document provides a comprehensive mapping of backend routes to their corresponding frontend pages in the Cognitia study platform.

## 🔐 Authentication & User Management

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/auth.js` | `/login`, `/register` | User authentication, registration, JWT tokens |
| `src/routes/users.js` | `/profile/[id]`, `/profile` | User profiles, following, activity |

## 📊 Dashboard & Main Pages

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/dashboard.js` | `/dashboard` | Main dashboard with Q&A feed, recent notes, study plans |
| `src/routes/search.js` | Global search functionality | Search across questions, notes, users, contests |

## ❓ Q&A System

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/questions.js` | `/question/[id]`, Dashboard Q&A feed | Question CRUD, voting, resolution |
| `src/routes/answers.js` | `/question/[id]` (answers section) | Answer CRUD, voting, acceptance |

## 📝 Notes Management

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/notes.js` | `/notes`, `/notes/[id]` | Notes CRUD, file trees, groups, sharing, ratings |

## 📅 Study Planning

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/tasks.js` | `/study-plan`, Dashboard sidebar | Task management, CRUD operations, status tracking |
| `src/routes/sessions.js` | `/study-plan`, Dashboard sidebar | Study sessions, time tracking, productivity |

## 🏆 Contests & Competitions

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/contests.js` | `/contests`, `/contests/[id]`, `/contests/create` | Contest management, registration, participation |

## 📋 Model Tests & Assessments

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/model-tests.js` | `/model-test`, `/model-test/[id]`, `/model-test/results/[id]`, `/model-test/history` | Test creation, attempts, scoring, history |

## ⚙️ Settings & Configuration

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/settings.js` | `/settings/*` (all settings pages) | User preferences, privacy, security, notifications |

## 🔔 Notifications

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/notifications.js` | Navbar notification dropdown | Real-time notifications, marking as read |

## 📈 Analytics & Reports

| Backend File | Frontend Pages | Description |
|-------------|----------------|-------------|
| `src/routes/analytics.js` | Dashboard progress widgets, Study plan analytics | Study patterns, progress tracking, performance metrics |

## 🔧 Core Infrastructure

| Backend File | Purpose | Used By |
|-------------|---------|---------|
| `src/middleware/auth.js` | JWT authentication middleware | All protected routes |
| `src/middleware/validation.js` | Request validation | All routes with input validation |
| `src/middleware/errorHandler.js` | Global error handling | All routes |
| `src/data/mockData.js` | Mock data for development | All routes |

## 📱 Detailed Page Mappings

### Authentication Pages
- **`/login`** → `auth.js` (POST `/api/auth/login`)
- **`/register`** → `auth.js` (POST `/api/auth/register`)

### Main Application Pages
- **`/dashboard`** → `dashboard.js`, `questions.js`, `notes.js`, `tasks.js`
- **`/notes`** → `notes.js` (GET `/api/notes`)
- **`/notes/[id]`** → `notes.js` (GET `/api/notes/:id`)
- **`/question/[id]`** → `questions.js`, `answers.js`
- **`/profile/[id]`** → `users.js` (GET `/api/users/:id`)
- **`/profile`** → `users.js` (GET `/api/users/me`)

### Study Management Pages
- **`/study-plan`** → `tasks.js`, `sessions.js`
- **`/contests`** → `contests.js` (GET `/api/contests`)
- **`/contests/[id]`** → `contests.js` (GET `/api/contests/:id`)
- **`/contests/create`** → `contests.js` (POST `/api/contests`)

### Assessment Pages
- **`/model-test`** → `model-tests.js` (GET `/api/model-tests`)
- **`/model-test/[id]`** → `model-tests.js` (GET `/api/model-tests/:id`)
- **`/model-test/results/[id]`** → `model-tests.js` (GET `/api/model-tests/attempts/:id/results`)
- **`/model-test/history`** → `model-tests.js` (GET `/api/model-tests/user/history`)

### Settings Pages
- **`/settings/*`** → `settings.js` (various endpoints)
- **`/settings/account`** → `settings.js` (GET/PUT `/api/settings/account`)
- **`/settings/profile`** → `settings.js` (GET/PUT `/api/settings/profile`)
- **`/settings/notifications`** → `settings.js` (GET/PUT `/api/settings/notifications`)
- **`/settings/privacy`** → `settings.js` (GET/PUT `/api/settings/privacy`)
- **`/settings/security`** → `settings.js` (GET/PUT `/api/settings/security`)

## 🔄 Real-time Features

| Feature | Backend Handler | Frontend Component |
|---------|----------------|-------------------|
| Notifications | `notifications.js` | Navbar dropdown |
| Live search | `search.js` | Global search bar |
| Vote updates | `questions.js`, `answers.js` | Question/Answer cards |
| Progress tracking | `analytics.js` | Dashboard widgets |

## 🚀 API Endpoint Structure

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### Questions & Answers
```
GET    /api/questions
POST   /api/questions
GET    /api/questions/:id
PUT    /api/questions/:id
DELETE /api/questions/:id
POST   /api/questions/:id/vote
POST   /api/questions/:id/answers
PUT    /api/answers/:id
DELETE /api/answers/:id
POST   /api/answers/:id/vote
```

### Notes Management
```
GET    /api/notes
POST   /api/notes
GET    /api/notes/:id
PUT    /api/notes/:id
DELETE /api/notes/:id
POST   /api/notes/:id/rate
GET    /api/notes/groups
POST   /api/notes/groups
```

### Tasks & Sessions
```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/sessions
POST   /api/sessions
PUT    /api/sessions/:id
```

### Contests
```
GET    /api/contests
POST   /api/contests
GET    /api/contests/:id
POST   /api/contests/:id/register
GET    /api/contests/:id/leaderboard
```

### Model Tests
```
GET    /api/model-tests
POST   /api/model-tests
GET    /api/model-tests/:id
POST   /api/model-tests/:id/attempt
GET    /api/model-tests/attempts/:id/results
GET    /api/model-tests/user/history
```

### User Management
```
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/:id
POST   /api/users/:id/follow
DELETE /api/users/:id/follow
```

### Settings
```
GET    /api/settings/account
PUT    /api/settings/account
GET    /api/settings/profile
PUT    /api/settings/profile
GET    /api/settings/notifications
PUT    /api/settings/notifications
GET    /api/settings/privacy
PUT    /api/settings/privacy
GET    /api/settings/security
PUT    /api/settings/security
```

### Notifications
```
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/mark-all-read
```

### Search & Analytics
```
GET    /api/search?q=:query&type=:type
GET    /api/analytics/dashboard
GET    /api/analytics/study-patterns
GET    /api/analytics/progress
```

## 🔒 Authentication Flow

1. **Login/Register** → `auth.js` generates JWT token
2. **Protected Routes** → `auth.js` middleware validates JWT
3. **User Context** → Frontend stores user data from token
4. **API Calls** → Include JWT in Authorization header

## 📊 Data Flow

1. **Frontend** makes API request to backend route
2. **Middleware** validates authentication and input
3. **Route Handler** processes request and interacts with mock data
4. **Response** sent back to frontend with JSON data
5. **Frontend** updates UI based on response

## 🛠️ Development Notes

- All backend routes use Express.js
- Mock data is stored in `src/data/mockData.js`
- Authentication uses JWT tokens
- Input validation handled by `validation.js` middleware
- Error handling centralized in `errorHandler.js`
- CORS enabled for frontend-backend communication

## 📝 Contributing

When adding new features:

1. Create backend route in appropriate `src/routes/` file
2. Add corresponding frontend page in `app/` directory
3. Update this mapping documentation
4. Add API endpoints to the structure above
5. Test authentication and validation middleware

---

**Last Updated:** December 2024  
**Version:** 1.0.0
