ALTER TABLE posts ADD COLUMN updated_at TIMESTAMPTZ;

CREATE POLICY "posts_update" ON posts FOR UPDATE USING (true);
