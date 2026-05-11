CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  category VARCHAR(50) DEFAULT 'other',
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  loaned_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP NOT NULL,
  returned_at TIMESTAMP
);

INSERT INTO books (title, author, isbn, category, available) VALUES
  ('Clean Code',                    'Robert C. Martin',   '9780132350884', 'prog',   TRUE),
  ('The Pragmatic Programmer',      'David Thomas',       '9780201616224', 'prog',   TRUE),
  ('Design Patterns',               'Gang of Four',       '9780201633610', 'prog',   TRUE),
  ('The Design of Everyday Things', 'Don Norman',         '9780465050659', 'design', TRUE),
  ('A Brief History of Time',       'Stephen Hawking',    '9780553380163', 'sci',    TRUE),
  ('Sapiens',                       'Yuval Noah Harari',  '9780062316097', 'sci',    TRUE),
  ('1984',                          'George Orwell',      '9780451524935', 'novel',  TRUE),
  ('Dune',                          'Frank Herbert',      '9780441013593', 'novel',  TRUE)
ON CONFLICT DO NOTHING;

-- Teszt felhasználók
-- user1 / password123
-- user2 / password456
INSERT INTO users (username, email, password_hash) VALUES
  ('user1', 'user1@example.com', '$2b$10$QFVJuhh.xu8.3iKzrqvHHufnhoWHIUw6G5ZxhKtx4eW3VbIwu/PnO'),
  ('user2', 'user2@example.com', '$2b$10$TyBKuWW8kcJrBYswhONSl.hSsSLdqGJ5niV6kskH9/unGla6jZUrW')
ON CONFLICT DO NOTHING;
