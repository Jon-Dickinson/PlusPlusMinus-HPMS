import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const buildings = await prisma.building.findMany({ orderBy: { id: 'asc' } });
    if (!buildings || buildings.length === 0) {
      console.log('No buildings found in the database.');
      return;
    }
    console.log('Buildings:');
    buildings.forEach((b) => {
      console.log(`- id=${b.id} name=${b.name} categoryId=${b.categoryId} cityId=${b.cityId}`);
    });
  } catch (e) {
    console.error('Error listing buildings:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
