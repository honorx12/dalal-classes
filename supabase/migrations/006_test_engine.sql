-- 006_test_engine.sql
-- Additive support for a second "test" quiz mode (free-navigation, multi-question,
-- results-as-a-page) alongside the existing linear practice quiz.
-- quizzes.mode defaults to 'practice', which is exactly what QuizModal already
-- assumes today — no existing row or query needs to change.

-- Add quiz mode column to support different quiz types
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'practice'
    CHECK (mode IN ('practice', 'test'));

-- Add answers JSONB column to store per-question answers for test mode
-- completed_at defaults to NOW() so existing QuizModal inserts (which only ever
-- write a finished attempt, never a draft) keep meaning "this attempt is done."
-- The new TestRunner explicitly inserts completed_at = NULL for a draft, then
-- sets it on submit.
ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Allow NULL completed_at for draft attempts
ALTER TABLE quiz_attempts
  ALTER COLUMN completed_at DROP NOT NULL;

-- At most one in-progress (draft) attempt per user per quiz, so TestRunner can
-- upsert-by-query instead of accumulating duplicate drafts.
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_attempts_draft
  ON quiz_attempts(user_id, quiz_id)
  WHERE completed_at IS NULL;

-- Add index for faster quiz attempt lookups
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz
  ON quiz_attempts(user_id, quiz_id);

-- Add time_limit column for timed tests (optional)
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS time_limit INTEGER; -- in minutes, NULL = no limit

-- Add description column for quiz instructions
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS description TEXT;
