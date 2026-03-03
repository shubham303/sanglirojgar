-- Add last_contacted_by_admin_at column to employers table
-- Tracks when admin last called or WhatsApp messaged an employer
ALTER TABLE employers ADD COLUMN IF NOT EXISTS last_contacted_by_admin_at TIMESTAMPTZ DEFAULT NULL;
