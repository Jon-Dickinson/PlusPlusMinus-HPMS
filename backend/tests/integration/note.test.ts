import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';

describe('Note endpoints', () => {
  let authToken: string;
  let testUser: any;
  let testCity: any;

  beforeEach(async () => {
    // Clean up in reverse dependency order to avoid foreign key constraints
    await prisma.buildLog.deleteMany();
    await prisma.buildingResource.deleteMany();
    await prisma.building.deleteMany();
    await prisma.note.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();
    await prisma.buildingCategory.deleteMany();

    // Create a test user and city
    const timestamp = Date.now();
    const userResponse = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      username: `testuser-${timestamp}`,
      email: `test-${timestamp}@example.com`,
      password: 'password123',
      role: 'MAYOR',
      cityName: 'Test City',
      country: 'Testland'
    });

    testUser = userResponse.body.user;

    // Login to get token
    const loginResponse = await request(app).post('/api/auth/login').send({
      username: `testuser-${timestamp}`,
      password: 'password123'
    });

    authToken = loginResponse.body.token;

    // Get the created city
    testCity = await prisma.city.findUnique({
      where: { mayorId: testUser.id }
    });
  });

  it('GET /api/cities/:id/notes returns city notes', async () => {
    // Create some notes
    await prisma.note.create({
      data: {
        userId: testUser.id,
        content: 'First note'
      }
    });

    await prisma.note.create({
      data: {
        userId: testUser.id,
        content: 'Second note'
      }
    });

    const response = await request(app)
      .get(`/api/cities/${testCity.id}/notes`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body.some((n: any) => n.content === 'First note')).toBe(true);
  });

  it('POST /api/cities/:id/notes creates new note', async () => {
    const noteData = {
      content: 'This is a test note about city planning'
    };

    const response = await request(app)
      .post(`/api/cities/${testCity.id}/notes`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(noteData);

    expect(response.status).toBe(201);
    expect(response.body.content).toBe(noteData.content);
    expect(response.body.userId).toBe(testUser.id);

    // Verify in database
    const note = await prisma.note.findUnique({
      where: { id: response.body.id }
    });
    expect(note).toBeTruthy();
    expect(note?.content).toBe(noteData.content);
  });

  it('POST /api/cities/:id/notes validates content', async () => {
    // Empty content should fail
    const response = await request(app)
      .post(`/api/cities/${testCity.id}/notes`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: '' });

    expect(response.status).toBe(400);
  });

  it('GET /api/cities/:id/notes requires authentication', async () => {
    const response = await request(app).get(`/api/cities/${testCity.id}/notes`);

    expect(response.status).toBe(401);
  });

  it('POST /api/cities/:id/notes requires authentication', async () => {
    const response = await request(app)
      .post(`/api/cities/${testCity.id}/notes`)
      .send({ content: 'Test note' });

    expect(response.status).toBe(401);
  });

  it('notes are ordered by creation date (newest first)', async () => {
    // Create notes with delays to ensure different timestamps
    await prisma.note.create({
      data: {
        userId: testUser.id,
        content: 'Old note'
      }
    });

    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

    await prisma.note.create({
      data: {
        userId: testUser.id,
        content: 'New note'
      }
    });

    const response = await request(app)
      .get(`/api/cities/${testCity.id}/notes`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    // Should be ordered by createdAt desc (newest first)
    expect(response.body[0].content).toBe('New note');
    expect(response.body[1].content).toBe('Old note');
  });
});