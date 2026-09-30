# URL Shortener Backend (API Service)

A robust, high-performance URL Shortener REST API built with **Node.js**, **Express 5**, and **PostgreSQL**. Designed with a clean **Layered Architecture** (Controller-Service-Repository pattern) and enterprise-grade conventions such as **UUID primary keys** and **JWT Bearer authentication**.

---

## 🚀 Features

- **Layered Architecture**: Clear separation of concerns (`Controller` ➔ `Service` ➔ `Repository` ➔ `Database`).
- **UUID Standard**: All entity IDs are standardized to 128-bit UUID strings generated via PostgreSQL `gen_random_uuid()`.
- **JWT Authentication**: Secure stateless authentication using JSON Web Tokens and `bcryptjs` password hashing.
- **Auto Table Initialization**: Automatic PostgreSQL schema generation and non-breaking UUID migrations on connection.
- **Database Seeding**: One-command seed script to quickly bootstrap development environments.
- **Health Monitoring**: Dedicated health check endpoint reporting live database connectivity status.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** (v18+) | JavaScript Runtime (using native `--watch` dev mode) |
| **Express 5** | High-performance Web Framework |
| **PostgreSQL** | Relational Database with connection pooling (`pg`) |
| **JSON Web Token** (`jsonwebtoken`) | Stateless Authorization |
| **Bcrypt.js** | Salted Password Hashing |
| **CORS & Dotenv** | Security & Environment Management |

---

## 📁 Project Structure

```text
url_shortner_be/
├── config/
│   └── db.js                 # PostgreSQL connection pool & lifecycle
├── controller/
│   └── auth.controller.js    # HTTP request handling & status codes
├── middleware/
│   └── auth.middleware.js    # JWT Bearer verification middleware
├── repository/
│   └── user.repository.js    # Raw SQL queries & table initialization
├── routes/
│   └── auth.routes.js        # Auth router definition
├── services/
│   └── auth.service.js       # Business logic, validation, & token generation
├── .env.example              # Template for environment configuration
├── index.js                  # Application entry point & server bootstrap
├── package.json              # Dependencies and scripts
└── seed.js                   # Database seeder script
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.11.0 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (v13 or higher recommended)
- A running PostgreSQL database instance (e.g., named `url_shortener`)

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Environment Configuration

Copy the example `.env` file and configure your credentials:

```bash
cp .env.example .env
```

Edit `.env` to match your local PostgreSQL setup:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=url_shortener

# JWT Configuration
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=1d
```

### 3. Database Seeding

Run the seed script to initialize tables and insert a default administrator account:

```bash
npm run seed
```

Default credentials created:
- **Email**: `admin@example.com`
- **Password**: `password123`

### 4. Running the Server

Start in development mode (with file-watch auto-reload):

```bash
npm run dev
```

Start in production mode:

```bash
npm start
```

The server will be available at: `http://localhost:5000`

---

## 📡 API Reference

Base URL: `http://localhost:5000`

### 1. Health Check

Checks server and database connection status.

- **URL**: `/health`
- **Method**: `GET`
- **Auth Required**: No

**Response (200 OK):**
```json
{
  "status": "OK",
  "database": "connected"
}
```

---

### 2. User Signup

Registers a new user and generates a JWT token.

- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Auth Required**: No
- **Headers**: `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "c3a8d9a4-1234-4b5c-8901-23456789abcd",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "created_at": "2026-09-30T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. User Login

Authenticates user credentials and returns a JWT token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Headers**: `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Admin User",
    "email": "admin@example.com",
    "created_at": "2026-09-30T04:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Get Current User (Me)

Fetches the authenticated user's profile using the Bearer token.

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer <token>`)
- **Headers**: `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "user": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Admin User",
    "email": "admin@example.com",
    "created_at": "2026-09-30T04:30:00.000Z"
  }
}
```

---

## 🏛 Architectural Standards & Conventions

1. **UUID Identifier Standard**: All primary keys are `UUID` types using `gen_random_uuid()`:
   ```sql
   id UUID PRIMARY KEY DEFAULT gen_random_uuid()
   ```
2. **Layer Responsibilities**:
   - **Routes**: Map paths to controller methods and attach middlewares.
   - **Controllers**: Parse requests, extract parameters, and handle HTTP response codes.
   - **Services**: Contain pure business logic, password hashing, and token signing.
   - **Repositories**: Execute raw parameterized SQL queries with PostgreSQL.
3. **Database Security**: Never store plaintext passwords; all passwords are encrypted with `bcrypt` salt rounds (10).

---

## 📜 License

This project is licensed under the ISC License.
