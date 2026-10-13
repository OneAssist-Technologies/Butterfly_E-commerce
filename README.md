# Butterfly E-Commerce Full-Stack Architecture

A production-ready full-stack application built with **Next.js (App Router)**, **NestJS**, **PostgreSQL**, and **Prisma ORM (v7)**.

---

## 1. Project Architecture & Responsibilities

The workspace is organized into a clean multi-package layout:

```text
butterfly_E-commerce/
├── frontend/ (or Butterfly_frontend/)
│   ├── public/
│   ├── src/
│   │   ├── app/                    # Next.js App Router (layout, page, globals.css)
│   │   ├── components/
│   │   │   ├── admin/              # Admin-specific components
│   │   │   ├── animations/         # Animation components
│   │   │   ├── cards/              # Card components (StatusCard)
│   │   │   ├── layout/             # Layout components (Header, Footer)
│   │   │   ├── sections/           # Section-level components
│   │   │   ├── shared/             # Reusable shared components
│   │   │   └── ui/                 # Reusable UI primitives (Button, Badge)
│   │   ├── config/                 # Application configuration
│   │   ├── hooks/                  # Custom React hooks (useHealth)
│   │   ├── lib/                    # Reusable Axios instance (api.ts)
│   │   ├── providers/              # Application React providers wrapper
│   │   ├── router/                 # Shared route constants
│   │   ├── services/               # API service functions (healthService)
│   │   ├── types/                  # Shared TypeScript interfaces
│   │   └── utils/                  # Utility helpers (cn)
│   ├── .env.example
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── main.ts                 # Bootstrap with global prefix (/api/v1), CORS, ValidationPipe
│   │   ├── app.module.ts           # Root module composing Config, Database, and Health modules
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── common/                 # Filters, Guards, Interceptors, Pipes, Decorators
│   │   ├── config/                 # Environment configuration helpers
│   │   ├── database/               # DatabaseModule & PrismaService with @prisma/adapter-pg
│   │   ├── generated/prisma/       # Prisma 7 generated client
│   │   ├── modules/
│   │   │   └── health/             # Health module with GET /api/v1/health & DB ping
│   │   └── shared/                 # Shared backend utilities
│   ├── prisma/
│   │   ├── schema.prisma           # Schema with User model
│   │   └── migrations/             # Initial migration SQL (20261013110000_init_user)
│   ├── prisma7.config.ts           # Prisma 7 configuration file
│   ├── test/
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── package.json                    # Root script runner for frontend and backend
└── README.md
```

### Frontend Responsibilities
- User interface and presentation layer using Next.js App Router and Tailwind CSS.
- Client-side data fetching through an Axios instance (`src/lib/api.ts`) configured with `NEXT_PUBLIC_API_URL`.
- Clean component separation (`ui`, `layout`, `cards`, `admin`, `sections`).
- Type-safe contracts matching backend payload models.

### Backend Responsibilities
- REST API service built with NestJS in ECMAScript Modules (ESM) mode.
- Global route prefix: `/api/v1`.
- Global `ValidationPipe` with payload transformation and whitelisting.
- Configurable CORS support for the Next.js origin (`FRONTEND_URL`).
- Database abstraction using Prisma ORM (v7) and `@prisma/adapter-pg`.
- Service health monitoring via `GET /api/v1/health` verifying both runtime and database connectivity.

---

## 2. Prerequisites

- **Node.js**: `v20+` or `v24+` (`v24.13.0` tested)
- **npm**: `v10+` or `v11+` (`11.6.2` tested)
- **PostgreSQL**: `v14+` or `v18+` running locally on port `5432`

---

## 3. Environment Variable Configuration

### Frontend Setup
Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
# In frontend directory
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Backend Setup
Copy `backend/.env.example` to `backend/.env`:

```bash
# In backend directory
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/butterfly_ecommerce?schema=public"
NODE_ENV=development
```
> Replace `YOUR_PASSWORD` with your local PostgreSQL password.

---

## 4. PostgreSQL Database Creation

If you haven't created the database yet, run in `psql` or PostgreSQL pgAdmin / query tool:

```sql
CREATE DATABASE butterfly_ecommerce;
```

---

## 5. Prisma Migration & Client Generation

The Prisma schema defines the initial `User` model:
- `id`: UUID primary key
- `name`: string
- `email`: unique string
- `createdAt`: timestamp with default `now()`
- `updatedAt`: automatically updated timestamp

### Generate Prisma Client:
```bash
npm run prisma:generate --prefix backend
# or inside backend:
npm run prisma:generate
```

### Apply Migration to PostgreSQL:
When your PostgreSQL instance is running with valid credentials in `backend/.env`:

```bash
npm run prisma:migrate --prefix backend
# or inside backend:
npm run prisma:migrate
```

### Production Migration Deploy:
```bash
npm run prisma:migrate:deploy --prefix backend
```

---

## 6. Running the Applications

### Start Backend Development Server (Port 3001):
```bash
npm run dev:backend
# or from backend/:
npm run start:dev
```
- API Base URL: `http://localhost:3001/api/v1`
- Health Endpoint: `http://localhost:3001/api/v1/health`

### Start Frontend Development Server (Port 3000):
```bash
npm run dev:frontend
# or from frontend/:
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 7. Useful Commands

| Task | Root Command | Sub-directory Command |
| :--- | :--- | :--- |
| **Run Frontend Dev** | `npm run dev:frontend` | `cd frontend && npm run dev` |
| **Run Backend Dev** | `npm run dev:backend` | `cd backend && npm run start:dev` |
| **Build Frontend** | `npm run build:frontend` | `cd frontend && npm run build` |
| **Build Backend** | `npm run build:backend` | `cd backend && npm run build` |
| **Lint Frontend** | `npm run lint:frontend` | `cd frontend && npm run lint` |
| **Lint Backend** | `npm run lint:backend` | `cd backend && npm run lint` |
| **Prisma Studio** | `npm run prisma:studio` | `cd backend && npm run prisma:studio` |
| **Prisma Generate** | `npm run prisma:generate` | `cd backend && npm run prisma:generate` |
| **Prisma Migrate** | `npm run prisma:migrate` | `cd backend && npm run prisma:migrate` |

---

## 8. Health Check Verification

Calling `GET http://localhost:3001/api/v1/health` returns:

```json
{
  "status": "ok",
  "timestamp": "2026-10-13T06:39:58.418Z",
  "uptime": 70,
  "environment": "development",
  "services": {
    "database": {
      "status": "up"
    }
  }
}
```
If the database connection is offline or credentials need updating in `.env`, the health endpoint reports `database: { "status": "down", "message": "..." }` gracefully without crashing the server.
