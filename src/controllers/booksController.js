import { db } from '../db/index.js';
import { books } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function getAllBooks(req, res, next) {
  try {
    const result = await db.select().from(books);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getBookById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Érvénytelen azonosító' });

    const result = await db.select().from(books).where(eq(books.id, id));
    if (result.length === 0) return res.status(404).json({ error: 'A könyv nem található' });

    res.json(result[0]);
  } catch (err) {
    next(err);
  }
}