CREATE DATABASE energy_guide;
USE energy_guide;

USE energy_guide;

CREATE TABLE formulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  expression VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE calculations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  input_data TEXT NOT NULL,
  result VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO formulas (title, expression, description) VALUES
('Потужність', 'P = U × I', 'Потужність дорівнює добутку напруги на струм.'),
('Струм', 'I = P / U', 'Струм можна знайти, якщо поділити потужність на напругу.'),
('Опір', 'R = U / I', 'Опір дорівнює відношенню напруги до струму.');

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category_id INT,
  author_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO categories (name, description) VALUES
('Основи електротехніки', 'Базові поняття'),
('Формули', 'Формули для розрахунків'),
('Практичні поради', 'Корисні поради');

INSERT INTO articles (title, content, category_id, author_name) VALUES
('Що таке електрична потужність', 'Електрична потужність показує, скільки енергії споживає пристрій за одиницю часу.', 1, 'Admin'),
('Закон Ома простими словами', 'Закон Ома показує зв’язок між напругою, струмом і опором.', 2, 'Admin');
