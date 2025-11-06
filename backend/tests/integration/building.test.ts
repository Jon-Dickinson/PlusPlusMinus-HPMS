import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/server.js';
import { prisma } from '../../src/db.js';

describe('Building endpoints', () => {
  beforeEach(async () => {
    await prisma.buildingResource.deleteMany();
    await prisma.building.deleteMany();
    await prisma.buildingCategory.deleteMany();
  });

  it('GET /api/buildings returns all buildings', async () => {
    // Create a test category and building
    const category = await prisma.buildingCategory.create({
      data: { name: 'Test Category', description: 'Test buildings' }
    });

    const building = await prisma.building.create({
      data: {
        name: 'Test Building',
        categoryId: category.id,
        sizeX: 2,
        sizeY: 2,
        powerOutput: 100
      }
    });

    const response = await request(app).get('/api/buildings');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.some((b: any) => b.name === 'Test Building')).toBe(true);
  });

  it('GET /api/buildings/categories returns all categories', async () => {
    const category = await prisma.buildingCategory.create({
      data: { name: 'Residential', description: 'Houses and apartments' }
    });

    const response = await request(app).get('/api/buildings/categories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((c: any) => c.name === 'Residential')).toBe(true);
  });

  it('GET /api/buildings/:id returns specific building with resources', async () => {
    const category = await prisma.buildingCategory.create({
      data: { name: 'Industrial', description: 'Factories' }
    });

    const building = await prisma.building.create({
      data: {
        name: 'Factory',
        categoryId: category.id,
        powerUsage: 50,
        waterUsage: 30
      }
    });

    // Add some resources
    await prisma.buildingResource.create({
      data: {
        buildingId: building.id,
        type: 'steel',
        amount: 100
      }
    });

    const response = await request(app).get(`/api/buildings/${building.id}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Factory');
    expect(response.body.powerUsage).toBe(50);
    expect(Array.isArray(response.body.resources)).toBe(true);
    expect(response.body.resources.length).toBeGreaterThan(0);
  });

  it('GET /api/buildings/type/:type returns buildings by category', async () => {
    const category = await prisma.buildingCategory.create({
      data: { name: 'Commercial', description: 'Shops and offices' }
    });

    const building1 = await prisma.building.create({
      data: {
        name: 'Shop',
        categoryId: category.id,
        sizeX: 1,
        sizeY: 1
      }
    });

    const building2 = await prisma.building.create({
      data: {
        name: 'Office',
        categoryId: category.id,
        sizeX: 2,
        sizeY: 1
      }
    });

    const response = await request(app).get('/api/buildings/type/Commercial');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body.every((b: any) => b.category?.name === 'Commercial')).toBe(true);
  });

  it('POST /api/buildings creates new building', async () => {
    const category = await prisma.buildingCategory.create({
      data: { name: 'Utility', description: 'Power and water' }
    });

    const buildingData = {
      name: 'Power Plant',
      categoryId: category.id,
      sizeX: 3,
      sizeY: 2,
      powerOutput: 500,
      powerUsage: 10,
      level: 1,
      blocks: 9,
      employs: 5
    };

    const response = await request(app)
      .post('/api/buildings')
      .send(buildingData);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Power Plant');
    expect(response.body.powerOutput).toBe(500);

    // Verify it was created in database
    const created = await prisma.building.findUnique({
      where: { id: response.body.id }
    });
    expect(created).toBeTruthy();
    expect(created?.name).toBe('Power Plant');
  });

  it('PUT /api/buildings/:id updates building', async () => {
    const category = await prisma.buildingCategory.create({
      data: { name: 'Residential', description: 'Homes' }
    });

    const building = await prisma.building.create({
      data: {
        name: 'Small House',
        categoryId: category.id,
        sizeX: 1,
        sizeY: 1,
        powerUsage: 5
      }
    });

    const updateData = {
      name: 'Large House',
      sizeX: 2,
      sizeY: 2,
      powerUsage: 10
    };

    const response = await request(app)
      .put(`/api/buildings/${building.id}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Large House');
    expect(response.body.sizeX).toBe(2);
    expect(response.body.powerUsage).toBe(10);
  });

  it('DELETE /api/buildings/:id removes building', async () => {
    const category = await prisma.buildingCategory.create({
      data: { name: 'Test', description: 'For deletion' }
    });

    const building = await prisma.building.create({
      data: {
        name: 'To Delete',
        categoryId: category.id
      }
    });

    const response = await request(app).delete(`/api/buildings/${building.id}`);
    expect(response.status).toBe(204);

    // Verify it's gone
    const deleted = await prisma.building.findUnique({
      where: { id: building.id }
    });
    expect(deleted).toBeNull();
  });
});