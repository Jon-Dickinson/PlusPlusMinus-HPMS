import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserDistribution() {
  console.log('Checking user distribution across hierarchy levels...\n');
  
  // Get all hierarchy levels with their users
  const hierarchies = await prisma.hierarchyLevel.findMany({
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true
        }
      }
    },
    orderBy: {
      level: 'asc'
    }
  });

  for (const hierarchy of hierarchies) {
    console.log(`${hierarchy.name} (Level ${hierarchy.level}, ID: ${hierarchy.id})`);
    console.log(`Users count: ${hierarchy.users.length}`);
    if (hierarchy.users.length > 0) {
      hierarchy.users.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.username}) [${user.role}]`);
      });
    } else {
      console.log('  - No users assigned');
    }
    console.log('');
  }

  // Also check all users and their hierarchy assignments
  console.log('\nAll users and their hierarchy assignments:');
  const allUsers = await prisma.user.findMany({
    include: {
      hierarchy: true
    },
    orderBy: {
      username: 'asc'
    }
  });

  for (const user of allUsers) {
    console.log(`${user.username} -> ${user.hierarchy?.name || 'NO HIERARCHY'} (ID: ${user.hierarchyId})`);
  }

  await prisma.$disconnect();
}

checkUserDistribution().catch(console.error);