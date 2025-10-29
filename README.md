# PlusPlusMinus-HPMS
plusplusminus PPM-FS-Challenge

## Trello

```
https://trello.com/b/dy9uG8Vx/plusplusminus
```

## backend

### Neon

```
https://console.neon.tech/app/projects/calm-dream-36516261/auth?tab=configuration
```

```
npx dotenv -e .env -- npx prisma generate

npx dotenv -e .env -- npx prisma migrate dev --name add-user-model
```

```
Loaded Prisma config from prisma.config.js.

Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-floral-base-abz6128n-pooler.eu-west-2.aws.neon.tech"
```

```
npx dotenv -e .env -- npx prisma studio
http://localhost:5555/

Regenerate prisma client:
npx dotenv -e .env -- npx prisma generate

Run the seed:
npx dotenv -e .env -- node --loader ts-node/esm seed.ts

Or via Prisma hook:
npx prisma db seed
```

```mermaid
flowchart TD
    subgraph 1["1 – DB & Foundation"]
        DB["Prisma Schema + Neon DB"]
        Seed["Seed Roles / Structures / Users"]
    end

    subgraph 2["2 – Auth & Role Logic"]
        Auth["JWT Authentication"]
        RoleUtils["Role Utilities + Inheritance Logic"]
    end

    subgraph 3["3 – API & Validation"]
        REST["REST Endpoints + Swagger Docs"]
        Zod["Zod Validation + Error Middleware"]
    end

    subgraph 4_5["4–5 – Frontend"]
        NextJS["Next.js App + Auth UI"]
        CityMap["Hierarchy Visualization: Structure → City → Suburb"]
    end

    subgraph 6["6 – Testing & Docs"]
        Tests["Jest + Integration Tests"]
        Docs["README + Architecture + Performance Notes"]
    end

    subgraph 7["7 – Polish & Deployment"]
        Deploy["Deploy to Render / Vercel"]
        Email["Submit Repo + Live Links to Melissa"]
    end

    %% Connections
    DB --> Auth
    Auth --> REST
    REST --> NextJS
    NextJS --> Tests
    Tests --> Deploy
```