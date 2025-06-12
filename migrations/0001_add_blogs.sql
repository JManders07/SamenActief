-- Verwijder de oude blogs tabel als deze bestaat
DROP TABLE IF EXISTS blogs;

-- Blog tabel
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published BOOLEAN NOT NULL DEFAULT true
);

-- Index voor betere prestaties
CREATE INDEX idx_blogs_author ON blogs(author_id);
CREATE INDEX idx_blogs_created_at ON blogs(created_at);

-- Voorbeeld blogs (gebruik bestaande user ID's)
INSERT INTO blogs (title, content, image_url, author_id, created_at)
VALUES 
  ('Welkom bij Samen Actief', 'Samen Actief is dé plek waar mensen elkaar ontmoeten en samen leuke activiteiten ondernemen. Of je nu op zoek bent naar gezelligheid, nieuwe vrienden wilt maken of gewoon lekker actief wilt blijven, bij ons ben je aan het juiste adres!', 'https://placehold.co/800x400?text=Welkom', 1, NOW() - INTERVAL '5 days'),
  ('De kracht van samen bewegen', 'Bewegen is gezond, maar samen bewegen is nog veel leuker! Lees hier waarom groepsactiviteiten zo belangrijk zijn voor je gezondheid en welzijn.', 'https://placehold.co/800x400?text=Bewegen', 2, NOW() - INTERVAL '3 days'),
  ('Nieuwe activiteiten in het voorjaar', 'Het voorjaar staat voor de deur en dat betekent nieuwe activiteiten! Bekijk hier ons uitgebreide aanbod voor de komende maanden.', 'https://placehold.co/800x400?text=Voorjaar', 3, NOW() - INTERVAL '1 day'); 