import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { body } from 'express-validator';

export const authRouter = Router();

const registerValidation = [
  body('username').trim().notEmpty().withMessage('Felhasználónév kötelező'),
  body('email').isEmail().withMessage('Érvénytelen email'),
  body('password').isLength({ min: 6 }).withMessage('Jelszó minimum 6 karakter')
];

const loginValidation = [
  body('email').isEmail().withMessage('Érvénytelen email'),
  body('password').notEmpty().withMessage('Jelszó kötelező')
];

authRouter.post('/register', registerValidation, register);
authRouter.post('/login', loginValidation, login);