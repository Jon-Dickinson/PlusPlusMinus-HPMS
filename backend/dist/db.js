// db.ts
import { PrismaClient } from '@prisma/client';
const prisma = global.prisma ||
    new PrismaClient({
        log: ['query', 'info', 'warn', 'error'], // Log all DB queries
    });
if (process.env.NODE_ENV !== 'production')
    global.prisma = prisma;
export { prisma };
