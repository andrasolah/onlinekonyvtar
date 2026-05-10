import request from 'supertest';
import app from '../src/app.js';

describe('POST /api/auth/register', () => {
  test('hiányzó mezők esetén 400-at ad vissza', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'teszt' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('érvénytelen email esetén 400-at ad vissza', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'teszt', email: 'nem-email', password: 'jelszo123' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toBe('Érvénytelen email');
  });
});
