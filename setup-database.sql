-- Maak een SQL-script voor het aanmaken van alle tabellen
-- PostgreSQL database setup voor Ouderenapp

-- Maak eerst de enum type voor gebruikersrollen
CREATE TYPE role AS ENUM ('user', 'center_admin');

-- Gebruikerstabel
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  village TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  anonymous_participation BOOLEAN NOT NULL DEFAULT false,
  role role NOT NULL DEFAULT 'user'
);

-- Activiteitencentra (buurthuizen)
CREATE TABLE IF NOT EXISTS centers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  village TEXT NOT NULL
);

-- Activiteiten
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  center_id INTEGER NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  capacity INTEGER NOT NULL,
  materials_needed TEXT,
  facilities_available TEXT
);

-- Afbeeldingen voor activiteiten
CREATE TABLE IF NOT EXISTS activity_images (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Inschrijvingen voor activiteiten
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  UNIQUE(user_id, activity_id)
);

-- Wachtlijst voor activiteiten
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, activity_id)
);

-- Herinneringen
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  reminder_date TIMESTAMP NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Carpool (vervoer)
CREATE TABLE IF NOT EXISTS carpools (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  departure_location TEXT NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  available_seats INTEGER NOT NULL
);

-- Carpool passagiers
CREATE TABLE IF NOT EXISTS carpool_passengers (
  id SERIAL PRIMARY KEY,
  carpool_id INTEGER NOT NULL REFERENCES carpools(id) ON DELETE CASCADE,
  passenger_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(carpool_id, passenger_id)
);

-- Voorbeelddata voor test- en demonstratiedoeleinden
-- Wachtwoorden zijn 'password' (in een echte omgeving zou je deze hashen)

-- Voeg gebruikers toe (1 admin, 4 gewone gebruikers)
INSERT INTO users (username, password, display_name, phone, village, neighborhood, anonymous_participation, role)
VALUES 
  ('admin@example.com', 'password', 'Beheerder', '0612345678', 'Eindhoven', 'Centrum', false, 'center_admin'),
  ('jan@example.com', 'password', 'Jan de Vries', '0612345679', 'Eindhoven', 'Woensel', false, 'user'),
  ('maria@example.com', 'password', 'Maria Jansen', '0612345680', 'Eindhoven', 'Stratum', true, 'user'),
  ('piet@example.com', 'password', 'Piet Klaassen', '0612345681', 'Eindhoven', 'Tongelre', false, 'user'),
  ('truus@example.com', 'password', 'Truus Smit', '0612345682', 'Eindhoven', 'Gestel', false, 'user');

-- Voeg centra toe
INSERT INTO centers (name, address, description, image_url, admin_id, village)
VALUES 
  ('Buurthuis De Ronde', 'Rondweg 10, Eindhoven', 'Een gezellig buurthuis in het centrum van Eindhoven.', 'https://placehold.co/600x400?text=Buurthuis+De+Ronde', 1, 'Eindhoven'),
  ('Wijkcentrum Oost', 'Ooststraat 22, Eindhoven', 'Modern wijkcentrum voor de bewoners van Eindhoven Oost.', 'https://placehold.co/600x400?text=Wijkcentrum+Oost', 1, 'Eindhoven');

-- Voeg activiteiten toe
INSERT INTO activities (center_id, name, description, image_url, date, capacity, materials_needed, facilities_available)
VALUES 
  (1, 'Bingo-middag', 'Gezellige bingo-middag met leuke prijzen.', 'https://placehold.co/600x400?text=Bingo+Middag', NOW() + INTERVAL '7 days', 20, 'Geen materialen nodig', 'Koffie en thee beschikbaar'),
  (1, 'Handwerkcafé', 'Samen breien, haken of borduren.', 'https://placehold.co/600x400?text=Handwerkcafe', NOW() + INTERVAL '14 days', 15, 'Breng je eigen handwerk mee', 'Koffie, thee en koekjes aanwezig'),
  (2, 'Computercursus', 'Leer omgaan met e-mail en internet.', 'https://placehold.co/600x400?text=Computercursus', NOW() + INTERVAL '10 days', 10, 'Laptop indien mogelijk', 'WiFi en laptops beschikbaar'),
  (2, 'Samen Koken', 'Kook en eet samen met buurtgenoten.', 'https://placehold.co/600x400?text=Samen+Koken', NOW() + INTERVAL '21 days', 12, 'Schort', 'Volledig uitgeruste keuken');

-- Voeg extra afbeeldingen toe voor activiteiten
INSERT INTO activity_images (activity_id, image_url, "order")
VALUES 
  (1, 'https://placehold.co/600x400?text=Bingo+1', 1),
  (1, 'https://placehold.co/600x400?text=Bingo+2', 2),
  (3, 'https://placehold.co/600x400?text=Computer+1', 1),
  (4, 'https://placehold.co/600x400?text=Koken+1', 1);

-- Voeg inschrijvingen toe
INSERT INTO registrations (user_id, activity_id)
VALUES 
  (2, 1), -- Jan schrijft zich in voor Bingo
  (3, 1), -- Maria schrijft zich in voor Bingo
  (4, 2), -- Piet schrijft zich in voor Handwerkcafé
  (5, 3); -- Truus schrijft zich in voor Computercursus

-- Voeg carpool toe
INSERT INTO carpools (activity_id, driver_id, departure_location, departure_time, available_seats)
VALUES 
  (1, 2, 'Winkelcentrum Woensel', NOW() + INTERVAL '7 days' - INTERVAL '1 hour', 3);

-- Voeg carpool passagier toe
INSERT INTO carpool_passengers (carpool_id, passenger_id)
VALUES 
  (1, 3); -- Maria rijdt mee met Jan naar Bingo

-- Voeg herinneringen toe
INSERT INTO reminders (user_id, activity_id, reminder_date, title, message, is_read)
VALUES 
  (2, 1, NOW() + INTERVAL '6 days', 'Herinnering Bingo', 'Vergeet niet dat morgen de bingo-middag is!', false),
  (3, 1, NOW() + INTERVAL '6 days', 'Herinnering Bingo', 'Vergeet niet dat morgen de bingo-middag is!', true);

-- Indexen voor betere prestaties
CREATE INDEX idx_registrations_activity ON registrations(activity_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_waitlist_activity ON waitlist(activity_id);
CREATE INDEX idx_waitlist_user ON waitlist(user_id);
CREATE INDEX idx_activities_center ON activities(center_id);
CREATE INDEX idx_carpools_activity ON carpools(activity_id);
CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_activity ON reminders(activity_id);
