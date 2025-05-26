-- Maak tabel voor datalekken
CREATE TABLE IF NOT EXISTS data_breaches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  description TEXT NOT NULL,
  affected_users INT DEFAULT 0,
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  detected_at DATETIME NOT NULL,
  measures TEXT NOT NULL,
  reported_by INT NOT NULL,
  status ENUM('reported', 'investigating', 'contained', 'resolved') NOT NULL DEFAULT 'reported',
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- Maak tabel voor getroffen gebruikers bij een datalek
CREATE TABLE IF NOT EXISTS affected_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  breach_id INT NOT NULL,
  user_id INT NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  notified_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (breach_id) REFERENCES data_breaches(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Voeg indexen toe voor betere query prestaties
CREATE INDEX idx_data_breaches_status ON data_breaches(status);
CREATE INDEX idx_data_breaches_severity ON data_breaches(severity);
CREATE INDEX idx_affected_users_breach ON affected_users(breach_id);
CREATE INDEX idx_affected_users_user ON affected_users(user_id); 