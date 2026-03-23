-- Migration: Add email and application_link to jobs, make phone nullable
-- Run this in your Supabase SQL editor

-- Make phone nullable (employers can now use email or application link instead)
ALTER TABLE jobs ALTER COLUMN phone DROP NOT NULL;

-- Add email field (optional contact method)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS email text;

-- Add application_link field (optional external apply URL)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_link text;
