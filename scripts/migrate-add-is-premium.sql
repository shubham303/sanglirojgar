-- Add is_premium column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;

-- Index for sorting premium jobs first
CREATE INDEX IF NOT EXISTS idx_jobs_is_premium ON jobs (is_premium DESC);
