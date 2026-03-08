-- Migration: Create whatsapp_outreach table for employer outreach tracking
-- Run this against Supabase before deploying new code.

-- 1. Create table
CREATE TABLE IF NOT EXISTS whatsapp_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  source_group TEXT,
  added_date TIMESTAMPTZ DEFAULT NOW(),
  message_sent BOOLEAN DEFAULT FALSE,
  sent_date TIMESTAMPTZ
);

-- 2. RLS policies (Supabase)
ALTER TABLE whatsapp_outreach ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read whatsapp_outreach" ON whatsapp_outreach FOR SELECT USING (true);
CREATE POLICY "Anyone can insert whatsapp_outreach" ON whatsapp_outreach FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update whatsapp_outreach" ON whatsapp_outreach FOR UPDATE USING (true) WITH CHECK (true);
