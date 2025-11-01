// db.ts

import { PrismaClient } from '@prisma/client';

// Declare the PrismaClient instance globally or locally based on environment
// This prevents multiple instances in devessssssssssssssssssssslopment, which can cause connection issues.
// We use a global variable to ensure a singleton pattern.

// Type augmentation to add prisma to the global object in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Log all DB queries
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export { prisma };
