const request = require('supertest');
const app = require('../src/app');

describe('API Baseline Integration Tests', () => {
  test('GET /api/v1/health returns ok status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('India-First Expense Sharing API');
  });

  test('Non-existent route returns 404 with structured JSON error', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Route not found');
  });

  test('Unauthenticated request to protected route returns 401', async () => {
    const res = await request(app).get('/api/v1/groups');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Authentication required');
  });
});
