-- 添加用户登录日志表
CREATE TABLE IF NOT EXISTS user_login_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  login_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_login_logs_user_id_login_at ON user_login_logs(user_id, login_at);
