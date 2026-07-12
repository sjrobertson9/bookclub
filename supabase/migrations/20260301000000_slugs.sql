ALTER TABLE boards ADD COLUMN slug TEXT;
ALTER TABLE discussions ADD COLUMN slug TEXT;

-- Backfill existing rows before adding constraints
UPDATE boards SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
UPDATE discussions SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));

ALTER TABLE boards ALTER COLUMN slug SET NOT NULL;
ALTER TABLE boards ADD CONSTRAINT boards_slug_unique UNIQUE (slug);

ALTER TABLE discussions ALTER COLUMN slug SET NOT NULL;
-- Unique per board, not globally — two different books can both have a "chapter-1"
ALTER TABLE discussions ADD CONSTRAINT discussions_slug_unique_per_board UNIQUE (board_id, slug);
