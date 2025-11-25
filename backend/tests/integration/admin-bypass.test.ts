import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

describe('ADMIN bypass behavior for hierarchy endpoints', () => {
  beforeEach(async () => {
    await prisma.userPermission.deleteMany();
    await prisma.buildingResource.deleteMany();
    await prisma.building.deleteMany();
    await prisma.buildingCategory.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();
    await prisma.hierarchyLevel.deleteMany();
  });

  it('allows ADMIN to fetch effective-permissions for a user with no hierarchy assignment', async () => {
    const admin = await prisma.user.create({ data: { firstName: 'A', lastName: 'Admin', username: 'admintest2', email: 'admintest2@example.com', password: 'x', role: 'ADMIN' } });
    const target = await prisma.user.create({ data: { firstName: 'T', lastName: 'Target', username: 'target1', email: 'target1@example.com', password: 'x', role: 'MAYOR' } });

    const cat = await prisma.buildingCategory.create({ data: { name: 'cat-a', description: 'Cat A' } });
    await prisma.userPermission.create({ data: { userId: target.id, categoryId: cat.id, canBuild: true } });

    const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET);

    const res = await request(app).get(`/api/hierarchy/users/${target.id}/effective-permissions`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find((r: any) => r.categoryId === cat.id);
    expect(found).toBeTruthy();
    expect(found.directCanBuild).toBe(true);
  });

  it('allows ADMIN to fetch subordinates for a user with no hierarchy assignment (returns empty array)', async () => {
    const admin = await prisma.user.create({ data: { firstName: 'A', lastName: 'Admin', username: 'admintest3', email: 'admintest3@example.com', password: 'x', role: 'ADMIN' } });
    const target = await prisma.user.create({ data: { firstName: 'T', lastName: 'Target', username: 'target2', email: 'target2@example.com', password: 'x', role: 'MAYOR' } });

    const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET);
    const res = await request(app).get(`/api/hierarchy/users/subordinates/${target.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('allows ADMIN to fetch allowed-buildings for a user with no hierarchy assignment', async () => {
    const admin = await prisma.user.create({ data: { firstName: 'A', lastName: 'Admin', username: 'admintest4', email: 'admintest4@example.com', password: 'x', role: 'ADMIN' } });
    const target = await prisma.user.create({ data: { firstName: 'T', lastName: 'Target', username: 'target3', email: 'target3@example.com', password: 'x', role: 'MAYOR' } });

    const cat = await prisma.buildingCategory.create({ data: { name: 'cat-b', description: 'Cat B', buildings: { create: [{ name: 'B1', level: 1, sizeX: 1, sizeY: 1, powerUsage: 0, powerOutput: 0, waterUsage: 0, waterOutput: 0 }] } }, include: { buildings: true } });

    const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET);

    const res = await request(app).get(`/api/hierarchy/buildings/allowed/${target.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns 404 when ADMIN requests a non-existent user on allowed-buildings', async () => {
    const admin = await prisma.user.create({ data: { firstName: 'A', lastName: 'Admin', username: 'admintest5', email: 'admintest5@example.com', password: 'x', role: 'ADMIN' } });
    const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET);

    const res = await request(app).get(`/api/hierarchy/buildings/allowed/9999999`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Target user not found');
  });
});
