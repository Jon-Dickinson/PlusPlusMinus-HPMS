import { beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../../src/db.js';
import { seedLargeDataset } from '../utils/seedLargeDataset';

const runPerf = process.env.RUN_PERF === '1';
const perfDescribe = runPerf ? describe : describe.skip;

interface PerformanceResult {
  operation: string;
  samples: number[];
  avg: number;
  p95: number;
  min: number;
  max: number;
}

function measurePerformance(operation: string, samples: number[]): PerformanceResult {
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const sorted = samples.slice().sort((a, b) => a - b);
  const p95 = sorted[Math.floor(0.95 * sorted.length) - 1] ?? sorted[sorted.length - 1];
  const min = Math.min(...samples);
  const max = Math.max(...samples);

  return { operation, samples, avg, p95, min, max };
}

perfDescribe('Prisma performance with > 1k records', () => {
  const RECORD_COUNT = 1500; // More than 1k as requested

  beforeAll(async () => {
    console.log(`🌱 Seeding ${RECORD_COUNT} records for performance testing...`);
    const start = performance.now();

    // Clean and seed large dataset
    await prisma.buildingResource.deleteMany();
    await prisma.building.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();

    await seedLargeDataset(RECORD_COUNT);

    const end = performance.now();
    console.log(`✅ Seeding completed in ${(end - start).toFixed(2)}ms`);
  });

  it('measures city queries with includes (3 samples)', async () => {
    const samples: number[] = [];

    for (let i = 0; i < 3; i++) {
      const start = performance.now();

      // Query cities with buildings and mayor info
      const cities = await prisma.city.findMany({
        take: RECORD_COUNT,
        include: {
          buildings: {
            include: {
              resources: true,
              category: true
            }
          },
          mayor: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      const end = performance.now();
      samples.push(end - start);
      console.log(`Cities query sample ${i + 1}: ${(end - start).toFixed(2)}ms (${cities.length} cities)`);
    }

    const result = measurePerformance('Cities with buildings & mayor', samples);
    console.table([result]);

    // Performance assertions - adjusted for realistic performance
    expect(result.avg).toBeLessThan(5000); // Should complete in under 5 seconds
    expect(result.p95).toBeLessThan(6000); // 95th percentile under 6 seconds
    expect(result.max).toBeLessThan(8000); // Max under 8 seconds
  });

  it('measures user queries with complex relationships (3 samples)', async () => {
    const samples: number[] = [];

    for (let i = 0; i < 3; i++) {
      const start = performance.now();

      // Query users with their cities and viewers
      const users = await prisma.user.findMany({
        where: { role: 'MAYOR' },
        take: 100, // Limit to avoid too much data
        include: {
          city: {
            include: {
              buildings: {
                take: 5, // Limit buildings per city
                include: {
                  resources: true
                }
              }
            }
          },
          viewers: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          notes: {
            take: 3 // Limit notes
          }
        }
      });

      const end = performance.now();
      samples.push(end - start);
      console.log(`Users query sample ${i + 1}: ${(end - start).toFixed(2)}ms (${users.length} mayors)`);
    }

    const result = measurePerformance('Users with relationships', samples);
    console.table([result]);

    expect(result.avg).toBeLessThan(2500); // Average under 2.5 seconds
    expect(result.p95).toBeLessThan(3000); // 95th percentile under 3 seconds
  });

  it('measures building aggregations (3 samples)', async () => {
    const samples: number[] = [];

    for (let i = 0; i < 3; i++) {
      const start = performance.now();

      // Complex aggregation query
      const stats = await prisma.building.groupBy({
        by: ['categoryId'],
        _count: {
          id: true
        },
        _sum: {
          powerOutput: true,
          powerUsage: true,
          waterOutput: true,
          waterUsage: true
        },
        _avg: {
          level: true
        },
        having: {
          id: {
            _count: {
              gt: 1 // Only categories with multiple buildings
            }
          }
        }
      });

      const end = performance.now();
      samples.push(end - start);
      console.log(`Aggregation sample ${i + 1}: ${(end - start).toFixed(2)}ms (${stats.length} categories)`);
    }

    const result = measurePerformance('Building aggregations', samples);
    console.table([result]);

    expect(result.avg).toBeLessThan(500);
    expect(result.p95).toBeLessThan(800);
  });

  it('measures search/filter operations (3 samples)', async () => {
    const samples: number[] = [];

    for (let i = 0; i < 3; i++) {
      const start = performance.now();

      // Complex search with multiple filters
      const results = await prisma.building.findMany({
        where: {
          AND: [
            { powerOutput: { gt: 0 } },
            { sizeX: { lte: 3 } },
            { category: {
              name: {
                contains: 'seed' // From our seeded data
              }
            }}
          ]
        },
        include: {
          category: true,
          resources: true,
          city: {
            select: {
              name: true,
              mayor: {
                select: {
                  username: true
                }
              }
            }
          }
        },
        orderBy: {
          powerOutput: 'desc'
        },
        take: 50
      });

      const end = performance.now();
      samples.push(end - start);
      console.log(`Search sample ${i + 1}: ${(end - start).toFixed(2)}ms (${results.length} results)`);
    }

    const result = measurePerformance('Complex search/filter', samples);
    console.table([result]);

    expect(result.avg).toBeLessThan(600);
    expect(result.p95).toBeLessThan(900);
  });

  it('measures bulk operations performance', async () => {
    const samples: number[] = [];

    for (let i = 0; i < 3; i++) {
      const start = performance.now();

      // Simulate bulk update operation
      await prisma.$transaction(async (tx) => {
        // Update multiple buildings
        await tx.building.updateMany({
          where: {
            powerOutput: { gt: 50 }
          },
          data: {
            level: {
              increment: 1
            }
          }
        });

        // Create multiple build logs
        const cities = await tx.city.findMany({ take: 10 });
        const logs = cities.map(city => ({
          cityId: city.id,
          action: 'bulk_upgrade',
          value: 1
        }));

        await tx.buildLog.createMany({ data: logs });
      });

      const end = performance.now();
      samples.push(end - start);
      console.log(`Bulk operation sample ${i + 1}: ${(end - start).toFixed(2)}ms`);
    }

    const result = measurePerformance('Bulk operations', samples);
    console.table([result]);

    expect(result.avg).toBeLessThan(1000);
    expect(result.p95).toBeLessThan(1500);
  });

  it('stress test: concurrent operations', async () => {
    const concurrentOps = 10;
    const start = performance.now();

    // Run multiple operations concurrently
    const promises = Array.from({ length: concurrentOps }, async (_, i) => {
      const opStart = performance.now();

      // Mix of different operations
      if (i % 4 === 0) {
        await prisma.city.findMany({ include: { buildings: true }, take: 100 });
      } else if (i % 4 === 1) {
        await prisma.user.findMany({ include: { city: true }, take: 50 });
      } else if (i % 4 === 2) {
        await prisma.building.findMany({ include: { resources: true }, take: 200 });
      } else {
        await prisma.building.groupBy({
          by: ['categoryId'],
          _count: { id: true }
        });
      }

      return performance.now() - opStart;
    });

    const results = await Promise.all(promises);
    const end = performance.now();

    const totalTime = end - start;
    const avgOpTime = results.reduce((a, b) => a + b, 0) / results.length;

    console.log(`Concurrent operations (${concurrentOps}):`);
    console.log(`Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`Average per operation: ${avgOpTime.toFixed(2)}ms`);
    console.log(`Operations per second: ${(concurrentOps / (totalTime / 1000)).toFixed(2)}`);

    expect(totalTime).toBeLessThan(10000); // Should complete in under 10 seconds
    expect(avgOpTime).toBeLessThan(2000); // Average operation under 2 seconds
  });
});
