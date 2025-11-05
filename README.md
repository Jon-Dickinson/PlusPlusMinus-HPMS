# PlusPlusMinus: Hierarchical City Simulation & User Management System

<p align="center">
  <img src="./frontend/public/dashboard.png" alt="City Simulation Dashboard" width="100%">
</p>


## Tech Stack

| Frontend | Backend | Database | Utilities |
|:---|:---|:---|:---|
| <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /> <br> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" /> <br> <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" /> <br> <img src="https://img.shields.io/badge/Styled--Components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white" /> | <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" /> <br> <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node-dot-js&logoColor=white" /> <br> <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" /> | <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" /> <br> <img src="https://img.shields.io/badge/Neon%20DB-00E599?style=for-the-badge&logo=neon&logoColor=white" /> | <img src="https://img.shields.io/badge/bcrypt-003B57?style=for-the-badge&logo=lock&logoColor=white" /> <br> <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" /> |


---

## Overview

**PlusPlusMinus** is a full-stack simulation and management platform where users — acting as mayors — build and optimize their own cities in a shared hierarchical environment.

The system models city growth, resource distribution, and administrative oversight across three user roles:

- **Admin** — oversees all cities, reviews logs, and monitors global statistics  
- **Mayor** — builds their own city grid, manages power, water, food, and housing resources  
- **Viewer** — observes city stats in read-only mode  

Every action — from building placement to resource consumption — is tracked, logged, and visualized through an intelligent, responsive dashboard.

---

## Key Features

### 1. Dynamic City Dashboard
- Real-time grid visualization (11 × 9 blocks)  
- Drag-and-drop building placement with live stats update  
- Power, Water, Population, Services, and Food resource cards  
- Automatic recalculation of production, demand, and quality index  

### 2. Role-Based Access & Authentication
- JWT-based authentication (Admin / Mayor / Viewer)  
- Secure route protection and middleware validation  
- Role hierarchy controls backend access and UI visibility  

### 3. Scalable Data Model
- Fully normalized **Prisma schema** connecting:
  - `User` ↔ `City` ↔ `BuildLog` ↔ `Note`
  - `Building` ↔ `BuildingCategory` ↔ `BuildingResource`
- Seeded demo data for testing with default users:

| Role | Email | Password |
|------|--------|-----------|
| **Admin** | `admin@example.com` | `Password123!` |
| **Mayor** | `mayor@example.com` | `Password123!` |
| **Viewer** | `viewer@example.com` | `Password123!` |

### 4. Modular Architecture
- **Frontend:** Next.js + Styled-Components for modern, component-driven design  
- **Backend:** Express + Prisma + Neon PostgreSQL

```
npx dotenv -e .env -- npx prisma studio
http://localhost:5555/
```

- **Clean separation:** `/controllers`, `/services`, `/routes`, `/middlewares`, `/validators`

### 5. UI Design
- Sleek dark-mode interface with 2 px white grid outlines  
- Animated isometric building icons for each category  
- Consistent color palette mapping to resource types:  
  - **Power** → `#FFD52B`  
  - **Water** → `#0068FF`  
  - **Population** → `#2FBF4A`  
  - **Services** → `#EE3E36`  
  - **Food** → `#704214`  

---

## Trello

```
https://trello.com/b/dy9uG8Vx/plusplusminus
```

### Neon

```
https://console.neon.tech/app/projects/calm-dream-36516261/auth?tab=configuration
```

### Swagger

Start the server:

```
npm run build
npm run dev
```

Open the Swagger UI in your browser:
http://localhost:4000/api/docs

Raw OpenAPI JSON:
http://localhost:4000/api/docs/json

### Public API endpoints

- GET /api/public/mayors
    - Returns a list of users with role `MAYOR`. This endpoint is intentionally public (no authentication required) to allow the frontend registration page to fetch available mayors for new Viewer accounts.
    - Response shape (example):
        ```json
        [
            {
                "id": 1,
                "firstName": "Alice",
                "lastName": "Anderson",
                "role": "MAYOR",
                "city": { "name": "ZedTown", "country": "X", "qualityIndex": 42 },
                "notes": [{ "id": 1 }]
            }
        ]
        ```
    - Usage: the frontend registration form calls `/api/public/mayors` to populate a required mayor selector when creating a Viewer account. If you change the route prefix in the server, update `frontend/lib/axios.ts` or `frontend/components/organisms/RegisterForm.tsx` accordingly.

```mermaid
erDiagram
    User {
        Int id PK
        String firstName
        String lastName
        String username
        String email
        String password
        Role role
    }

    City {
        Int id PK
        String name
        String country
        Float qualityIndex
        Json buildingLog
        Json gridState
        Int mayorId FK
    }

    BuildLog {
        Int id PK
        Int cityId FK
        String action
        Int value
    }

    Note {
        Int id PK
        Int userId FK
        String content
    }

    BuildingCategory {
        Int id PK
        String name
        String description
    }

    Building {
        Int id PK
        Int cityId FK
        String name
        Int categoryId FK
        Int level
        Int sizeX
        Int sizeY
        Int powerUsage
        Int powerOutput
        Int waterUsage
        Int waterOutput
    }

    BuildingResource {
        Int id PK
        Int buildingId FK
        String type
        Int amount
    }

    User ||--o{ Note : "has"
    User ||--|{ City : "is mayor of"
    City ||--o{ BuildLog : "has"
    City ||--o{ Building : "has"
    BuildingCategory ||--o{ Building : "has"
    Building ||--o{ BuildingResource : "has"

```
