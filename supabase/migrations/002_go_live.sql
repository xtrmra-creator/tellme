-- Go-live: extra locales, hide PII from anon, shared counter freeze.

ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_locale_check;
ALTER TABLE predictions ADD CONSTRAINT predictions_locale_check
  CHECK (locale IN ('en', 'tr', 'de', 'fr', 'es', 'it', 'ru', 'pl', 'pt'));

-- Public stats without IP / user_agent
CREATE OR REPLACE VIEW predictions_public AS
SELECT
  id,
  created_at,
  nationality,
  locale,
  predicted_date,
  is_never,
  bunker_id,
  role,
  threat_level,
  rarity
FROM predictions;

GRANT SELECT ON predictions_public TO anon, authenticated;
REVOKE SELECT ON predictions FROM anon, authenticated;
REVOKE INSERT ON predictions FROM anon, authenticated;
REVOKE SELECT, INSERT ON emails FROM anon, authenticated;

DROP POLICY IF EXISTS "Allow public insert to predictions" ON predictions;
DROP POLICY IF EXISTS "Allow public insert to emails" ON emails;
DROP POLICY IF EXISTS "Allow public read access to predictions" ON predictions;

-- Shared live-count freeze (single row). Writes: service role only (bypasses RLS).
CREATE TABLE IF NOT EXISTS live_counter_state (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  sim_floor INTEGER NOT NULL,
  frozen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE live_counter_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read live counter" ON live_counter_state;
CREATE POLICY "public read live counter" ON live_counter_state
  FOR SELECT USING (true);

GRANT SELECT ON live_counter_state TO anon, authenticated;
