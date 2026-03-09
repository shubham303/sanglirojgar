-- Migration: Create job_seekers table for WhatsApp job alert signups
-- Run this against Supabase (or local Postgres) before deploying new code.

-- 1. Create job_seekers table
CREATE TABLE IF NOT EXISTS job_seekers (
  phone TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);

-- 2. RLS policies (Supabase)
ALTER TABLE job_seekers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read job_seekers" ON job_seekers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert job_seekers" ON job_seekers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update job_seekers" ON job_seekers FOR UPDATE USING (true) WITH CHECK (true);
