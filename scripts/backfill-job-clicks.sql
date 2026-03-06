-- Backfill job_clicks from existing call_count/whatsapp_count columns on jobs table
-- Since we don't have actual click timestamps, we spread clicks evenly across
-- the job's lifetime (from created_at to now) to give a rough historical view.
-- Each click gets a random timestamp between the job's created_at and now.

-- Insert call clicks
INSERT INTO job_clicks (job_id, click_type, created_at)
SELECT
  j.id,
  'call',
  j.created_at + (random() * (NOW() - j.created_at))
FROM jobs j
CROSS JOIN generate_series(1, GREATEST(j.call_count, 0)) AS s
WHERE j.call_count > 0;

-- Insert whatsapp clicks
INSERT INTO job_clicks (job_id, click_type, created_at)
SELECT
  j.id,
  'whatsapp',
  j.created_at + (random() * (NOW() - j.created_at))
FROM jobs j
CROSS JOIN generate_series(1, GREATEST(j.whatsapp_count, 0)) AS s
WHERE j.whatsapp_count > 0;
