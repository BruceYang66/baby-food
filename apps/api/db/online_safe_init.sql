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

-- 2) users app admin permission column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS can_app_admin BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- 3) recipes age month range columns + backfill + constraint + index
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

-- 4) cloud album enum + tables + indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'cloud_album_visibility'
  ) THEN
    CREATE TYPE cloud_album_visibility AS ENUM ('family', 'self');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS baby_album_entries (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES babies(id),
  author_user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  is_milestone BOOLEAN NOT NULL DEFAULT FALSE,
  visibility cloud_album_visibility NOT NULL DEFAULT 'family',
  recorded_at TIMESTAMP NOT NULL,
  recorded_date DATE NOT NULL,
  month_key TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_baby_album_entries_baby_date_created
  ON baby_album_entries(baby_id, recorded_date, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_baby_album_entries_baby_month_key
  ON baby_album_entries(baby_id, month_key DESC);
CREATE INDEX IF NOT EXISTS idx_baby_album_entries_author_created
  ON baby_album_entries(author_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS baby_album_assets (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES baby_album_entries(id) ON DELETE CASCADE,
  baby_id TEXT NOT NULL REFERENCES babies(id),
  storage_key TEXT NOT NULL,
  url TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_baby_album_assets_entry_sort_order
  ON baby_album_assets(entry_id, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_baby_album_assets_baby_created
  ON baby_album_assets(baby_id, created_at DESC);

-- 5) growth change stages
CREATE TABLE IF NOT EXISTS growth_change_stages (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  start_week INTEGER NOT NULL,
  end_week INTEGER,
  overview_title TEXT NOT NULL,
  overview_summary TEXT NOT NULL,
  highlights_json TEXT NOT NULL DEFAULT '[]',
  metrics_json TEXT NOT NULL DEFAULT '[]',
  daily_items_json TEXT NOT NULL DEFAULT '[]',
  source_note TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
