# City Builder: Hierarchical City Simulation & User Management System

<p align="center">
  <img src="./frontend/public/dashboard.png" alt="City Simulation Dashboard" width="100%">
</p>


# PlusPlusMinus (City Builder / HPMS)

## Summary

**PlusPlusMinus (HPMS)** is a full-stack City Builder application built with a **Next.js + TypeScript** frontend, a **Node.js + Express + TypeScript** backend, and a **PostgreSQL** database managed with **Prisma**.  

It includes:

- Hierarchical role-based permissions (ADMIN / MAYOR / VIEWER)
- Seeded demo hierarchy data
- A dynamic City Builder UI
- REST API with OpenAPI documentation
- Automated seeding scripts for large dataset testing

---

## High-Level Architecture

### **Client (Frontend)**
- **Next.js (React + TypeScript)**
- Server-side rendering + client-side interactivity
- `styled-components` for UI styling
- Component-based UI structure

### **API Server (Backend)**
- **Node.js + Express.js (TypeScript)**
- Modular architecture (routes → controllers → services)
- Authentication middleware (JWT)
- Hierarchy & permissions middleware
- REST endpoints documented via Swagger/OpenAPI

### **Database**
- **PostgreSQL** (Neon configuration)
- **Prisma ORM** for schema, migrations, seed scripts, and typed DB client

### **Documentation / Tooling**
- **OpenAPI/Swagger UI** served at `/api/docs`  
- Testing via **Vitest** (unit + integration + performance)
- Heavy seeding script (`run-seed-large.ts`)

---

## Tech Stack / Core Libraries

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js, React, TypeScript, styled-components |
| **Backend** | Node.js, Express, TypeScript, Prisma, Zod, bcryptjs, jsonwebtoken, swagger-ui-express |
| **Database** | PostgreSQL (Neon), Prisma Migrations & Seeders |
| **Testing** | Vitest (unit + integration + performance) |
| **Deployment** | Railway (production), Local dev via `.env` PORT=4000 |

---

## Project Layout (Folder Summary)
```
/backend
├── src/routes # All API route definitions
├── src/controllers # Request handlers
├── src/services # Business logic & database access
├── prisma/ # Prisma schema, migrations, seeders
├── docs/openapi.json # API documentation
├── scripts/run-seed-large.ts# Large dataset seeding for scale tests

/frontend
├── pages/ # Next.js pages
├── components/ # Reusable UI components
├── hooks/ # Custom React hooks
├── lib/ # API client helpers & utilities
├── tests/ # Vitest tests

Root
├── README.md
└── environment configs
```

All seeded accounts use the same default password and an email generated from the username:

- Default password: `Password123!`
- Email pattern: `username@example.com` (e.g., `admin@example.com`, `national1@example.com`, `city1A_mayor1@example.com`, `viewer1@example.com`)

#### Admin Users
```
| Role | Email | Access Level |
|------|--------|--------------|
| **Admin** | `admin@example.com` | Full system access |
```
#### National Level Mayors (All Buildings)
```
| Role | Email | City Assignment | Building Access |
|------|--------|-----------------|-----------------|
| **National Mayor** | `national1@example.com` | National Capital - National1's District | All 8 building types |
| **National Mayor** | `national2@example.com` | National Capital - National2's District | All 8 building types |
```
#### City Level Mayors (6 Building Types)
```
| Role | Email (examples from seed) | City Assignment | Building Access |
|------|-----------------------------|-----------------|-----------------|
| **City Mayor** | `city1a1@example.com` | City 1-1 | Commercial, Emergency, Energy, Utilities, Residential, Agriculture |
| **City Mayor** | `city1a2@example.com` | City 1-1 | Commercial, Emergency, Energy, Utilities, Residential, Agriculture |
| **City Mayor** | `city1b1@example.com` | City 1-2 | Commercial, Emergency, Energy, Utilities, Residential, Agriculture |
| **City Mayor** | `city1b2@example.com` | City 1-2 | Commercial, Emergency, Energy, Utilities, Residential, Agriculture |
```
#### Suburb Level Mayors (2 Building Types)
```
| Role | Email (examples from seed) | City / Suburb Assignment | Building Access |
|------|-----------------------------|--------------------------|-----------------|
| **Suburb Mayor** | `suburb_1-1-1_mayor1@example.com` | Suburb 1-1-1 Township | Residential, Agriculture only |
| **Suburb Mayor** | `suburb_1-1-1_mayor2@example.com` | Suburb 1-1-1 Township | Residential, Agriculture only |
| **Suburb Mayor** | `suburb_1-1-2_mayor1@example.com` | Suburb 1-1-2 Township | Residential, Agriculture only |
| **Suburb Mayor** | `suburb_1-1-2_mayor2@example.com` | Suburb 1-1-2 Township | Residential, Agriculture only |
| **Suburb Mayor** | `suburb_2-1-1_mayor1@example.com` | Suburb 2-1-1 Township | Residential, Agriculture only |
| **Suburb Mayor** | `suburb_2-1-1_mayor2@example.com` | Suburb 2-1-1 Township | Residential, Agriculture only |
| **Suburb Mayor** | `suburb_2-1-2_mayor1@example.com` | Suburb 2-1-2 Township | Residential, Agriculture only |
| **Suburb Mayor** | `suburb_2-1-2_mayor2@example.com` | Suburb 2-1-2 Township | Residential, Agriculture only |
```
#### Viewers (Read-Only Access)
```
| Role | Email pattern | Access Level |
|------|----------------|--------------|
| **Viewer** | `viewer<number>@example.com` | Read-only access to the mayor's assigned level (viewer is assigned to a mayor and follows their hierarchy node)
```
---

## Seeded hierarchy (visualized)

The development seed produces a single system root owned by the Admin user — all other nodes attach beneath it so every Mayor/Viewer chain traces back to the root.

```
Admin Root (Level 0)
|-- National 1 (Level 1)
|   |-- City 1-1 (Level 2)
|   |   |-- Suburb 1-1-1 (Level 3)
|   |   `-- Suburb 1-1-2 (Level 3)
|   `-- City 1-2 (Level 2)
|       |-- Suburb 1-2-1 (Level 3)
|       `-- Suburb 1-2-2 (Level 3)
`-- National 2 (Level 1)
    |-- City 2-1 (Level 2)
    |   |-- Suburb 2-1-1 (Level 3)
    |   `-- Suburb 2-1-2 (Level 3)
    `-- City 2-2 (Level 2)
        |-- Suburb 2-2-1 (Level 3)
        `-- Suburb 2-2-2 (Level 3)
```

### Modular Architecture
- **Frontend:** Next.js + Styled-Components for modern, component-driven design  
- **Backend:** Express + Prisma + Neon PostgreSQL

```
npx dotenv -e .env -- npx prisma studio
http://localhost:5555/
```

- **Clean separation:** `/controllers`, `/services`, `/routes`, `/middlewares`, `/validators`

### UI 
- Dark UI
- Draggable isometric building icons for each category  
- Consistent color palette mapping to resource types:  
  - **Power** → `#FFD52B`  
  - **Water** → `#0068FF`  
  - **Population** → `#2FBF4A`  
  - **Services** → `#EE3E36`  
  - **Food** → `#704214`  

---
## Database Model Highlights (Prisma)

Key models include:

- **User**
  - `id`, `firstName`, `lastName`, `username`, `email`
  - `password`, `role`, `hierarchyId`, `mayorId`
  - Linked to hierarchy and permission tables

- **City**
  - `id`, `name`, `mayorId`
  - `gridState`, `buildingLog`, `qualityIndex`
  - timestamps

- **BuildLog**
  - Tracks all city build actions

- **Note**
  - Per-user notes, editable by mayors/admins

- **HierarchyLevel**
  - Self-referencing tree structure (`parentId` → children)
  - Users assigned to nodes

- **BuildingCategories**, **Building**, **BuildingResource**
  - City Builder components & simulation values

- **UserPermission**
  - Mapping of allowed building categories per user  
  - Unique constraint on `(userId, categoryId)`

Refer to **schema.prisma** for the complete model definitions.

---

## Authentication & Guarding

- **JWT-based authentication**
  - Token signed with `JWT_SECRET` from `.env`

- **Role guarding**
  - ADMIN / MAYOR / VIEWER
  - Utilities to check role access on protected endpoints

- **Hierarchy middleware**
  - Ensures users can read or write only within their subtree
  - ADMIN bypass logic for system-wide visibility

- Example:
GET /api/hierarchy/users/:userId/effective-permissions

markdown
Copy code
Supports inheritance across hierarchy levels.

---

## Selected API Endpoints

### **Authentication**
- `POST /api/auth/register`
- `POST /api/auth/login`

### **Users**
- `GET /api/users` (admin list)
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `PUT /api/users/:id/permissions`
- `GET /api/users/mayors`

### **Cities**
- `GET /api/cities/`
- `POST /api/cities/`
- `GET /api/cities/:id`
- `PUT /api/cities/:id`
- `/api/cities/:id/data GET/PUT`
- `/api/cities/user/:userId` (city by user)
- `/api/cities/user/:userId/save` (save grid)

### **Buildings**
- `GET /api/buildings/categories`
- `GET /api/buildings`
- CRUD for building types

### **Notes**
- `GET /api/notes/:userId`
- `PUT /api/notes/:userId`

### **Hierarchy**
- `GET /api/hierarchy/tree`
- `GET /api/hierarchy/buildings/allowed/:userId`
- `GET /api/hierarchy/users/subordinates/:userId`
- `GET /api/hierarchy/users/:userId/effective-permissions`

### **Docs**
- `/api/docs` (Swagger UI)
- `/api/docs/json` (raw OpenAPI)

---

## Testing & Quality

- **Vitest**
- Unit tests
- Integration tests for controllers/middleware
- Performance tests (load, data volume)

- **CI Type Safety**
- `npx tsc --noEmit` ensures no type regressions

- **Large-scale testing**
- `run-seed-large.ts` generates thousands of cities/users for scale validation

---

##  Dev Workflow (Quick Commands)

**Backend:**
```bash
cd backend

npm run build
npx prisma migrate deploy
npm run seed
```

**Frontend:**
```bash
cd frontend

npm run dev
npx vitest
```

Swagger Docs (local):
UI: http://localhost:4000/api/docs

JSON: http://localhost:4000/api/docs/json

Swagger Docs (prod):
https://passionate-contentment-production.up.railway.app/api/docs/

### Neon
https://console.neon.tech/app/projects/calm-dream-36516261/auth?tab=configuration
