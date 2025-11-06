import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';

describe('City endpoints', () => {
  beforeEach(async () => {
    await prisma.note.deleteMany();
    await prisma.buildLog.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();
  });

  it('GET /api/cities/:id returns city and 404 for missing', async () => {
    // create a mayor (city created automatically)
    const m = await request(app).post('/api/auth/register').send({
      firstName: 'Mayor', lastName: 'One', username: 'mayor-city', email: 'mayor-city@test.local', password: 'mayorpass1', role: 'MAYOR', cityName: 'Cty', country: 'T'
    });
    expect(m.status).toBe(201);

    // find the city created
    const mayor = await prisma.user.findUnique({ where: { username: 'mayor-city' } });
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
    await request(app).post('/api/auth/register').send({
      firstName: 'Mayor', lastName: 'Two', username: 'mayor2', email: 'mayor2@test.local', password: 'mayorpass2', role: 'MAYOR', cityName: 'C2', country: 'T'
    });
    const mayor = await prisma.user.findUnique({ where: { username: 'mayor2' } });
    const city = await prisma.city.findUnique({ where: { mayorId: mayor?.id } as any });

  // login as mayor to get token
  const login = await request(app).post('/api/auth/login').send({ username: 'mayor2', password: 'mayorpass2' });
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
