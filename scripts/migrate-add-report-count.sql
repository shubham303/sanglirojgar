-- Add report_count column to jobs table
ALTER TABLE jobs ADD COLUMN report_count INTEGER NOT NULL DEFAULT 0;
