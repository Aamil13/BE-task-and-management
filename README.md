# Task & Time Management — Backend API

A secure, production-ready REST API for managing tasks and tracking time, built with Node.js, Express, TypeScript, and MongoDB.


> ✅ **Working auth** — register or use the test credentials below  
> ✅ **Test credentials** — `email: text2@exa.co` / `password: 12345678 `

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20 |
| Language | TypeScript (strict mode) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Validation | Joi |
| Auth | JWT |
| Security | Helmet, CORS, HPP, Rate Limiting |
| Logging | Pino + pino-http |
| Password hashing | bcryptjs (12 rounds) |
| Package manager | Yarn 4.x |

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- Yarn 4.x (`corepack enable`)
- MongoDB instance (local or Atlas)

### Steps

```bash
# 1. Clone the repo
git clone 
cd be-task-and-time-management

# 2. Install dependencies
yarn install

# 3. Set up environment variables
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_EXPIRES_IN=7d
```

```bash
# 4. Start the development server
yarn dev
```

The API will be available at `http://localhost:8000`.

### Other Scripts

```bash
yarn build        # Compile TypeScript → dist/
yarn start        # Run compiled production build
yarn lint         # Run ESLint
yarn lint:fix     # Auto-fix ESLint issues
yarn format       # Format with Prettier
```

---

## API Endpoints

All routes are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <token>`.

### Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create a new account |
| POST | `/auth/login` | — | Login and receive JWT |
| GET | `/auth/me` | ✅ | Get current user |
| POST | `/auth/logout` | ✅ | Logout |

### Tasks — `/tasks`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/tasks` | ✅ | Create a task |
| GET | `/tasks` | ✅ | List tasks (supports query filters) |
| GET | `/tasks/:id` | ✅ | Get a task by ID |
| PUT | `/tasks/:id` | ✅ | Update a task |
| DELETE | `/tasks/:id` | ✅ | Delete a task |

### Time Logs — `/time-logs`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/time-logs/tasks/:taskId/time-logs/start` | ✅ | Start tracking time on a task |
| POST | `/time-logs/time-logs/active/stop` | ✅ | Stop the active tracking session |
| GET | `/time-logs/time-logs/active` | ✅ | Get the currently active session |
| GET | `/time-logs/tasks/:taskId/time-logs` | ✅ | Get all logs for a specific task |
| GET | `/time-logs/tasks/:taskId/time-logs/total` | ✅ | Get total time for a specific task |
| GET | `/time-logs/time-logs/total` | ✅ | Get total time across all tasks |
| GET | `/time-logs/time-logs` | ✅ | List all logs for the current user |

### Summary — `/summary`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/summary/daily` | ✅ | Get a daily summary of tasks and time |

---

## Project Structure

```
src/
├── app.ts                        # Express app (middleware + routes)
├── server.ts                     # Entry point (DB + server + shutdown)
├── config/
│   ├── db.ts                     # MongoDB connection
│   └── env.ts                    # Validated env variables
├── middlewares/
│   ├── auth.middleware.ts        # JWT authentication
│   ├── error.middleware.ts       # Global error handler + AppError classes
│   ├── rateLimiter.middleware.ts # Rate limiting
│   └── validate.middleware.ts    # Joi validation middleware
├── modules/
│   ├── auth/                     # Auth module (register, login, me)
│   ├── task/                     # Task CRUD module
│   ├── time-log/                 # Time tracking module
│   └── summary/                  # Daily summary module
├── routes/
│   └── v1/                       # Versioned route definitions
└── utils/
    ├── catchAsync.ts             # Async error wrapper
    ├── email.ts                  # Email utilities
    └── logger.ts                 # Pino logger config
```

---

## Security

- **Helmet** — secure HTTP headers
- **CORS** — explicit origin configuration
- **Rate limiting** — 100 req/15 min globally; 5 req/15 min on auth routes
- **HPP** — HTTP parameter pollution protection
- **Body size limit** — 10 kb cap
- **bcrypt** — password hashing with 12 salt rounds
- **JWT** — required secret (min 32 chars), validated at boot — no silent fallback

## License

ISC
