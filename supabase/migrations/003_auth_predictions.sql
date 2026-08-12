-- Link seals to auth users so a signed-in account cannot seal twice.
-- Run in Supabase SQL after 001 + 002.

ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS predictions_user_id_unique
  ON predictions(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_predictions_user_id
  ON predictions(user_id)
  WHERE user_id IS NOT NULL;

-- Keep public view free of auth PII (user_id stays off the view).
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
