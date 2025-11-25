import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

describe('Hierarchy subordinates include city info', () => {
  it('returns city object with name and qualityIndex for subordinate mayors', async () => {
    // Find hierarchy nodes (prefer seeded names, fall back to levels)
    const root = (await prisma.hierarchyLevel.findFirst({ where: { name: 'National' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 1 } }));
    const cityLevel = (await prisma.hierarchyLevel.findFirst({ where: { name: 'City' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 2 } }));

    // Create an admin (caller) and an ancestor + subordinate mayors
    const admin = await prisma.user.create({ data: { firstName: 'T', lastName: 'Admin', username: `test-admin-${Date.now()}`, email: `t-admin-${Date.now()}@t`, password: 'x', role: 'ADMIN' } });

    const natUser = await prisma.user.create({ data: { firstName: 'A', lastName: 'Ancestor', username: `anc-${Date.now()}`, email: `anc-${Date.now()}@t`, password: 'x', role: 'MAYOR', hierarchyId: root?.id } });

    const cityMayor = await prisma.user.create({ data: { firstName: 'C', lastName: 'City', username: `city-${Date.now()}`, email: `city-${Date.now()}@t`, password: 'x', role: 'MAYOR', hierarchyId: cityLevel?.id } });

    // Attach a city record to the subordinate mayor
    const city = await prisma.city.create({ data: { name: 'Test City', country: 'TC', qualityIndex: 42, buildingLog: {}, gridState: {}, mayorId: cityMayor.id } });

    const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET);

    const res = await request(app).get(`/api/hierarchy/users/subordinates/${natUser.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    // Ensure subordinate mayor appears and has the city object with qualityIndex
    const found = res.body.find((u: any) => u.id === cityMayor.id);
    expect(found).toBeTruthy();
    expect(found.city).toBeTruthy();
    expect(found.city.name).toBe('Test City');
    expect(found.city.qualityIndex).toBe(42);
  }, 20000);
});
