# Task and Time Management Backend API

A secure, production-ready backend API for task and time management built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Secure Authentication**: JWT-based authentication with sign up, log in, and log out
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Input Validation**: Joi validation on all endpoints
- **Rate Limiting**: Protection against brute force attacks
- **Security Best Practices**: Helmet, CORS, HPP, and body size limits
- **Structured Logging**: Pino logger with colorized dev output and JSON production logs
- **Error Handling**: Centralized error handling with custom error classes
- **Graceful Shutdown**: Proper database connection cleanup on shutdown

## Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, HPP, Rate Limiting
- **Logging**: Pino + pino-http
- **Password Hashing**: bcryptjs
- **Package Manager**: Yarn 4.x

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration:
   ```
   NODE_ENV=development
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   JWT_EXPIRES_IN=7d
   ```

## Running the Application

### Development Mode
```bash
yarn dev
```

### Production Mode
```bash
yarn build
yarn start
```

## API Endpoints

### Authentication

#### Register
- **POST** `/api/v1/auth/register`
- **Body**: 
  ```json
  {
    "userName": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "success",
    "message": "Account created successfully",
    "data": {
      "user": {
        "id": "user_id",
        "userName": "john_doe",
        "email": "john@example.com"
      },
      "token": "jwt_token"
    }
  }
  ```

#### Login
- **POST** `/api/v1/auth/login`
- **Body**: 
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "user": {
        "id": "user_id",
        "userName": "john_doe",
        "email": "john@example.com"
      },
      "token": "jwt_token"
    }
  }
  ```

#### Get Current User
- **GET** `/api/v1/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 
  ```json
  {
    "status": "success",
    "data": {
      "id": "user_id",
      "userName": "john_doe",
      "email": "john@example.com"
    }
  }
  ```

#### Logout
- **POST** `/api/v1/auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 
  ```json
  {
    "status": "success",
    "message": "Logout successful"
  }
  ```

## Security Features

- **Helmet**: Security headers
- **CORS**: Configured cross-origin resource sharing
- **Rate Limiting**: 
  - Global: 100 requests per 15 minutes
  - Auth endpoints: 5 requests per 15 minutes
- **HPP**: HTTP parameter pollution protection
- **Body Size Limit**: 10kb to reduce DoS surface
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT**: Secure token-based authentication
- **Input Validation**: Joi validation on all endpoints

## Project Structure

```
src/
├── app.ts                          # Express app configuration
├── server.ts                       # Server entry point
├── config/
│ ├── db.ts                         # MongoDB connection
│ └── env.ts                        # Environment variables
├── middlewares/
│ ├── auth.middleware.ts           # JWT authentication
│ ├── error.middleware.ts          # Error handling
│ ├── rateLimiter.middleware.ts     # Rate limiting
│ └── validate.middleware.ts        # Joi validation
├── modules/
│ └── auth/                         # Authentication module
│ ├── index.ts
│ ├── auth.controller.ts
│ ├── auth.service.ts
│ ├── auth.repository.ts
│ ├── auth.model.ts
│ ├── auth.interface.ts
│ └── auth.validate.ts
├── routes/
│ └── v1/
│ ├── index.ts
│ └── auth.route.ts
└── utils/
├── catchAsync.ts                   # Async error wrapper
├── email.ts                        # Email utilities
└── logger.ts                       # Pino logger
```

## Development Scripts

```bash
yarn dev          # Start development server with hot reload
yarn build         # Compile TypeScript to JavaScript
yarn start         # Start production server
yarn lint          # Run ESLint
yarn lint:fix      # Fix ESLint issues
yarn format        # Format code with Prettier
```

## License

ISC
