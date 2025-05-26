CREATE TABLE IF NOT EXISTS data_deletion_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index voor snelle queries op user_id
CREATE INDEX IF NOT EXISTS idx_data_deletion_logs_user_id ON data_deletion_logs(user_id);

-- Index voor snelle queries op timestamp
CREATE INDEX IF NOT EXISTS idx_data_deletion_logs_timestamp ON data_deletion_logs(timestamp); 