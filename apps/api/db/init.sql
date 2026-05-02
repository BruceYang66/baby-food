CREATE TYPE content_status AS ENUM ('draft', 'pending_review', 'published', 'offline', 'trash');
CREATE TYPE review_status AS ENUM ('none', 'pending', 'approved', 'rejected');
CREATE TYPE baby_member_role AS ENUM ('owner', 'collaborator', 'caregiver', 'viewer');
CREATE TYPE baby_invite_status AS ENUM ('pending', 'accepted', 'declined', 'revoked', 'expired');
CREATE TYPE feeding_record_status AS ENUM ('fed', 'skipped');
CREATE TYPE vaccine_category AS ENUM ('free', 'optional');
CREATE TYPE vaccine_record_status AS ENUM ('pending', 'completed', 'optional');
CREATE TYPE knowledge_content_type AS ENUM ('article', 'guide', 'taboo');

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  wechat_open_id TEXT UNIQUE,
  activity_label TEXT,
  status_label TEXT,
  can_app_admin BOOLEAN NOT NULL DEFAULT FALSE,
  active_baby_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE babies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  nickname TEXT NOT NULL,
  birth_date DATE NOT NULL,
  stage_label TEXT NOT NULL,
  avatar_url TEXT
);

CREATE TABLE baby_allergens (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES babies(id),
  name TEXT NOT NULL,
  severity TEXT
);

CREATE TABLE baby_members (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES babies(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role baby_member_role NOT NULL DEFAULT 'collaborator',
  display_name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(baby_id, user_id)
);

CREATE TABLE baby_invites (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES babies(id),
  inviter_user_id TEXT NOT NULL REFERENCES users(id),
  invitee_user_id TEXT REFERENCES users(id),
  invitee_nickname TEXT,
  invitee_contact TEXT,
  role baby_member_role NOT NULL DEFAULT 'collaborator',
  status baby_invite_status NOT NULL DEFAULT 'pending',
  invite_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_baby_invites_invitee_user_status ON baby_invites(invitee_user_id, status);
CREATE INDEX idx_baby_invites_baby_status ON baby_invites(baby_id, status);

CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  cover_image TEXT,
  age_label TEXT NOT NULL,
  age_min_months INTEGER NOT NULL,
  age_max_months INTEGER,
  duration_label TEXT NOT NULL,
  difficulty_label TEXT NOT NULL,
  source TEXT,
  creator TEXT,
  favorites INTEGER NOT NULL DEFAULT 0,
  review_focus TEXT,
  content_status content_status NOT NULL DEFAULT 'draft',
  review_status review_status NOT NULL DEFAULT 'none',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_recipes_age_month_range CHECK (age_max_months IS NULL OR age_max_months >= age_min_months)
);

CREATE INDEX idx_recipes_content_status_age_months ON recipes(content_status, age_min_months, age_max_months);

CREATE TABLE recipe_ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  name TEXT NOT NULL,
  amount TEXT NOT NULL,
  unit TEXT
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
  baby_id TEXT NOT NULL REFERENCES babies(id),
  title TEXT NOT NULL,
  plan_date DATE NOT NULL,
  date_label TEXT NOT NULL,
  nutrition_score INTEGER NOT NULL,
  water_suggestion TEXT,
  UNIQUE(baby_id, plan_date)
);

CREATE TABLE custom_recipes (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES babies(id),
  title TEXT NOT NULL,
  focus TEXT,
  cover_image TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE meal_plan_items (
  id TEXT PRIMARY KEY,
  meal_plan_id TEXT NOT NULL REFERENCES meal_plans(id),
  recipe_id TEXT REFERENCES recipes(id),
  custom_recipe_id TEXT REFERENCES custom_recipes(id),
  slot TEXT NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  focus TEXT,
  snapshot_title TEXT,
  snapshot_focus TEXT,
  snapshot_image TEXT,
  snapshot_tags_json TEXT
);

CREATE TABLE feeding_records (
  id TEXT PRIMARY KEY,
  meal_plan_id TEXT NOT NULL REFERENCES meal_plans(id),
  meal_plan_item_id TEXT NOT NULL REFERENCES meal_plan_items(id),
  status feeding_record_status NOT NULL,
  note TEXT,
  fed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(meal_plan_item_id)
);

CREATE INDEX idx_feeding_records_meal_plan_id ON feeding_records(meal_plan_id);

CREATE TABLE guide_stages (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  feeding_tips_json TEXT NOT NULL DEFAULT '[]',
  qa_json TEXT NOT NULL DEFAULT '[]',
  daily_schedule_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0
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

CREATE TABLE user_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE TABLE vaccine_schedules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  disease TEXT NOT NULL,
  stage_label TEXT NOT NULL,
  recommended_age_label TEXT NOT NULL,
  category vaccine_category NOT NULL,
  description TEXT,
  precautions_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE vaccine_records (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES babies(id),
  schedule_id TEXT NOT NULL REFERENCES vaccine_schedules(id),
  status vaccine_record_status NOT NULL DEFAULT 'pending',
  vaccinated_at DATE,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(baby_id, schedule_id)
);

CREATE INDEX idx_vaccine_records_baby_status ON vaccine_records(baby_id, status);

CREATE TABLE knowledge_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  summary TEXT NOT NULL,
  cover_image TEXT,
  category_key TEXT NOT NULL,
  category_label TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  content_type knowledge_content_type NOT NULL,
  content TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  content_status content_status NOT NULL DEFAULT 'published',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE knowledge_article_sections (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  images_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_knowledge_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  article_id TEXT NOT NULL REFERENCES knowledge_articles(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

CREATE TABLE user_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_login_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  login_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_user_login_logs_user_id_login_at ON user_login_logs(user_id, login_at);
