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

-- Job types table (admin-managed)
CREATE TABLE job_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS for job_types
ALTER TABLE job_types ENABLE ROW LEVEL SECURITY;

-- Anyone can read job types
CREATE POLICY "Anyone can read job_types"
  ON job_types FOR SELECT
  USING (true);

-- Anyone can insert job types (admin check is in app code)
CREATE POLICY "Anyone can insert job_types"
  ON job_types FOR INSERT
  WITH CHECK (true);

-- Anyone can delete job types (admin check is in app code)
CREATE POLICY "Anyone can delete job_types"
  ON job_types FOR DELETE
  USING (true);

-- Seed initial job types
INSERT INTO job_types (name) VALUES
  ('सेल्समन'),
  ('डिलिव्हरी बॉय'),
  ('स्वयंपाकी'),
  ('वेटर'),
  ('सुरक्षा रक्षक'),
  ('ड्रायव्हर'),
  ('मेकॅनिक'),
  ('इलेक्ट्रिशियन'),
  ('प्लंबर'),
  ('सुतार'),
  ('वेल्डर'),
  ('शिपाई'),
  ('क्लिनर'),
  ('रिसेप्शनिस्ट'),
  ('अकाउंट सहाय्यक'),
  ('दुकान सहाय्यक'),
  ('गोडाउन कामगार'),
  ('इतर');
