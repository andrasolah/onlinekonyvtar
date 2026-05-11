import { Router } from 'express';
import { createLoan, getMyLoans, returnLoan } from '../controllers/loansController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';

export const loansRouter = Router();

const loanValidation = [
  body('bookId').isInt({ min: 1 }).withMessage('Érvényes könyvazonosító szükséges'),
  body('dueDate').isISO8601().withMessage('Érvényes dátum szükséges (ISO 8601)')
];

/**
 * @openapi
 * /api/loans:
 *   post:
 *     summary: Könyv kölcsönzése
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookId, dueDate]
 *             properties:
 *               bookId:
 *                 type: integer
 *                 example: 1
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-01T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Sikeres kölcsönzés
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loan'
 *       400:
 *         description: Validációs hiba
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Hiányzó vagy érvénytelen token
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
 *       409:
 *         description: A könyv jelenleg nem elérhető
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
loansRouter.post('/', requireAuth, loanValidation, createLoan);

/**
 * @openapi
 * /api/loans:
 *   get:
 *     summary: Saját aktív kölcsönzések listázása
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kölcsönzések listája könyv adatokkal
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LoanWithBook'
 *       401:
 *         description: Hiányzó vagy érvénytelen token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
loansRouter.get('/', requireAuth, getMyLoans);

/**
 * @openapi
 * /api/loans/{id}/return:
 *   patch:
 *     summary: Kölcsönzött könyv visszaadása
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A kölcsönzés azonosítója
 *         example: 1
 *     responses:
 *       200:
 *         description: Sikeres visszaadás
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loan'
 *       400:
 *         description: Érvénytelen azonosító
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Hiányzó vagy érvénytelen token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: A kölcsönzés nem található
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Ez a könyv már vissza lett adva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
loansRouter.patch('/:id/return', requireAuth, returnLoan);