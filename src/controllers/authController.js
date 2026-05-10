import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) return res.status(409).json({ error: 'Ez az email már foglalt' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.insert(users).values({ username, email, passwordHash }).returning();

    res.status(201).json({ id: result[0].id, username: result[0].username });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const result = await db.select().from(users).where(eq(users.email, email));
    if (result.length === 0) return res.status(401).json({ error: 'Hibás email vagy jelszó' });

    const user = result[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Hibás email vagy jelszó' });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
}