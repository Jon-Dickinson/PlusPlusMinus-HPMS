import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';

describe('City endpoints', () => {
  beforeEach(async () => {
    // Clean up in reverse dependency order to avoid foreign key constraints
    await prisma.buildLog.deleteMany();
    await prisma.buildingResource.deleteMany();
    await prisma.building.deleteMany();
    await prisma.note.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();
    await prisma.buildingCategory.deleteMany();
  });

  it('GET /api/cities/:id returns city and 404 for missing', async () => {
    // create a mayor (city created automatically)
    const timestamp = Date.now();
    const m = await request(app).post('/api/auth/register').send({
      firstName: 'Mayor', lastName: 'One', username: `mayor-city-${timestamp}`, email: `mayor-city-${timestamp}@test.local`, password: 'mayorpass1', role: 'MAYOR', cityName: 'Cty', country: 'T'
    });
    expect(m.status).toBe(201);

    // find the city created
    const mayor = await prisma.user.findUnique({ where: { username: `mayor-city-${timestamp}` } });
    const city = await prisma.city.findUnique({ where: { mayorId: mayor?.id } as any });
    expect(city).toBeTruthy();

    const getRes = await request(app).get(`/api/cities/${city?.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe('Cty');

    const bad = await request(app).get(`/api/cities/9999999`);
    expect(bad.status).toBe(404);
  });

  it('PUT /api/cities/:id/data updates gridState, buildingLog and note', async () => {
    // create mayor
    const timestamp = Date.now();
    await request(app).post('/api/auth/register').send({
      firstName: 'Mayor', lastName: 'Two', username: `mayor2-${timestamp}`, email: `mayor2-${timestamp}@test.local`, password: 'mayorpass2', role: 'MAYOR', cityName: 'C2', country: 'T'
    });
    const mayor = await prisma.user.findUnique({ where: { username: `mayor2-${timestamp}` } });
    const city = await prisma.city.findUnique({ where: { mayorId: mayor?.id } as any });
    expect(city).toBeTruthy();

    // login as mayor to get token
    const login = await request(app).post('/api/auth/login').send({ username: `mayor2-${timestamp}`, password: 'mayorpass2' });
    const token = login.body.token;

    const payload = { gridState: { foo: 'bar' }, buildingLog: [{ action: 'build', value: 1 }], note: 'updated!' };

    const put = await request(app)
      .put(`/api/cities/${city?.id}/data`)
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(put.status).toBe(200);
    expect(put.body.gridState).toBeDefined();
    expect(put.body.buildingLog).toBeDefined();

    // a note should have been created
    const notes = await prisma.note.findMany({ where: { userId: mayor?.id } as any });
    expect(notes.length).toBeGreaterThanOrEqual(1);
  });
});
