import { Router } from 'express';
import { getAllBooks, getBookById } from '../controllers/booksController.js';

export const booksRouter = Router();

/**
 * @openapi
 * /api/books:
 *   get:
 *     summary: Összes könyv listázása
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Könyvek listája
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
booksRouter.get('/', getAllBooks);

/**
 * @openapi
 * /api/books/{id}:
 *   get:
 *     summary: Könyv lekérdezése azonosító alapján
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A könyv azonosítója
 *         example: 1
 *     responses:
 *       200:
 *         description: A könyv adatai
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Érvénytelen azonosító
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: A könyv nem található
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
booksRouter.get('/:id', getBookById);