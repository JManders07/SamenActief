-- Blog comments tabel
CREATE TABLE IF NOT EXISTS blog_comments (
  id SERIAL PRIMARY KEY,
  blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexen
CREATE INDEX idx_blog_comments_blog ON blog_comments(blog_id);
CREATE INDEX idx_blog_comments_user ON blog_comments(user_id);

-- Voorbeeld commentaar
INSERT INTO blog_comments (blog_id, user_id, content)
VALUES (1, 2, 'Wat een interessant artikel!'); 