-- Migration: Add industries table and industry_id to job_types
-- Run this on an existing Supabase database that already has the job_types table
-- Wrapped in a transaction — if anything fails, everything is rolled back.

BEGIN;

-- 1. Create industries table
CREATE TABLE IF NOT EXISTS industries (
  id serial PRIMARY KEY,
  name_mr text NOT NULL UNIQUE,
  name_en text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read industries"
  ON industries FOR SELECT
  USING (true);

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

SELECT setval('industries_id_seq', (SELECT MAX(id) FROM industries));

-- 2. Add industry_id column to job_types (defaults to General=1)
ALTER TABLE job_types ADD COLUMN IF NOT EXISTS industry_id integer REFERENCES industries(id) DEFAULT 1;

-- 3. Update existing job types to correct industries
-- Hotel (3): Cook, Waiter
UPDATE job_types SET industry_id = 3 WHERE id IN (3, 4);

-- Hospital (2): Nurse, Technician
UPDATE job_types SET industry_id = 2 WHERE id IN (24, 25);

-- Manufacturing (4): Welder, Machine Operator, Worker
UPDATE job_types SET industry_id = 4 WHERE id IN (11, 26, 33);

-- Construction (5): Electrician, Plumber, Carpenter
UPDATE job_types SET industry_id = 5 WHERE id IN (8, 9, 10);

-- Education (6): Teacher
UPDATE job_types SET industry_id = 6 WHERE id = 23;

-- All others remain General (1) via default

-- 4. Insert new hospital job types
INSERT INTO job_types (id, name_mr, name_en, industry_id) VALUES
  (35, 'आरएमओ', 'RMO', 2),
  (36, 'हॉस्पिटल ब्रदर', 'Hospital Brother', 2),
  (37, 'हॉस्पिटल सिस्टर', 'Hospital Sister', 2),
  (38, 'सीएचओ', 'CHO', 2),
  (39, 'हॉस्पिटल तंत्रज्ञ', 'Hospital Technician', 2),
  (40, 'ओटी तंत्रज्ञ', 'OT Technician', 2),
  (41, 'कॅथलॅब तंत्रज्ञ', 'Cathlab Technician', 2),
  (42, 'परफ्युजनिस्ट', 'Perfusionist', 2),
  (43, 'हाउसकीपिंग', 'Housekeeping', 2)
ON CONFLICT (id) DO NOTHING;

COMMIT;
