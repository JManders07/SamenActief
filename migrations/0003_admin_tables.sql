-- Voeg admin rol toe aan users tabel
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Maak system_logs tabel
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maak system_settings tabel
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Voeg status toe aan centers tabel
ALTER TABLE centers ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

-- Maak indexen voor betere performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_centers_status ON centers(status);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);

-- Voeg wat basis instellingen toe
INSERT INTO system_settings (key, value) VALUES
  ('site_name', '"SamenActief"'),
  ('site_description', '"Het platform voor buurtactiviteiten"'),
  ('max_activities_per_center', '10'),
  ('max_registrations_per_activity', '20'),
  ('registration_deadline_hours', '24'),
  ('email_notifications_enabled', 'true'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING; 