-- Voeg 'admin' toe aan de role enum
ALTER TYPE role ADD VALUE IF NOT EXISTS 'admin';

-- Update de users tabel om de nieuwe rol te ondersteunen
ALTER TABLE users 
  ALTER COLUMN role TYPE role 
  USING role::role; 