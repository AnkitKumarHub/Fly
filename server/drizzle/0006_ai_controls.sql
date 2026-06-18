-- Migration 0006: AI controls
-- Adds: role column, user suspension, global AI kill switch, usage log, audit log

-- 1. User role + suspension fields
ALTER TABLE users
  ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT 'user',
  ADD COLUMN is_suspended BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN suspended_at TIMESTAMP,
  ADD COLUMN suspended_reason TEXT;

-- After running this migration, promote yourself to admin:
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';

-- 2. Global AI configuration (single row, admin-managed)
CREATE TABLE app_settings (
  key VARCHAR(64) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed AI config: enabled=true, 5 requests/user/day
INSERT INTO app_settings (key, value) VALUES
  ('ai_config', '{"isEnabled": true, "dailyMaxRequestsPerUser": 5}');

-- 3. Per-user, per-request AI usage tracking
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  model VARCHAR(64) NOT NULL,
  tools_called TEXT[] DEFAULT '{}',
  duration_ms INTEGER
);

CREATE INDEX idx_ai_usage_user_day ON ai_usage_log (user_id, created_at);

-- 4. AI action audit log (mandatory — liability trail)
CREATE TABLE ai_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  action VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  outcome VARCHAR(16) NOT NULL,
  ip_address VARCHAR(45)
);

CREATE INDEX idx_ai_audit_user ON ai_audit_log (user_id, created_at);
