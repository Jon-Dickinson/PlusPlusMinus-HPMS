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

  it('national mayor sees only lower-level mayors and viewers assigned to them (not peers)', async () => {
    const root = (await prisma.hierarchyLevel.findFirst({ where: { name: 'National' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 1 } }));
    const city = (await prisma.hierarchyLevel.findFirst({ where: { name: 'City A' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 2 } }));
    const suburb = (await prisma.hierarchyLevel.findFirst({ where: { name: 'Suburb A1' } })) || (await prisma.hierarchyLevel.findFirst({ where: { level: 3 } }));

    // Create a national mayor (the owner), subordinates at city & suburb levels,
    // another national peer, and viewers tied to different mayors.
    const natOwner = await prisma.user.create({ data: { firstName: 'N1', lastName: 'Nat', username: `natOwner-${Date.now()}`, email: `n1@${Date.now()}`, password: 'x', role: 'MAYOR', hierarchyId: root?.id } });
    const cityMayor = await prisma.user.create({ data: { firstName: 'C1', lastName: 'City', username: `cityMayor-${Date.now()}`, email: `c1@${Date.now()}`, password: 'x', role: 'MAYOR', hierarchyId: city?.id } });
    const suburbMayor = await prisma.user.create({ data: { firstName: 'S1', lastName: 'Sub', username: `subMayor-${Date.now()}`, email: `s1@${Date.now()}`, password: 'x', role: 'MAYOR', hierarchyId: suburb?.id } });

    // Another national level peer (should NOT be visible to natOwner)
    const natPeer = await prisma.user.create({ data: { firstName: 'N2', lastName: 'Peer', username: `natPeer-${Date.now()}`, email: `n2@${Date.now()}`, password: 'x', role: 'MAYOR', hierarchyId: root?.id } });

    // Viewers assigned to the subordinate mayors
    const viewerForCity = await prisma.user.create({ data: { firstName: 'V1', lastName: 'Viewer', username: `viewerCity-${Date.now()}`, email: `v1@${Date.now()}`, password: 'x', role: 'VIEWER', mayorId: cityMayor.id } });
    const viewerForPeer = await prisma.user.create({ data: { firstName: 'V2', lastName: 'Viewer', username: `viewerPeer-${Date.now()}`, email: `v2@${Date.now()}`, password: 'x', role: 'VIEWER', mayorId: natPeer.id } });

    const t = jwt.sign({ id: natOwner.id, role: natOwner.role }, SECRET);
    const res = await request(app).get(`/api/hierarchy/users/subordinates/${natOwner.id}`).set('Authorization', `Bearer ${t}`);
    expect(res.status).toBe(200);

    // Should include city and suburb mayors
    const ids = res.body.map((u: any) => u.id);
    expect(ids.includes(cityMayor.id)).toBe(true);
    expect(ids.includes(suburbMayor.id)).toBe(true);

    // Should include viewers for subordinate mayors
    expect(ids.includes(viewerForCity.id)).toBe(true);

    // Should NOT include another national peer or viewers for that peer
    expect(ids.includes(natPeer.id)).toBe(false);
    expect(ids.includes(viewerForPeer.id)).toBe(false);
  });
});
