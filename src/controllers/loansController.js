import { db } from '../db/index.js';
import { loans, books } from '../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';
import { validationResult } from 'express-validator';

export async function createLoan(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { bookId, dueDate } = req.body;
    const userId = req.user.id;

    const book = await db.select().from(books).where(eq(books.id, bookId));
    if (book.length === 0) return res.status(404).json({ error: 'A könyv nem található' });
    if (!book[0].available) return res.status(409).json({ error: 'A könyv jelenleg nem elérhető' });

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
    const result = await db
      .select({
        id: loans.id,
        bookId: books.id,
        title: books.title,
        author: books.author,
        dueDate: loans.dueDate,
        loanedAt: loans.loanedAt
      })
      .from(loans)
      .innerJoin(books, eq(loans.bookId, books.id))
      .where(and(eq(loans.userId, req.user.id), isNull(loans.returnedAt)));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function returnLoan(req, res, next) {
  try {
    const loanId = parseInt(req.params.id);
    if (isNaN(loanId)) return res.status(400).json({ error: 'Érvénytelen azonosító' });

    const loan = await db.select().from(loans)
      .where(and(eq(loans.id, loanId), eq(loans.userId, req.user.id)));
    if (loan.length === 0) return res.status(404).json({ error: 'A kölcsönzés nem található' });
    if (loan[0].returnedAt) return res.status(409).json({ error: 'Ez a könyv már vissza lett adva' });

    const result = await db.transaction(async (tx) => {
      const updated = await tx.update(loans)
        .set({ returnedAt: new Date() })
        .where(eq(loans.id, loanId))
        .returning();

      await tx.update(books)
        .set({ available: true })
        .where(eq(books.id, loan[0].bookId));

      return updated[0];
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}
