import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

describe('Effective permissions endpoint', () => {
  beforeEach(async () => {
    // cleanup in correct order
    await prisma.userPermission.deleteMany();
    await prisma.buildingResource.deleteMany();
    await prisma.building.deleteMany();
    await prisma.buildingCategory.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();
    await prisma.hierarchyLevel.deleteMany();
  });

  it('returns 404 for missing user when called by admin', async () => {
    const root = await prisma.hierarchyLevel.create({ data: { name: 'Admin Root', level: 0 } });
    const admin = await prisma.user.create({ data: { firstName: 'A', lastName: 'Admin', username: 'admintest', email: 'admintest@example.com', password: 'x', role: 'ADMIN', hierarchyId: root.id } });

    const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET);

    const res = await request(app).get(`/api/hierarchy/users/99999/effective-permissions`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('returns effective permission list for existing user', async () => {
    // create hierarchy and users
    const root = await prisma.hierarchyLevel.create({ data: { name: 'Admin Root', level: 0 } });
    const national = await prisma.hierarchyLevel.create({ data: { name: 'National 1', level: 1, parentId: root.id } });
    const city = await prisma.hierarchyLevel.create({ data: { name: 'City 1-1', level: 2, parentId: national.id } });

    const admin = await prisma.user.create({ data: { firstName: 'A', lastName: 'Admin', username: 'admintest', email: 'admintest@example.com', password: 'x', role: 'ADMIN', hierarchyId: root.id } });
    const mayor = await prisma.user.create({ data: { firstName: 'M', lastName: 'Mayor', username: 'mayortest', email: 'mayortest@example.com', password: 'x', role: 'MAYOR', hierarchyId: city.id } });

    // create a category and assign permission to mayor
    const cat = await prisma.buildingCategory.create({ data: { name: 'test-cat', description: 'Test category' } });
    await prisma.userPermission.create({ data: { userId: mayor.id, categoryId: cat.id, canBuild: true } });

    const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET);

    const res = await request(app).get(`/api/hierarchy/users/${mayor.id}/effective-permissions`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // should include the category with directCanBuild true
    const found = res.body.find((r: any) => r.categoryId === cat.id);
    expect(found).toBeTruthy();
    expect(found.directCanBuild).toBe(true);
  });
});
