import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';

describe('User endpoints', () => {
  beforeEach(async () => {
    await prisma.note.deleteMany();
    await prisma.buildLog.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();
  });

  it('GET /api/users requires admin and returns users with roles', async () => {
    // create admin
    await request(app).post('/api/auth/register').send({
      firstName: 'Admin', lastName: 'A', username: 'adminx', email: 'adminx@test.local', password: 'adminpass1', role: 'ADMIN'
    });

  const login = await request(app).post('/api/auth/login').send({ username: 'adminx', password: 'adminpass1' });
    expect(login.status).toBe(200);
    const token = login.body.token;

    // create a mayor and a viewer
    const mayorRes = await request(app).post('/api/auth/register').send({
      firstName: 'Mayor', lastName: 'M', username: 'mayx', email: 'mayx@test.local', password: 'mayorpass1', role: 'MAYOR', cityName: 'C1', country: 'T'
    });
    expect(mayorRes.status).toBe(201);

    const usersRes = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(usersRes.status).toBe(200);
    expect(Array.isArray(usersRes.body)).toBe(true);
    // Assert each user has role field
    expect(usersRes.body.some((u: any) => u.role === 'MAYOR')).toBe(true);
  });
});
