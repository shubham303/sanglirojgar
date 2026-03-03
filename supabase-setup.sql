-- Run this in your Supabase SQL Editor to create the jobs table

CREATE TABLE jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_name text NOT NULL,
  phone text NOT NULL,
  job_type text NOT NULL,
  state text NOT NULL DEFAULT 'महाराष्ट्र',
  district text NOT NULL DEFAULT 'सांगली',
  taluka text NOT NULL,
  salary text NOT NULL,
  description text DEFAULT '',
  minimum_education text DEFAULT NULL,
  experience_years text DEFAULT NULL,
  workers_needed integer NOT NULL DEFAULT 1,
  gender text NOT NULL DEFAULT 'both',
  call_count integer NOT NULL DEFAULT 0,
  whatsapp_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false
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

-- Index on is_deleted for filtering
CREATE INDEX idx_jobs_is_deleted ON jobs (is_deleted);

-- Industries table (groups job types by sector)
CREATE TABLE industries (
  id serial PRIMARY KEY,
  name_mr text NOT NULL UNIQUE,
  name_en text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS for industries
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read industries"
  ON industries FOR SELECT
  USING (true);

-- Seed industries
INSERT INTO industries (id, name_mr, name_en) VALUES
  (1, 'सामान्य', 'General'),
  (2, 'हॉस्पिटल', 'Hospital'),
  (3, 'हॉटेल', 'Hotel'),
  (4, 'उत्पादन', 'Manufacturing'),
  (5, 'बांधकाम', 'Construction'),
  (6, 'शिक्षण', 'Education'),
  (7, 'सॉफ्टवेअर', 'Software'),
  (8, 'रिअल इस्टेट', 'Real Estate'),
  (9, 'व्यापार', 'Trading');

-- Job types table (admin-managed, grouped by industry)
CREATE TABLE job_types (
  id serial PRIMARY KEY,
  name_mr text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  industry_id integer REFERENCES industries(id) DEFAULT 1,
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

-- Seed job types with industry assignments
INSERT INTO job_types (id, name_mr, name_en, industry_id) VALUES
  (1, 'सेल्समन', 'Salesman', 1),
  (2, 'डिलिव्हरी बॉय', 'Delivery Boy', 1),
  (3, 'स्वयंपाकी', 'Cook', 3),
  (4, 'वेटर', 'Waiter', 3),
  (5, 'सुरक्षा रक्षक', 'Security Guard', 1),
  (6, 'ड्रायव्हर', 'Driver', 1),
  (7, 'मेकॅनिक', 'Mechanic', 1),
  (8, 'इलेक्ट्रिशियन', 'Electrician', 5),
  (9, 'प्लंबर', 'Plumber', 5),
  (10, 'सुतार', 'Carpenter', 5),
  (11, 'वेल्डर', 'Welder', 4),
  (12, 'शिपाई', 'Peon', 1),
  (13, 'सफाई कर्मचारी', 'Cleaner', 1),
  (14, 'रिसेप्शनिस्ट', 'Receptionist', 1),
  (15, 'दुकान सहाय्यक', 'Shop Assistant', 1),
  (16, 'गोडाउन कामगार', 'Warehouse Worker', 1),
  (17, 'हेल्पर', 'Helper', 1),
  (18, 'सुपरवायझर', 'Supervisor', 1),
  (19, 'टेलिकॉलर', 'Telecaller', 1),
  (20, 'एचआर', 'HR', 1),
  (21, 'बँक कर्मचारी', 'Bank Staff', 1),
  (22, 'कॉम्प्युटर ऑपरेटर', 'Computer Operator', 1),
  (23, 'शिक्षक', 'Teacher', 6),
  (24, 'नर्स', 'Nurse', 2),
  (25, 'तंत्रज्ञ', 'Technician', 2),
  (26, 'मशीन ऑपरेटर', 'Machine Operator', 4),
  (27, 'ऑफिस सहाय्यक', 'Office Assistant', 1),
  (28, 'फील्ड वर्कर', 'Field Worker', 1),
  (29, 'इंजिनिअर', 'Engineer', 1),
  (30, 'व्हिडिओ एडिटर', 'Video Editor', 1),
  (31, 'मार्केटिंग', 'Marketing', 1),
  (32, 'अकाउंटंट', 'Accountant', 1),
  (33, 'कामगार', 'Worker', 4),
  (34, 'इतर', 'Other', 1),
  (35, 'आरएमओ', 'RMO', 2),
  (36, 'हॉस्पिटल ब्रदर', 'Hospital Brother', 2),
  (37, 'हॉस्पिटल सिस्टर', 'Hospital Sister', 2),
  (38, 'सीएचओ', 'CHO', 2),
  (39, 'हॉस्पिटल तंत्रज्ञ', 'Hospital Technician', 2),
  (40, 'ओटी तंत्रज्ञ', 'OT Technician', 2),
  (41, 'कॅथलॅब तंत्रज्ञ', 'Cathlab Technician', 2),
  (42, 'परफ्युजनिस्ट', 'Perfusionist', 2),
  (43, 'हाउसकीपिंग', 'Housekeeping', 2);

-- Reset industries sequence to max id
SELECT setval('industries_id_seq', (SELECT MAX(id) FROM industries));
