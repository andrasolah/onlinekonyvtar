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

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Új felhasználó regisztrálása
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Sikeres regisztráció
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validációs hiba
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Az email már foglalt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/register', registerValidation, register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Bejelentkezés
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Sikeres bejelentkezés, JWT token visszaadva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validációs hiba
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Hibás email vagy jelszó
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/login', loginValidation, login);