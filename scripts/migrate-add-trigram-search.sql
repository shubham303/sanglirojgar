-- Migration: Add trigram text search for jobs
-- Run this in Supabase SQL Editor
-- Wrapped in a transaction — rolls back entirely if any step fails.

-- CREATE EXTENSION must run outside the transaction block
CREATE EXTENSION IF NOT EXISTS pg_trgm;

BEGIN;

-- 1. Drop legacy job_type text column (replaced by job_type_id FK)
ALTER TABLE jobs DROP COLUMN IF EXISTS job_type;

-- 2. Add content column for full-text trigram search
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS content text DEFAULT '';

-- 2. Backfill existing jobs
UPDATE jobs j SET content = COALESCE(
  (SELECT jt.name_mr || ' ' || jt.name_en FROM job_types jt WHERE jt.id = j.job_type_id), ''
) || ' ' || COALESCE(j.district, '') || ' ' || COALESCE(j.taluka, '') || ' '
|| COALESCE(j.description, '') || ' ' || COALESCE(j.employer_name, '');

-- 3. Create GIN index for fast trigram search
CREATE INDEX IF NOT EXISTS idx_jobs_content_trgm ON jobs USING gin (content gin_trgm_ops);

-- 4. RPC function for trigram search (PostgREST can't use similarity() directly)
--    Explicitly select columns to avoid type mismatches from j.*
CREATE OR REPLACE FUNCTION search_jobs(
  search_query text,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid, employer_name text, phone text, job_type_id int,
  state text, district text, taluka text, salary text,
  description text, minimum_education text, experience_years text,
  workers_needed int, gender text, created_at timestamptz,
  is_active boolean, is_deleted boolean, expires_at timestamptz,
  is_scraped boolean, content text, rank real
) AS $$
  SELECT
    j.id, j.employer_name, j.phone, j.job_type_id::int,
    j.state, j.district, j.taluka, j.salary,
    j.description, j.minimum_education, j.experience_years,
    j.workers_needed::int, j.gender, j.created_at,
    j.is_active, j.is_deleted, j.expires_at,
    j.is_scraped, j.content,
    word_similarity(search_query, j.content)::real AS rank
  FROM jobs j
  WHERE j.is_active = true AND j.is_deleted = false
    AND word_similarity(search_query, j.content) > 0.1
  ORDER BY rank DESC
  LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE sql STABLE;

-- 5. Count function for search results total
CREATE OR REPLACE FUNCTION search_jobs_count(search_query text)
RETURNS bigint AS $$
  SELECT count(*)
  FROM jobs
  WHERE is_active = true AND is_deleted = false
    AND word_similarity(search_query, content) > 0.1;
$$ LANGUAGE sql STABLE;

COMMIT;
