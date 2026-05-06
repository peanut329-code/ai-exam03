-- 在 Supabase > SQL Editor 執行此檔案
-- 專案：my-teaching-tools

CREATE TABLE IF NOT EXISTS wrong_answers (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  question_id     TEXT NOT NULL,
  question        TEXT NOT NULL,
  options         JSONB DEFAULT '[]',
  answer          TEXT NOT NULL,
  explanation     TEXT DEFAULT '',
  file_name       TEXT DEFAULT '',
  repetitions     INTEGER DEFAULT 0,
  ease_factor     FLOAT DEFAULT 2.5,
  interval_days   INTEGER DEFAULT 1,
  next_review     TIMESTAMPTZ DEFAULT NOW(),
  added_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：查詢某用戶今天到期的錯題
CREATE INDEX IF NOT EXISTS idx_wrong_answers_user_review
  ON wrong_answers (user_id, next_review);

-- Row Level Security（允許匿名讀寫，適合個人使用）
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON wrong_answers
  FOR ALL USING (true) WITH CHECK (true);
