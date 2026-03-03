-- Migration: Add is_deleted column to jobs table
-- This separates "employer deleted job" from "employer deactivated job"
-- is_active = toggle active/inactive, is_deleted = soft delete (hidden everywhere except admin)

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

-- Index for fast filtering of non-deleted jobs
CREATE INDEX IF NOT EXISTS idx_jobs_is_deleted ON jobs (is_deleted);
