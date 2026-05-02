ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS age_min_months INTEGER,
  ADD COLUMN IF NOT EXISTS age_max_months INTEGER;

-- Backfill from existing age_label
UPDATE recipes
SET
  age_min_months = CASE
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)-(\d+)月$'
      THEN LEAST(
        (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)-(\d+)月$'))[1]::INTEGER,
        (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)-(\d+)月$'))[2]::INTEGER
      )
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)-(\d+)岁$'
      THEN LEAST(
        (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)-(\d+)岁$'))[1]::INTEGER,
        (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)-(\d+)岁$'))[2]::INTEGER
      ) * 12
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)个月\+$'
      THEN (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)个月\+$'))[1]::INTEGER
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)岁\+$'
      THEN (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)岁\+$'))[1]::INTEGER * 12
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)个月$'
      THEN (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)个月$'))[1]::INTEGER
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)岁(\d+)个月$'
      THEN (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)岁(\d+)个月$'))[1]::INTEGER * 12
         + (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)岁(\d+)个月$'))[2]::INTEGER
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)岁$'
      THEN (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)岁$'))[1]::INTEGER * 12
    ELSE age_min_months
  END,
  age_max_months = CASE
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)-(\d+)月$'
      THEN GREATEST(
        (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)-(\d+)月$'))[1]::INTEGER,
        (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)-(\d+)月$'))[2]::INTEGER
      )
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)-(\d+)岁$'
      THEN GREATEST(
        (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)-(\d+)岁$'))[1]::INTEGER,
        (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)-(\d+)岁$'))[2]::INTEGER
      ) * 12
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)个月\+$'
      THEN NULL
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)岁\+$'
      THEN NULL
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)个月$'
      THEN (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)个月$'))[1]::INTEGER
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)岁(\d+)个月$'
      THEN (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)岁(\d+)个月$'))[1]::INTEGER * 12
         + (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)岁(\d+)个月$'))[2]::INTEGER
    WHEN regexp_replace(age_label, '\s+', '', 'g') ~ '^(\d+)岁$'
      THEN (regexp_match(regexp_replace(age_label, '\s+', '', 'g'), '^(\d+)岁$'))[1]::INTEGER * 12 + 11
    ELSE age_max_months
  END;

ALTER TABLE recipes
  ALTER COLUMN age_min_months SET NOT NULL;

ALTER TABLE recipes
  ADD CONSTRAINT chk_recipes_age_month_range
  CHECK (age_max_months IS NULL OR age_max_months >= age_min_months);

CREATE INDEX IF NOT EXISTS idx_recipes_content_status_age_months
  ON recipes(content_status, age_min_months, age_max_months);
