import 'dotenv/config';
import express from 'express';
import { booksRouter } from './routes/books.js';
import { loansRouter } from './routes/loans.js';
import { authRouter } from './routes/auth.js';

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.use('/api/books', booksRouter);
app.use('/api/loans', loansRouter);
app.use('/api/auth', authRouter);

// Globális hibakezelő
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Szerverhiba' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Szerver fut: ${PORT}`));

export default app; // tesztelhetőséghez