-- Maak tabel voor data retention regels
CREATE TABLE IF NOT EXISTS data_retention_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  data_type VARCHAR(50) NOT NULL,
  retention_period INT NOT NULL, -- in dagen
  description TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Maak tabel voor data retention logs
CREATE TABLE IF NOT EXISTS data_retention_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_id INT NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  records_deleted INT DEFAULT 0,
  execution_time TIMESTAMP NOT NULL,
  FOREIGN KEY (rule_id) REFERENCES data_retention_rules(id)
);

-- Voeg indexen toe voor betere query prestaties
CREATE INDEX idx_retention_rules_type ON data_retention_rules(data_type);
CREATE INDEX idx_retention_logs_time ON data_retention_logs(execution_time);

-- Voeg standaard retention regels toe
INSERT INTO data_retention_rules (data_type, retention_period, description, legal_basis, created_by)
VALUES 
  ('user_activity', 365, 'Gebruikersactiviteit logs', 'Wettelijke verplichting voor boekhouding', 1),
  ('login_history', 90, 'Login geschiedenis', 'Beveiliging en fraudepreventie', 1),
  ('messages', 730, 'Gebruikersberichten', 'Consent van gebruiker', 1); 