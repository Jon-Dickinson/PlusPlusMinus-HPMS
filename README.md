# PlusPlusMinus-HPMS
plusplusminus PPM-FS-Challenge

## backend

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
```
