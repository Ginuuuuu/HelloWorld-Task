# Production-Grade Project Management REST API

A robust, secure, and production-style backend REST API for project and task management built exclusively with **Node.js**, **Express.js**, and **MongoDB / Mongoose**.

---

## 1. Project Overview

This API powers project management workflows including multi-user collaboration, project workspace isolation, role-based access control (RBAC), granular task tracking with soft-deletes and audit logging, comment threads, overdue task identification, and aggregated project metrics dashboards.

### Core Features

- **Authentication & Security**: JWT-based stateless authentication, bcrypt password hashing, input sanitization, rate limiting on sensitive auth endpoints, and HTTP security headers powered by `helmet`.
- **Role-Based Access Control (RBAC)**: Support for `user` and `admin` roles, restricting high-privilege operations.
- **Project Workspaces**: Ownership models with member invitation, access control middleware, and workspace isolation.
- **Granular Task Management**:
  - Full CRUD operations with enum validation (`todo`, `in-progress`, `done` and `low`, `medium`, `high`).
  - Assignee verification strictly enforcing that assignees must belong to the project.
  - Soft-deletion pattern preserving task records and history.
  - Case-insensitive search on title and description.
  - Multi-field filtering (by status, priority, assignee).
  - Offset-based pagination with complete metadata (`page`, `limit`, `total`, `totalPages`).
  - Automatic overdue task detection across authorized user projects.
- **Activity & Audit Logging**: Automatic chronological history tracking for task creation, status transitions, priority shifts, re-assignments, description changes, restorations, and comment events.
- **Task Comments**: Threaded discussions on tasks with author-only and administrator deletion permissions.
- **Project Dashboard**: Dynamic metrics engine computing task counts by status, priority breakdowns, overdue alerts, and completion percentage.
- **Avatar Media Uploads**: Multer-powered image upload handling with MIME-type restriction, size limits, and safe storage.

---

## 2. Technology Stack

- **Runtime**: Node.js (v20+ / v24+)
- **Framework**: Express.js (v5.x)
- **Database**: MongoDB
- **Object Data Modeling (ODM)**: Mongoose (v9.x)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs`
- **Request Validation**: `express-validator`
- **File Uploads**: `multer`
- **Rate Limiting**: `express-rate-limit`
- **Security & Utilities**: `helmet`, `cors`, `dotenv`
- **Testing**: `supertest`, Node.js native test runner (`node --test`), `mongodb-memory-server`

---

## 3. Project Structure

```text
ProjectManager/
│
├── src/
│   ├── config/
│   │   └── database.js               # MongoDB connection and lifecycle hooks
│   │
│   ├── controllers/
│   │   ├── authController.js         # Register, Login, Current User (Me)
│   │   ├── userController.js         # User profile and avatar upload
│   │   ├── projectController.js      # Project CRUD and member assignment
│   │   ├── taskController.js         # Task CRUD, filters, search, soft delete, overdue
│   │   ├── commentController.js      # Task comments and authorization
│   │   └── dashboardController.js    # Project aggregated statistics
│   │
│   ├── models/
│   │   ├── User.js                   # User schema, password hashing & comparison
│   │   ├── Project.js                # Project schema with owner & members
│   │   ├── Task.js                   # Task schema with soft delete & compound indexes
│   │   ├── Comment.js                # Task comments schema
│   │   └── Activity.js               # Task audit history trail
│   │
│   ├── routes/
│   │   ├── authRoutes.js             # /api/auth routes
│   │   ├── userRoutes.js             # /api/users routes
│   │   ├── projectRoutes.js          # /api/projects routes
│   │   ├── taskRoutes.js             # /api/tasks routes
│   │   ├── commentRoutes.js          # /api/comments routes
│   │   └── dashboardRoutes.js        # /api/dashboard routes
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js         # Bearer JWT verification and user attachment
│   │   ├── roleMiddleware.js         # Reusable RBAC authorization check
│   │   ├── projectAccessMiddleware.js# Member, Owner, and Task access verification
│   │   ├── validationMiddleware.js   # express-validator result formatter
│   │   ├── uploadMiddleware.js       # Multer avatar image validation
│   │   ├── rateLimitMiddleware.js    # Rate limiter for auth endpoints
│   │   ├── requestLogger.js          # Sanitized console request logger
│   │   ├── notFound.js               # 404 handler for undefined routes
│   │   └── errorHandler.js          # Centralized error handler
│   │
│   ├── utils/
│   │   ├── generateToken.js          # JWT signing utility
│   │   ├── apiResponse.js            # Standardized API response formatters
│   │   └── activityLogger.js         # Activity history creation helper
│   │
│   ├── validators/
│   │   ├── authValidator.js          # Auth payload validators
│   │   ├── userValidator.js          # User payload validators
│   │   ├── projectValidator.js       # Project payload & ID validators
│   │   ├── taskValidator.js          # Task payload, query & ID validators
│   │   └── commentValidator.js       # Comment payload & ID validators
│   │
│   ├── uploads/
│   │   └── avatars/                  # Avatar image storage directory
│   │
│   └── app.js                        # Express application configuration
│
├── tests/
│   └── api.test.js                   # Automated test suite
│
├── postman_collection.json           # Ready-to-import Postman collection
├── server.js                         # Application entrypoint
├── .env.example                      # Environment variables template
├── .env                              # Local environment variables
├── .gitignore                        # Git ignore rules
├── package.json                      # NPM configuration
└── README.md                         # Documentation
```

---

## 4. Installation & Setup

### Prerequisites

- Node.js (v20 or higher recommended)
- MongoDB instance (local or MongoDB Atlas connection string)

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd ProjectManager
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/project_management_db
JWT_SECRET=super_secure_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=2097152
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port for the Express HTTP server | `5000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `MONGO_URI` | MongoDB connection URI string | `mongodb://localhost:27017/project_management_db` |
| `JWT_SECRET` | Secret key for signing and verifying JWTs | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `MAX_FILE_SIZE` | Maximum file size for avatar uploads (in bytes) | `2097152` (2 MB) |

### 3. Run Locally

- Start in standard mode:
  ```bash
  npm start
  ```
- Start in watch/development mode:
  ```bash
  npm run dev
  ```
- Run automated verification test suite:
  ```bash
  npm test
  ```

---

## 5. Roles, Statuses, and Priorities

### Roles
- `user`: Standard account. Can create projects, manage owned projects, and collaborate on member projects.
- `admin`: Elevated account. Can access all projects and tasks, delete any comment, and view soft-deleted entities.

### Task Statuses
- `todo`: Task created and pending initiation.
- `in-progress`: Task currently under active development.
- `done`: Task completed.

### Task Priorities
- `low`: Low urgency.
- `medium`: Normal priority (default).
- `high`: High urgency / blocker.

---

## 6. Standardized Response Formats

### Success Response (`200`, `201`)
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "674df98b0f497a9f73f8e001",
      "title": "Implement authentication",
      "status": "todo",
      "priority": "high",
      "assignee": {
        "_id": "674df98b0f497a9f73f8d002",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "project": "674df98b0f497a9f73f8a001",
      "deletedAt": null,
      "createdAt": "2026-10-02T15:20:00.000Z",
      "updatedAt": "2026-10-02T15:20:00.000Z"
    }
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `409`, `429`, `500`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

## 7. Complete API Endpoint Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description | Rate Limited |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account | Yes (20 req / 15m) |
| `POST` | `/api/auth/login` | Public | Authenticate user and obtain JWT | Yes (20 req / 15m) |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile | No |

### User Profile (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Authenticated | Retrieve profile of authenticated user |
| `PATCH` | `/api/users/me` | Authenticated | Update name or bio |
| `POST` | `/api/users/me/avatar` | Authenticated | Upload profile avatar (`multipart/form-data`) |

### Projects (`/api/projects`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects` | Authenticated | Create new project (creator becomes owner) |
| `GET` | `/api/projects` | Authenticated | Get all projects accessible to the user |
| `GET` | `/api/projects/:projectId` | Member / Owner / Admin | Get project details |
| `PATCH` | `/api/projects/:projectId` | Owner / Admin | Update project name or description |
| `DELETE` | `/api/projects/:projectId` | Owner / Admin | Delete project and cascade cleanup tasks/comments |

### Project Members (`/api/projects/:projectId/members`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects/:projectId/members/:userId` | Owner / Admin | Add a registered user as a project member |
| `DELETE` | `/api/projects/:projectId/members/:userId` | Owner / Admin | Remove a member (unassigns their tasks) |
| `GET` | `/api/projects/:projectId/members` | Member / Owner / Admin | List all project members and owner |

### Tasks (`/api/projects/:projectId/tasks` & `/api/tasks`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects/:projectId/tasks` | Member / Owner / Admin | Create task in project |
| `GET` | `/api/projects/:projectId/tasks` | Member / Owner / Admin | List tasks (pagination, filter, search) |
| `GET` | `/api/tasks/overdue` | Authenticated | List all overdue tasks in accessible projects |
| `GET` | `/api/tasks/:taskId` | Member / Owner / Admin | Get single task details |
| `PATCH` | `/api/tasks/:taskId` | Member / Owner / Admin | Update task or restore soft-deleted task |
| `DELETE` | `/api/tasks/:taskId` | Member / Owner / Admin | Soft-delete a task (`deletedAt = now`) |
| `GET` | `/api/tasks/:taskId/activity` | Member / Owner / Admin | Get chronological task audit history |

### Comments (`/api/tasks/:taskId/comments` & `/api/comments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks/:taskId/comments` | Member / Owner / Admin | Add comment to a task |
| `GET` | `/api/tasks/:taskId/comments` | Member / Owner / Admin | Retrieve task comment thread |
| `DELETE` | `/api/comments/:commentId` | Comment Author / Admin | Delete a comment |

### Project Dashboard (`/api/projects/:projectId/dashboard` & `/api/dashboard/:projectId`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects/:projectId/dashboard` | Member / Owner / Admin | Get project statistics and task breakdown |
| `GET` | `/api/dashboard/:projectId` | Member / Owner / Admin | Alternative dashboard route |

---

## 8. Request & Response Examples

### Register User
**Request**:
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Sarah Connor",
  "email": "sarah@example.com",
  "password": "SecurePassword123"
}
```
**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "674df98b0f497a9f73f8a010",
      "name": "Sarah Connor",
      "email": "sarah@example.com",
      "role": "user",
      "avatar": null,
      "bio": "",
      "createdAt": "2026-10-02T15:20:00.000Z",
      "updatedAt": "2026-10-02T15:20:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Task
**Request**:
```http
POST /api/projects/674df98b0f497a9f73f8a001/tasks
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "title": "Implement authentication",
  "description": "Create JWT authentication middleware and token verification",
  "status": "todo",
  "priority": "high",
  "assignee": "674df98b0f497a9f73f8a010",
  "dueDate": "2026-10-15T00:00:00.000Z"
}
```
**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "674df98b0f497a9f73f8a055",
      "title": "Implement authentication",
      "description": "Create JWT authentication middleware and token verification",
      "status": "todo",
      "priority": "high",
      "assignee": {
        "_id": "674df98b0f497a9f73f8a010",
        "name": "Sarah Connor",
        "email": "sarah@example.com"
      },
      "project": "674df98b0f497a9f73f8a001",
      "dueDate": "2026-10-15T00:00:00.000Z",
      "deletedAt": null
    }
  }
}
```

### Filter, Search, and Paginate Tasks
**Request**:
```http
GET /api/projects/674df98b0f497a9f73f8a001/tasks?status=todo&priority=high&search=auth&page=1&limit=10
Authorization: Bearer <TOKEN>
```
**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [ ... ]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Project Dashboard
**Request**:
```http
GET /api/projects/674df98b0f497a9f73f8a001/dashboard
Authorization: Bearer <TOKEN>
```
**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Project dashboard statistics retrieved successfully",
  "data": {
    "totalTasks": 20,
    "todo": 8,
    "inProgress": 7,
    "done": 5,
    "highPriority": 4,
    "mediumPriority": 10,
    "lowPriority": 6,
    "overdue": 3,
    "completedPercentage": 25
  }
}
```

---

## 9. Testing with Postman / Insomnia

1. Import `postman_collection.json` located at the root of the repository into Postman.
2. The collection includes collection variables:
   - `baseUrl`: Defaults to `http://localhost:5000/api`
   - `token`: Automatically captured upon successful **Register** or **Login** requests via Postman test scripts.
   - `projectId`: Automatically populated on project creation.
   - `taskId`: Automatically populated on task creation.
   - `commentId`: Automatically populated on comment creation.
   - `userId`: Captured upon user registration.
3. Run the requests sequentially from **Authentication** down through **Dashboard**.

---

## 10. Security Best Practices Implemented

- **Password Safety**: Hashed using `bcryptjs` with salt rounds = 10; password field configured with `select: false` and explicitly deleted in document transforms.
- **Token Security**: Signed JWTs with configurable expiration; strict extraction from the `Authorization: Bearer <token>` header.
- **Resource Ownership & Authorization (BOLA/IDOR Defense)**: Middleware rigorously verifies user membership or ownership before granting read/write operations on projects, tasks, comments, and member rosters.
- **Rate Limiting**: IP-based rate limiting on sensitive authentication routes (`/api/auth/register`, `/api/auth/login`) protecting against brute force attacks.
- **MIME & File Upload Protection**: Multer storage restricts uploaded files to approved image types (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) and prevents arbitrary code execution.
- **Error Obfuscation**: Production error handling conceals internal database errors and stack traces from client responses.
