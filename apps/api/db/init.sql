CREATE TYPE content_status AS ENUM ('draft', 'pending_review', 'published', 'offline', 'trash');
CREATE TYPE review_status AS ENUM ('none', 'pending', 'approved', 'rejected');

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  wechat_open_id TEXT UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE babies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  nickname TEXT NOT NULL,
  birth_date DATE NOT NULL,
  stage_label TEXT NOT NULL
);

CREATE TABLE baby_allergens (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES babies(id),
  name TEXT NOT NULL,
  severity TEXT
);

CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  cover_image TEXT,
  age_label TEXT NOT NULL,
  duration_label TEXT NOT NULL,
  difficulty_label TEXT NOT NULL,
  content_status content_status NOT NULL DEFAULT 'draft',
  review_status review_status NOT NULL DEFAULT 'none',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  name TEXT NOT NULL,
  amount TEXT NOT NULL
);

CREATE TABLE recipe_steps (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  step_no INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT
);

CREATE TABLE recipe_tags (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  name TEXT NOT NULL
);

CREATE TABLE meal_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  date_label TEXT NOT NULL,
  nutrition_score INTEGER NOT NULL
);

CREATE TABLE meal_plan_items (
  id TEXT PRIMARY KEY,
  meal_plan_id TEXT NOT NULL REFERENCES meal_plans(id),
  recipe_id TEXT REFERENCES recipes(id),
  slot TEXT NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL
);

CREATE TABLE guide_stages (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE guide_food_rules (
  id TEXT PRIMARY KEY,
  stage_id TEXT NOT NULL REFERENCES guide_stages(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  foods_json TEXT NOT NULL
);

CREATE TABLE symptom_guides (
  id TEXT PRIMARY KEY,
  symptom TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL
);

CREATE TABLE symptom_food_rules (
  id TEXT PRIMARY KEY,
  symptom_guide_id TEXT NOT NULL REFERENCES symptom_guides(id),
  type TEXT NOT NULL,
  food TEXT NOT NULL,
  reason TEXT NOT NULL
);

CREATE TABLE recipe_reviews (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  action review_status NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE recipe_versions (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  version_no INTEGER NOT NULL,
  snapshot TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE import_jobs (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  operator TEXT NOT NULL,
  total INTEGER NOT NULL,
  success INTEGER NOT NULL,
  failed INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE system_settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_val TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
