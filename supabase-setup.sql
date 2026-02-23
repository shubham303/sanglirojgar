-- Run this in your Supabase SQL Editor to create the jobs table

CREATE TABLE jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_name text NOT NULL,
  phone text NOT NULL,
  job_type text NOT NULL,
  taluka text NOT NULL,
  salary text NOT NULL,
  description text DEFAULT '',
  workers_needed integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all jobs (filtering is done in app code)
CREATE POLICY "Anyone can read jobs"
  ON jobs FOR SELECT
  USING (true);

-- Allow anyone to insert jobs
CREATE POLICY "Anyone can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update jobs
CREATE POLICY "Anyone can update jobs"
  ON jobs FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Index on phone for employer lookups
CREATE INDEX idx_jobs_phone ON jobs (phone);

-- Index on is_active for filtering
CREATE INDEX idx_jobs_is_active ON jobs (is_active);
