import { Router } from 'express';
import { getAllBooks, getBookById } from '../controllers/booksController.js';

export const booksRouter = Router();

booksRouter.get('/', getAllBooks);
booksRouter.get('/:id', getBookById);