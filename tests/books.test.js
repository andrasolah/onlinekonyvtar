import request from 'supertest';
import app from '../src/app.js';

describe('GET /api/books', () => {
  test('visszaad egy tömböt 200-as státuszkóddal', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('minden könyv rendelkezik id, title, author és available mezővel', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    res.body.forEach(book => {
      expect(book).toHaveProperty('id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('author');
      expect(book).toHaveProperty('available');
    });
  });
});
