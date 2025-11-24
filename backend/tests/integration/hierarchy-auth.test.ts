import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

describe('Hierarchy authorization', () => {
  it('allows ADMIN to fetch any user subordinates', async () => {
    // Prefer existing seeded hierarchy entries (tests may run against a seeded DB)
    const nat = (await prisma.hierarchyLevel.findFirst({ where: { name: 'National' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 1 } }));
    const city = (await prisma.hierarchyLevel.findFirst({ where: { name: 'City A' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 2 } }));
    const suburb = (await prisma.hierarchyLevel.findFirst({ where: { name: 'Suburb A1' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 3 } }));

    // Create users
    const admin = await prisma.user.create({ data: { firstName: 'A', lastName: 'Admin', username: `adm-${Date.now()}`, email: `adm-${Date.now()}@t`, password: 'x', role: 'ADMIN' } });
    const cityUser = await prisma.user.create({ data: { firstName: 'C', lastName: 'City', username: `city-${Date.now()}`, email: `city-${Date.now()}@t`, password: 'x', role: 'MAYOR', hierarchyId: city?.id } });
    const subUser = await prisma.user.create({ data: { firstName: 'S', lastName: 'Sub', username: `sub-${Date.now()}`, email: `sub-${Date.now()}@t`, password: 'x', role: 'MAYOR', hierarchyId: suburb?.id } });

    const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET);

    const res = await request(app).get(`/api/hierarchy/users/subordinates/${cityUser.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    // city user should have subordinate subUser
    expect(res.body.some((u: any) => u.id === subUser.id)).toBe(true);
  });

  it('allows ancestor to fetch descendant subordinates but denies unrelated', async () => {
    // Prefer existing seed hierarchy nodes where available
    const root = (await prisma.hierarchyLevel.findFirst({ where: { name: 'National' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 1 } }));
    const aCity = (await prisma.hierarchyLevel.findFirst({ where: { name: 'City A' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 2 } }));
    const aSub = (await prisma.hierarchyLevel.findFirst({ where: { name: 'Suburb A1' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 3 } }));

    const natUser = await prisma.user.create({ data: { firstName: 'N', lastName: 'Nat', username: `nat-${Date.now()}`, email: `n@${Date.now()}`, password: 'x', role: 'MAYOR', hierarchyId: root?.id } });
    const cityUser = await prisma.user.create({ data: { firstName: 'C', lastName: 'City', username: `city2-${Date.now()}`, email: `c@${Date.now()}`, password: 'x', role: 'MAYOR', hierarchyId: aCity?.id } });

    // Create an unrelated user with no hierarchy assignment so natUser should not
    // be able to fetch their subordinates.
    const otherCityUser = await prisma.user.create({ data: { firstName: 'O', lastName: 'Other', username: `other-${Date.now()}`, email: `o@${Date.now()}`, password: 'x', role: 'MAYOR' } });

    const natToken = jwt.sign({ id: natUser.id, role: natUser.role }, SECRET);
    const cityRes = await request(app).get(`/api/hierarchy/users/subordinates/${cityUser.id}`).set('Authorization', `Bearer ${natToken}`);
    expect(cityRes.status).toBe(200);

    // natUser is not ancestor of otherCityUser -> should be forbidden
    const forbidden = await request(app).get(`/api/hierarchy/users/subordinates/${otherCityUser.id}`).set('Authorization', `Bearer ${natToken}`);
    expect(forbidden.status).toBe(403);
  });

  it('allows owner to fetch their own subordinate list', async () => {
    const r = (await prisma.hierarchyLevel.findFirst({ where: { name: 'National' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 1 } }));
    const c = (await prisma.hierarchyLevel.findFirst({ where: { name: 'City A' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 2 } }));
    const user = await prisma.user.create({ data: { firstName: 'U', lastName: 'Own', username: `own-${Date.now()}`, email: `o2@${Date.now()}`, password: 'x', role: 'MAYOR', hierarchyId: c?.id } });
    const t = jwt.sign({ id: user.id, role: user.role }, SECRET);
    const res = await request(app).get(`/api/hierarchy/users/subordinates/${user.id}`).set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);
  });
});
