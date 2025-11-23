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

    // verify city qualityIndex present and calculated
    const mayorFromDb = await prisma.user.findUnique({ where: { username: 'mayx' }, include: { city: true } });
    expect(mayorFromDb?.city).toBeTruthy();
    const generator = new (await import('../../prisma/seeders/city-assets/city-grid-generator.seeder.ts')).CityGridGenerator();
    const rawState = mayorFromDb!.city!.gridState as any;
    let parsed = rawState;
    if (typeof rawState === 'string') parsed = JSON.parse(rawState);
    const expected = generator.calculateQualityIndexFromGrid(parsed as number[][]);

    const usersRes = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(usersRes.status).toBe(200);
    expect(Array.isArray(usersRes.body)).toBe(true);
    // Assert each user has role field
    expect(usersRes.body.some((u: any) => u.role === 'MAYOR')).toBe(true);
    // Find the mayor entry and confirm city.qualityIndex is present and matches expected
    const mayorEntry = usersRes.body.find((u: any) => u.username === 'mayx');
    expect(mayorEntry).toBeTruthy();
    expect(typeof mayorEntry.city?.qualityIndex).toBe('number');
    expect(Math.round(Number(mayorEntry.city.qualityIndex))).toBe(Math.round(expected));
  });
});
