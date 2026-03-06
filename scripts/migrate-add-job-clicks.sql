-- Create job_clicks table — single source of truth for all click tracking
-- Replaces the stale call_count/whatsapp_count columns on the jobs table
-- Those columns can be dropped later once this is deployed and verified
CREATE TABLE IF NOT EXISTS job_clicks (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  click_type TEXT NOT NULL CHECK (click_type IN ('call', 'whatsapp')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient date-range queries and per-job count aggregation
CREATE INDEX IF NOT EXISTS idx_job_clicks_created_at ON job_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_job_clicks_job_id ON job_clicks(job_id);

-- Enable RLS (Supabase best practice)
ALTER TABLE job_clicks ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by our API)
CREATE POLICY "Service role full access" ON job_clicks
  FOR ALL
  USING (true)
  WITH CHECK (true);
