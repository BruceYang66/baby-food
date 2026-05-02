-- Online safe initialization: non-destructive schema upgrades for production
-- This script only adds missing objects/columns/indexes and never drops data.

-- 1) user_login_logs table (from migration add_user_login_logs.sql)
CREATE TABLE IF NOT EXISTS user_login_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  login_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_login_logs_user_id_login_at
  ON user_login_logs(user_id, login_at);

-- 2) recipes age month range columns + backfill + constraint + index
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'recipes'
  ) THEN
    ALTER TABLE recipes
      ADD COLUMN IF NOT EXISTS age_min_months INTEGER,
      ADD COLUMN IF NOT EXISTS age_max_months INTEGER;

    WITH normalized AS (
      SELECT
        id,
        regexp_replace(replace(age_label, '月龄', '月'), '\s+', '', 'g') AS age_text
      FROM recipes
    )
    UPDATE recipes r
    SET
      age_min_months = CASE
        WHEN n.age_text ~ '^(\d+)-(\d+)月$'
          THEN LEAST(
            (regexp_match(n.age_text, '^(\d+)-(\d+)月$'))[1]::INTEGER,
            (regexp_match(n.age_text, '^(\d+)-(\d+)月$'))[2]::INTEGER
          )
        WHEN n.age_text ~ '^(\d+)-(\d+)岁$'
          THEN LEAST(
            (regexp_match(n.age_text, '^(\d+)-(\d+)岁$'))[1]::INTEGER,
            (regexp_match(n.age_text, '^(\d+)-(\d+)岁$'))[2]::INTEGER
          ) * 12
        WHEN n.age_text ~ '^(\d+)个月\+$'
          THEN (regexp_match(n.age_text, '^(\d+)个月\+$'))[1]::INTEGER
        WHEN n.age_text ~ '^(\d+)月\+$'
          THEN (regexp_match(n.age_text, '^(\d+)月\+$'))[1]::INTEGER
        WHEN n.age_text ~ '^(\d+)岁\+$'
          THEN (regexp_match(n.age_text, '^(\d+)岁\+$'))[1]::INTEGER * 12
        WHEN n.age_text ~ '^(\d+)个月$'
          THEN (regexp_match(n.age_text, '^(\d+)个月$'))[1]::INTEGER
        WHEN n.age_text ~ '^(\d+)月$'
          THEN (regexp_match(n.age_text, '^(\d+)月$'))[1]::INTEGER
        WHEN n.age_text ~ '^(\d+)岁(\d+)个月$'
          THEN (regexp_match(n.age_text, '^(\d+)岁(\d+)个月$'))[1]::INTEGER * 12
             + (regexp_match(n.age_text, '^(\d+)岁(\d+)个月$'))[2]::INTEGER
        WHEN n.age_text ~ '^(\d+)岁$'
          THEN (regexp_match(n.age_text, '^(\d+)岁$'))[1]::INTEGER * 12
        ELSE r.age_min_months
      END,
      age_max_months = CASE
        WHEN n.age_text ~ '^(\d+)-(\d+)月$'
          THEN GREATEST(
            (regexp_match(n.age_text, '^(\d+)-(\d+)月$'))[1]::INTEGER,
            (regexp_match(n.age_text, '^(\d+)-(\d+)月$'))[2]::INTEGER
          )
        WHEN n.age_text ~ '^(\d+)-(\d+)岁$'
          THEN GREATEST(
            (regexp_match(n.age_text, '^(\d+)-(\d+)岁$'))[1]::INTEGER,
            (regexp_match(n.age_text, '^(\d+)-(\d+)岁$'))[2]::INTEGER
          ) * 12
        WHEN n.age_text ~ '^(\d+)个月\+$'
          THEN NULL
        WHEN n.age_text ~ '^(\d+)月\+$'
          THEN NULL
        WHEN n.age_text ~ '^(\d+)岁\+$'
          THEN NULL
        WHEN n.age_text ~ '^(\d+)个月$'
          THEN (regexp_match(n.age_text, '^(\d+)个月$'))[1]::INTEGER
        WHEN n.age_text ~ '^(\d+)月$'
          THEN (regexp_match(n.age_text, '^(\d+)月$'))[1]::INTEGER
        WHEN n.age_text ~ '^(\d+)岁(\d+)个月$'
          THEN (regexp_match(n.age_text, '^(\d+)岁(\d+)个月$'))[1]::INTEGER * 12
             + (regexp_match(n.age_text, '^(\d+)岁(\d+)个月$'))[2]::INTEGER
        WHEN n.age_text ~ '^(\d+)岁$'
          THEN (regexp_match(n.age_text, '^(\d+)岁$'))[1]::INTEGER * 12 + 11
        ELSE r.age_max_months
      END
    FROM normalized n
    WHERE r.id = n.id;

    IF NOT EXISTS (
      SELECT 1 FROM recipes WHERE age_min_months IS NULL
    ) THEN
      ALTER TABLE recipes
        ALTER COLUMN age_min_months SET NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'chk_recipes_age_month_range'
    ) THEN
      ALTER TABLE recipes
        ADD CONSTRAINT chk_recipes_age_month_range
        CHECK (age_max_months IS NULL OR age_max_months >= age_min_months);
    END IF;

    CREATE INDEX IF NOT EXISTS idx_recipes_content_status_age_months
      ON recipes(content_status, age_min_months, age_max_months);
  END IF;
END $$;
