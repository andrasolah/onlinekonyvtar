import { db } from '../db/index.js';
import { loans, books } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { validationResult } from 'express-validator';

export async function createLoan(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { bookId, dueDate } = req.body;
    const userId = req.user.id;

    // Ellenőrzés: könyv létezik és elérhető
    const book = await db.select().from(books).where(eq(books.id, bookId));
    if (book.length === 0) return res.status(404).json({ error: 'A könyv nem található' });
    if (!book[0].available) return res.status(409).json({ error: 'A könyv jelenleg nem elérhető' });

    // Tranzakció: kölcsönzés létrehozása + könyv elérhetőség frissítése
    const result = await db.transaction(async (tx) => {
      const loan = await tx.insert(loans).values({
        userId,
        bookId,
        dueDate: new Date(dueDate)
      }).returning();

      await tx.update(books)
        .set({ available: false })
        .where(eq(books.id, bookId));

      return loan[0];
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMyLoans(req, res, next) {
  try {
    const result = await db.select().from(loans)
      .where(eq(loans.userId, req.user.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}