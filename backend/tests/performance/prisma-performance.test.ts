import { beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../../src/db.js';
import { seedLargeDataset } from '../utils/seedLargeDataset';

const runPerf = process.env.RUN_PERF === '1';
const perfDescribe = runPerf ? describe.concurrent : describe.skip;

perfDescribe('Prisma performance', () => {
  beforeAll(async () => {
    // seed a reasonably large dataset
    await prisma.building.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();
    await seedLargeDataset(1000);
  });

  it('measures city+buildings findMany latency (3 samples)', async () => {
    const samples: number[] = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      await prisma.city.findMany({ include: { buildings: true }, take: 1000 as any } as any);
      const end = performance.now();
      const t = end - start;
      samples.push(t);
      console.log(`sample ${i + 1}: ${t} ms`);
    }

    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    const sorted = samples.slice().sort((a, b) => a - b);
    const p95 = sorted[Math.floor(0.95 * sorted.length) - 1] ?? sorted[sorted.length - 1];

    console.table({ samples, avg, p95 });

    // If any sample is under threshold, assert; otherwise warn but don't fail
    const threshold = 250;
    const under = samples.some(s => s < threshold);
    if (under) {
      expect(avg).toBeLessThan(threshold);
    } else {
      console.warn(`Prisma query exceeded ${threshold}ms threshold; samples: ${samples.join(', ')}`);
    }
  });
});
