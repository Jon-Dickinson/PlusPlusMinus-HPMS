# Backend Testing Suite

This directory contains comprehensive integration and performance tests for the PlusPlusMinus-HPMS backend API.

## Test Structure

```
tests/
├── integration/          # API endpoint integration tests
│   ├── auth.test.ts     # Authentication endpoints
│   ├── building.test.ts # Building CRUD operations
│   ├── city.test.ts     # City management
│   ├── note.test.ts     # Note functionality
│   └── user.test.ts     # User management
├── performance/          # Database performance tests
│   └── prisma-performance.test.ts
└── utils/               # Test utilities
    └── seedLargeDataset.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Integration Tests Only
```bash
npm run test:integration
```

### Performance Tests Only
```bash
npm run test:performance
```

## Test Categories

### Integration Tests
- **Auth Tests**: User registration, login, role-based access
- **Building Tests**: CRUD operations, category filtering, resource management
- **City Tests**: City creation, data updates, build logs, notes
- **Note Tests**: Note creation, retrieval, authentication
- **User Tests**: User management, role-based permissions

### Performance Tests
- **Large Dataset Queries**: Tests with > 1k records
- **Complex Relationships**: Multi-table joins and includes
- **Aggregations**: GroupBy operations on large datasets
- **Search/Filter Operations**: Complex WHERE clauses
- **Bulk Operations**: Transaction-based updates
- **Concurrent Operations**: Multiple simultaneous queries

## Test Configuration

### Vitest Configs
- `vitest.config.ts` - General test configuration
- `vitest.config.integration.ts` - Integration test settings
- `vitest.config.performance.ts` - Performance test settings (60s timeout)

### Environment Variables
- `RUN_PERF=1` - Enable performance tests (disabled by default)

## Database Seeding

### Development Seed
```bash
npm run seed
```
Creates default users: `admin`, `mayor`, `viewer1`, `viewer2`

### Performance Test Seed
Automatically creates 1,500+ records for performance testing:
- 1,500 Mayor users
- 1,500 Cities (one per mayor)
- ~3,000 Buildings (2 per city average)
- Building resources and categories
- Build logs

## Key API Endpoints Tested

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Users
- `GET /api/users` - List users (admin only)
- `GET /api/users/mayors` - List mayor users
- `GET /api/users/:id` - Get specific user

### Cities
- `GET /api/cities` - List all cities
- `GET /api/cities/:id` - Get city details
- `PUT /api/cities/:id/data` - Update city data
- `GET /api/cities/:id/logs` - Get build logs
- `POST /api/cities/:id/logs` - Add build log
- `GET /api/cities/:id/notes` - Get city notes
- `POST /api/cities/:id/notes` - Add note

### Buildings
- `GET /api/buildings` - List all buildings
- `GET /api/buildings/categories` - List categories
- `GET /api/buildings/:id` - Get building details
- `GET /api/buildings/type/:type` - Filter by category
- `POST /api/buildings` - Create building
- `PUT /api/buildings/:id` - Update building
- `DELETE /api/buildings/:id` - Delete building

## Performance Benchmarks

### Expected Performance (with 1,500+ records)
- **City queries with relationships**: < 1 second average
- **User queries with includes**: < 800ms average
- **Building aggregations**: < 500ms average
- **Complex search/filter**: < 600ms average
- **Bulk operations**: < 1 second average
- **Concurrent operations**: < 5 seconds total

### Performance Assertions
- 95th percentile response times
- Average response times
- Maximum response times
- Operations per second metrics

## Test Data Management

### Cleanup
Each test suite includes `beforeEach` hooks that clean test data:
```typescript
await prisma.note.deleteMany();
await prisma.buildLog.deleteMany();
await prisma.city.deleteMany();
await prisma.user.deleteMany();
```

### Isolation
Tests are designed to be independent and not interfere with each other.

## Adding New Tests

### Integration Test Template
```typescript
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../src/server.js';

describe('New Feature', () => {
  it('should perform expected behavior', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### Performance Test Template
```typescript
it('measures operation performance', async () => {
  const samples: number[] = [];

  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    // Perform operation
    const end = performance.now();
    samples.push(end - start);
  }

  const result = measurePerformance('Operation Name', samples);
  expect(result.avg).toBeLessThan(1000);
});
```

## Troubleshooting

### Tests Failing
1. Check database connection
2. Ensure migrations are run: `npm run migrate`
3. Verify environment variables in `.env`

### Performance Tests Slow
1. Check database indexes
2. Verify hardware resources
3. Consider reducing dataset size for local testing

### Port Conflicts
Tests run on the same port as the main application. Ensure no other instance is running.

## Continuous Integration

These tests are designed to run in CI/CD pipelines and provide comprehensive coverage of:
- API functionality
- Authentication & authorization
- Database operations
- Performance regression detection