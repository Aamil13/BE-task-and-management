# AGENTS.md — Project Architecture & Conventions

This file defines the architecture, patterns, and conventions this project follows.
Any AI agent or contributor generating code for this repo MUST follow this structure.

## Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, HPP, Rate Limiting
- **Logging**: Pino + pino-http (colorized in dev, JSON in prod)
- **Password Hashing**: bcryptjs
- **Package Manager**: Yarn 4.x
- **Containerization**: Docker (multi-stage build)

## Project Structure

src/
├── app.ts # Express app configuration (middleware, routes)
├── server.ts # Server entry point (DB connection + app start + graceful shutdown)
├── config/
│ ├── db.ts # MongoDB connection
│ └── env.ts # Environment variables (validated, no silent fallbacks for secrets)
├── middlewares/
│ ├── auth.middleware.ts # JWT authentication middleware
│ ├── error.middleware.ts # Global error handler + AppError class hierarchy
│ ├── rateLimiter.middleware.ts # Rate limiting configurations
│ └── validate.middleware.ts # Joi validation middleware
├── modules/
│ └── [module-name]/
│ ├── index.ts # Module exports
│ ├── [module].controller.ts # Request handlers
│ ├── [module].service.ts # Business logic
│ ├── [module].repository.ts # DB access layer (wraps Mongoose calls)
│ ├── [module].model.ts # Mongoose schema/model
│ ├── [module].interface.ts # TypeScript interfaces
│ └── [module].validate.ts # Joi validation schemas
├── routes/
│ └── v1/
│ ├── index.ts # Route aggregator
│ └── [module].route.ts # Module-specific routes
└── utils/
├── catchAsync.ts # Async error wrapper
├── email.ts # Email utilities
└── logger.ts # Pino logger configuration


## Core Rules for Agents

1. **Never bypass the module pattern.** Every feature gets its own folder under `modules/` with controller, service, repository, model, interface, and validate files.
2. **Controllers never touch Mongoose directly.** Controllers call services; services call repositories; repositories call `Model`.
3. **Every route input is validated with Joi** via the `validate` middleware — no exceptions, even for "trivial" fields.
4. **Every thrown error is an `AppError` (or subclass).** Never throw raw `Error` or return manual `res.status(...).json({error})` from services.
5. **All logging goes through the shared Pino logger** (`utils/logger.ts`) or `req.log` inside request handlers — never `console.log`.
6. **Env vars are validated at boot** in `config/env.ts`. No `process.env.X || 'fallback'` for secrets (JWT_SECRET, DB URIs). Missing required vars should crash the app on startup, not silently degrade.
7. **Middleware order in `app.ts` is fixed**: security → body parsing → request logging → routes → error handler (must be last).

## Module Pattern

```typescript
// modules/auth/index.ts
import * as authController from './auth.controller';
import * as authValidation from './auth.validate';
import * as authService from './auth.service';
export { authController, authValidation, authService };
```

## Controller Pattern

```typescript
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import * as authService from './auth.service';

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Account created successfully',
    data: result,
  });
});
```

## Service Pattern

Services hold business logic; they call repositories, not Mongoose models directly.

```typescript
import * as authRepository from './auth.repository';
import { AppError, ConflictError } from '../../middlewares/error.middleware';
import logger from '../../utils/logger';

export const register = async (input: IRegisterInput) => {
  const existingEmail = await authRepository.findByEmail(input.email);
  if (existingEmail) {
    throw new ConflictError('Email already in use');
  }
  const user = await authRepository.create(input);
  logger.info({ userId: user.id }, 'New user registered');
  return formatUser(user);
};
```

## Repository Pattern

```typescript
// modules/auth/auth.repository.ts
import { UserModel } from './auth.model';

export const findByEmail = (email: string) => UserModel.findOne({ email });
export const findById = (id: string) => UserModel.findById(id);
export const create = (input: Partial<IUser>) => UserModel.create(input);
```

## Validation Pattern (Joi)

```typescript
import Joi from 'joi';

export const registerSchema = Joi.object({
  userName: Joi.string().alphanum().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
```

```typescript
// route usage
router.post('/register', validate(registerSchema), authController.register);
```

## Error Handling

`AppError` base class plus common subclasses — always throw the most specific one.

```typescript
// middlewares/error.middleware.ts
export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}
```

Usage:

```typescript
throw new NotFoundError('User not found');
```

## Authentication

```typescript
import { authenticate } from '../../middlewares/auth.middleware';

router.get('/me', authenticate, authController.getMe);
```

`authenticate` adds `req.user` with the authenticated user's ID after verifying the JWT.

## Rate Limiting

```typescript
import { authLimiter } from '../../middlewares/rateLimiter.middleware';

router.post('/login', authLimiter, authController.login);
```

## Logging (Pino)

```typescript
// src/utils/logger.ts
import pino from 'pino';
import { config } from '../config/env';

const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  transport:
    config.nodeEnv !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined, // raw JSON in prod for log aggregators (Datadog/ELK/etc.)
});

export default logger;
```

```typescript
// app.ts — request-scoped logging replaces morgan
import pinoHttp from 'pino-http';
import logger from './utils/logger';

app.use(pinoHttp({ logger }));
```

Rules:
- Use `logger.error(err, 'message')` for errors, `logger.warn`, `logger.info`, `logger.debug` elsewhere.
- Inside request handlers, prefer `req.log.info(...)` so logs are automatically tagged with the request ID.
- Never use `console.log`/`console.error` anywhere in `src/`.
- Dev output is colorized automatically by `pino-pretty` (red = error, yellow = warn, green = info, blue = debug). Production emits structured JSON — do not add color codes in prod.

## Database

### Model Pattern

```typescript
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from './auth.interface';

const UserSchema = new Schema<IUser>(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
```

### Connection & Graceful Shutdown

```typescript
// server.ts
import { connectDB, disconnectDB } from './config/db';
import logger from './utils/logger';
import app from './app';
import { config } from './config/env';

const start = async (): Promise<void> => {
  await connectDB();
  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    logger.warn(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
```

## Configuration (env.ts — validated, no silent fallbacks for secrets)

```typescript
import Joi from 'joi';

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(8000),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
}).unknown(true);

const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoUri: envVars.MONGODB_URI,
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
};
```

## Middleware Stack (app.ts) — order matters

```typescript
import pinoHttp from 'pino-http';
import logger from './utils/logger';

// Security
app.use(helmet());
app.use(cors());
app.use(globalLimiter);
app.use(hpp());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Utility
app.use(compression());
app.use(pinoHttp({ logger })); // replaces morgan

// Routes
app.use('/api/v1', routes);

// Error handler (must be last)
app.use(errorHandler);
```

## Routes

```typescript
// routes/v1/index.ts
const defaultIRoute: IRoute[] = [
  { path: '/auth', route: authRoute },
  { path: '/wordle', route: wordleRoute },
  { path: '/stats', route: statsRoute },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});
```

```typescript
// routes/v1/auth.route.ts
import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authController, authValidation } from '../../modules/auth';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/login', authLimiter, validate(authValidation.loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);

export default router;
```

## Creating New Modules

```bash
npm run module:create <module-name>
```

Generates controller, service, repository, model, interface, and validation files with CRUD scaffolding.

**Manual steps after generation:**
1. Add fields to `[module].interface.ts`
2. Add schema fields to `[module].model.ts`
3. Add validation rules to `[module].validate.ts`
4. Wire repository methods in `[module].repository.ts`
5. Register route in `routes/v1/index.ts`

## TypeScript Configuration

- **Target**: ES2020
- **Module**: CommonJS
- **Strict mode**: Enabled
- **Output**: `dist/`
- **Path aliases**: `src/*` → `src/*`

## Build & Development Scripts

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "lint": "eslint src/**/*.ts",
  "lint:fix": "eslint src/**/*.ts --fix",
  "format": "prettier --write src/**/*.ts"
}
```

## Docker (multi-stage build)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
USER nodejs
CMD ["node", "dist/server.js"]
```

## Security Best Practices

1. Helmet for security headers
2. CORS configured explicitly (not wide open)
3. Rate limiting on sensitive endpoints (auth, password reset)
4. HPP for HTTP parameter pollution protection
5. bcrypt password hashing, salt rounds = 12
6. JWT signed with a required, validated env secret (min 32 chars, no fallback)
7. Joi validation on every request input
8. Docker runs as non-root user
9. Body size limit of 10kb to reduce DoS surface

## Key Dependencies

### Core
- express, mongoose, joi, jsonwebtoken, bcryptjs

### Security
- helmet, cors, hpp, express-rate-limit

### Logging
- pino, pino-http, pino-pretty (dev only)

### Utilities
- compression, dotenv, http-status

## Response Format Convention

```typescript
// Success
res.status(httpStatus.OK).json({
  status: 'success',
  message: 'Operation successful',
  data: result,
});

// Errors are thrown as AppError subclasses and handled centrally —
// never format error responses manually in a controller.
```

---
**Agent instructions summary:** When generating new code for this repo, follow this file exactly — module structure, Joi validation, repository layer between service and Mongoose, `AppError` subclasses for errors, and Pino (`logger` / `req.log`) for all logging. Do not introduce `console.log`, Winston, Morgan, or Zod unless explicitly asked to change this file.