import { Router } from 'express';
import { createLoan, getMyLoans, returnLoan } from '../controllers/loansController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';

export const loansRouter = Router();

const loanValidation = [
  body('bookId').isInt({ min: 1 }).withMessage('Érvényes könyvazonosító szükséges'),
  body('dueDate').isISO8601().withMessage('Érvényes dátum szükséges (ISO 8601)')
];

loansRouter.post('/', requireAuth, loanValidation, createLoan);
loansRouter.get('/', requireAuth, getMyLoans);
loansRouter.patch('/:id/return', requireAuth, returnLoan);