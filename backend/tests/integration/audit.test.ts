import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';

describe('Audit endpoints', () => {
  beforeEach(async () => {
    await prisma.permissionQueryAudit.deleteMany();
    await prisma.note.deleteMany();
    await prisma.buildLog.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();
  });

  it('GET /api/users/:id/audits requires ADMIN and returns paginated results', async () => {
    // create target mayor user
    const mRes = await request(app).post('/api/auth/register').send({
      firstName: 'Target', lastName: 'Mayor', username: 'tmay', email: 'tmay@test.local', password: 'maypass1', role: 'MAYOR', cityName: 'C1', country: 'T'
    });
    expect(mRes.status).toBe(201);
    const targetFromDb = await prisma.user.findUnique({ where: { username: 'tmay' } });
    expect(targetFromDb).toBeTruthy();
    const targetId = targetFromDb!.id;

    // create an admin and login
    await request(app).post('/api/auth/register').send({ firstName: 'Admin', lastName: 'A', username: 'adminx', email: 'adminx@test.local', password: 'adminpass1', role: 'ADMIN' });
    const login = await request(app).post('/api/auth/login').send({ username: 'adminx', password: 'adminpass1' });
    expect(login.status).toBe(200);
    const token = login.body.token;

    // insert some audit rows
    await prisma.permissionQueryAudit.createMany({ data: [
      { targetUserId: targetId, action: 'EFFECTIVE_PERMISSIONS', decision: 'ALLOWED', endpoint: '/api/hierarchy/users/1/effective-permissions', callerId: 999, reason: 'test1' },
      { targetUserId: targetId, action: 'ALLOWED_BUILDINGS', decision: 'DENIED', endpoint: '/api/hierarchy/buildings/allowed/1', callerId: 1000, reason: 'test2' },
      { targetUserId: targetId, action: 'EFFECTIVE_PERMISSIONS', decision: 'ALLOWED', endpoint: '/api/hierarchy/users/1/effective-permissions', callerId: 1001, reason: 'test3' }
    ]});

    // fetch audits (limit=2)
    const res = await request(app).get(`/api/users/${targetId}/audits?limit=2&offset=0`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.total).toBe('number');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(2);

    // test filtering by action
    const filtered = await request(app).get(`/api/users/${targetId}/audits?action=ALLOWED_BUILDINGS`).set('Authorization', `Bearer ${token}`);
    expect(filtered.status).toBe(200);
    expect(filtered.body.total).toBeGreaterThanOrEqual(0);
  }, 20000);

  it('creates audit entries when a user saves their city (visible to ADMIN)', async () => {
    // create target mayor user
    const mRes = await request(app).post('/api/auth/register').send({
      firstName: 'Save', lastName: 'Mayor', username: 'nsave', email: 'national1@example.com', password: 'mayorpass1', role: 'MAYOR', cityName: 'C2', country: 'T'
    });
    expect(mRes.status).toBe(201);

    // login as the mayor (owner) and save city
    const loginRes = await request(app).post('/api/auth/login').send({ username: 'nsave', password: 'mayorpass1' });
    expect(loginRes.status).toBe(200);
    const mayorToken = loginRes.body.token;

    const mayorFromDb = await prisma.user.findUnique({ where: { username: 'nsave' } });
    expect(mayorFromDb).toBeTruthy();
    const mayorId = mayorFromDb!.id;

    const payload = { buildingLog: ['b1', 'b2', 'b3'], gridState: '{}', qualityIndex: 55 };

    // Save city by userId — should create an audit entry
    const saveRes = await request(app).put(`/api/cities/user/${mayorId}/save`).set('Authorization', `Bearer ${mayorToken}`).send(payload);
    expect(saveRes.status).toBe(200);

    // create an admin and login so we can fetch audits
    await request(app).post('/api/auth/register').send({ firstName: 'Admin', lastName: 'A', username: 'admin2', email: 'admin2@test.local', password: 'adminpass1', role: 'ADMIN' });
    const login = await request(app).post('/api/auth/login').send({ username: 'admin2', password: 'adminpass1' });
    expect(login.status).toBe(200);
    const adminToken = login.body.token;

    // fetch audits for the mayor as admin
    const res = await request(app).get(`/api/users/${mayorId}/audits`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    // there should be at least one audit of action SAVE_CITY
    expect(res.body.items.some((it: any) => it.action === 'SAVE_CITY')).toBe(true);
  });
});
