import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });
    console.log('Users in database:');
    users.forEach((u) => {
      console.log(`- id=${u.id} username=${u.username} email=${u.email} role=${u.role} mayorId=${u.mayorId}`);
    });
    console.log('\nCount:', users.length);
  } catch (e) {
    console.error('Error listing users:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
