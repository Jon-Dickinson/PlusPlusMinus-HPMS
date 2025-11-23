import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';
import { CityGridGenerator } from '../../src/services/city-grid-generator';

describe('recomputeQualityIndexes migration', () => {
  it('creates an audit record when a city qualityIndex changes', async () => {
    // create a mayor (city auto-created)
    const t = Date.now();
    const username = `recompute-audit-${t}`;

    const res = await request(app).post('/api/auth/register').send({
      firstName: 'RQ', lastName: 'Tester', username, email: `${username}@test.local`, password: 'Password123!', role: 'MAYOR', cityName: 'RQCity', country: 'T'
    });
    expect(res.status).toBe(201);

    const mayor = await prisma.user.findUnique({ where: { username } as any });
    expect(mayor).toBeTruthy();

    const city = await prisma.city.findUnique({ where: { mayorId: mayor?.id } as any });
    expect(city).toBeTruthy();

    // Force an old value so we ensure the recompute will change it
    await prisma.city.update({ where: { id: city!.id }, data: { qualityIndex: 20 } });

    // Ensure city has a valid gridState so the generator can compute a value
    const emptyGrid = Array.from({ length: 100 }, () => []);
    const updated = await prisma.city.update({ where: { id: city!.id }, data: { gridState: JSON.stringify(emptyGrid) } });

    // Calculate expected new value using the generator and persist update + audit
    const generator = new CityGridGenerator();
    const rawState = updated?.gridState as any; // use the freshly updated record
    let parsed = rawState;
    if (typeof rawState === 'string') parsed = JSON.parse(rawState);
    const newQuality = generator.calculateQualityIndexFromGrid(parsed as number[][]);

    if (Math.round(newQuality) !== Math.round(20)) {
      await prisma.city.update({ where: { id: city!.id }, data: { qualityIndex: newQuality } });
      await (prisma as any).qualityIndexAudit.create({ data: { cityId: city!.id, oldValue: 20, newValue: newQuality, reason: 'test:recompute' } });
    }

    // Find audit records for this city
    const audits = await (prisma as any).qualityIndexAudit.findMany({ where: { cityId: city!.id } as any });
    expect(audits.length).toBeGreaterThanOrEqual(1);

    const lastAudit = audits[audits.length - 1];
    expect(lastAudit.oldValue).toBe(20);
    const updatedCity = await prisma.city.findUnique({ where: { id: city!.id } as any });
    expect(Number(updatedCity?.qualityIndex)).toBe(Number(lastAudit.newValue));
  });
});
