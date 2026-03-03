-- Rollback: Remove employers table and FK constraint
-- Run this to revert migrate-add-employers.sql

-- 1. Drop FK constraint from jobs
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS fk_jobs_employer;

-- 2. Drop RLS policies
DROP POLICY IF EXISTS "Anyone can read employers" ON employers;
DROP POLICY IF EXISTS "Anyone can insert employers" ON employers;
DROP POLICY IF EXISTS "Anyone can update employers" ON employers;

-- 3. Drop employers table
DROP TABLE IF EXISTS employers;
