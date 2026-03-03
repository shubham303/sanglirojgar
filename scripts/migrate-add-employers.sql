-- Migration: Create employers table and establish FK from jobs
-- Run this against Supabase (or local Postgres) before deploying new code.

-- 1. Create employers table
CREATE TABLE IF NOT EXISTS employers (
  phone TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS policies (Supabase)
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read employers" ON employers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert employers" ON employers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update employers" ON employers FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Backfill from existing jobs (earliest name per phone)
INSERT INTO employers (phone, name, created_at)
SELECT DISTINCT ON (phone) phone, employer_name, MIN(created_at) OVER (PARTITION BY phone)
FROM jobs ORDER BY phone, created_at ASC
ON CONFLICT (phone) DO NOTHING;

-- 4. Add FK constraint
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_employer FOREIGN KEY (phone) REFERENCES employers(phone);
