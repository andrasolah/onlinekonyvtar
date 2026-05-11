import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Könyvtár API',
      version: '1.0.0',
      description: 'REST API az online könyvtár alkalmazáshoz. A védett végpontokhoz JWT tokent kell megadni a Bearer mezőben.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Fejlesztői szerver' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'john_doe' },
          },
        },
        Book: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'A Gyűrűk Ura' },
            author: { type: 'string', example: 'J.R.R. Tolkien' },
            isbn: { type: 'string', example: '978-963-11-0000-0' },
            category: { type: 'string', example: 'fantasy' },
            available: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Loan: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            bookId: { type: 'integer', example: 2 },
            loanedAt: { type: 'string', format: 'date-time' },
            dueDate: { type: 'string', format: 'date-time' },
            returnedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        LoanWithBook: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            bookId: { type: 'integer', example: 2 },
            title: { type: 'string', example: 'A Gyűrűk Ura' },
            author: { type: 'string', example: 'J.R.R. Tolkien' },
            dueDate: { type: 'string', format: 'date-time' },
            loanedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Hibaüzenet' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string', example: 'Érvénytelen email' },
                  path: { type: 'string', example: 'email' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
