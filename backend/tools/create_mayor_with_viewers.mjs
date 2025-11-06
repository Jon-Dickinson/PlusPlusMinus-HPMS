import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configurable values — change if you want different usernames/emails
const PASSWORD = 'Password123!';
const MAYOR = { username: 'mayor2', email: 'mayor2@example.com', firstName: 'May', lastName: 'Or' };
const VIEWERS = [
  { username: 'viewer3', email: 'viewer3@example.com', firstName: 'Viewer', lastName: 'Three' },
  { username: 'viewer4', email: 'viewer4@example.com', firstName: 'Viewer', lastName: 'Four' },
];

async function ensureUser(u, role, mayorshipId = null) {
  const existing = await prisma.user.findFirst({ where: { OR: [{ username: u.username }, { email: u.email }] } });
  if (existing) {
    console.log(`Found existing user: ${existing.username} <${existing.email}> (id=${existing.id})`);
    return existing;
  }
  const hashed = await bcrypt.hash(PASSWORD, 10);
  const created = await prisma.user.create({
    data: {
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      password: hashed,
      role,
      mayorId: mayorshipId,
    },
  });
  console.log(`Created user: ${created.username} <${created.email}> (id=${created.id})`);
  return created;
}

async function main() {
  try {
    console.log('Creating mayor and viewers (if missing) — password for all: ' + PASSWORD);

    // Create mayor
    const mayor = await ensureUser(MAYOR, 'MAYOR');

    // Create viewers linked to the mayor
    const createdViewers = [];
    for (const v of VIEWERS) {
      const viewer = await ensureUser(v, 'VIEWER', mayor.id);
      createdViewers.push(viewer);
    }

    console.log('\nSummary (use these to log in):');
    console.log(`Mayor: username=${mayor.username} email=${mayor.email} password=${PASSWORD}`);
    createdViewers.forEach((v, i) => {
      console.log(`Viewer ${i + 1}: username=${v.username} email=${v.email} password=${PASSWORD}`);
    });
  } catch (e) {
    console.error('Error creating users:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
