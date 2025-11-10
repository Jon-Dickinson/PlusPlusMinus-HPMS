import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testHierarchyQuery() {
  console.log('Testing the same query that the API uses...\n');
  
  const result = await prisma.hierarchyLevel.findMany({
    include: {
      children: {
        include: {
          children: {
            include: {
              children: {
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
                }
              },
              users: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  role: true
                }
              }
            }
          },
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              role: true
            }
          }
        }
      },
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
    where: {
      parentId: null // Start with root level
    }
  });

  console.log('Query result:');
  console.log(JSON.stringify(result, null, 2));

  await prisma.$disconnect();
}

testHierarchyQuery().catch(console.error);