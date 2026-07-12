ALTER TABLE discussions ADD COLUMN position INTEGER;

-- Backfill: preserve current created_at order as the starting position, per board
WITH ordered AS (
  SELECT id, row_number() OVER (PARTITION BY board_id ORDER BY created_at) AS rn
  FROM discussions
)
UPDATE discussions
SET position = ordered.rn
FROM ordered
WHERE discussions.id = ordered.id;

ALTER TABLE discussions ALTER COLUMN position SET NOT NULL;
