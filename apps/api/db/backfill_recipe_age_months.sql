-- Backfill only: recipes.age_min_months / age_max_months
-- Safe to rerun.

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
