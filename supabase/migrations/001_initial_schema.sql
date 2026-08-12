-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User data
  nationality VARCHAR(10) NOT NULL, -- Country code (TR, US, DE, etc.)
  locale VARCHAR(10) DEFAULT 'en',
  
  -- Prediction data
  predicted_date DATE, -- NULL if "never"
  is_never BOOLEAN DEFAULT FALSE,
  
  -- Generated bunker data
  bunker_id VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL,
  threat_level VARCHAR(20) NOT NULL,
  rarity VARCHAR(20) NOT NULL,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Indexes
  CONSTRAINT predictions_nationality_check CHECK (nationality ~ '^[A-Z]{2,10}$'),
  CONSTRAINT predictions_locale_check CHECK (locale IN ('en', 'tr', 'de', 'fr', 'es', 'it', 'ru'))
);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Email data
  email VARCHAR(255) NOT NULL UNIQUE,
  
  -- Associated prediction
  prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
  
  -- User context
  nationality VARCHAR(10),
  locale VARCHAR(10) DEFAULT 'en',
  
  -- Email status
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(100),
  verification_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Subscription preferences
  wants_updates BOOLEAN DEFAULT TRUE,
  wants_alerts BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  CONSTRAINT emails_email_check CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_predictions_nationality ON predictions(nationality);
CREATE INDEX IF NOT EXISTS idx_predictions_predicted_date ON predictions(predicted_date);
CREATE INDEX IF NOT EXISTS idx_predictions_is_never ON predictions(is_never);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_predictions_locale ON predictions(locale);

CREATE INDEX IF NOT EXISTS idx_emails_email ON emails(email);
CREATE INDEX IF NOT EXISTS idx_emails_nationality ON emails(nationality);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);
CREATE INDEX IF NOT EXISTS idx_emails_prediction_id ON emails(prediction_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_predictions_updated_at 
  BEFORE UPDATE ON predictions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at 
  BEFORE UPDATE ON emails 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for statistics
CREATE OR REPLACE VIEW prediction_stats AS
SELECT 
  nationality,
  locale,
  COUNT(*) as total_predictions,
  COUNT(CASE WHEN is_never THEN 1 END) as never_predictions,
  COUNT(CASE WHEN NOT is_never THEN 1 END) as date_predictions,
  AVG(CASE WHEN NOT is_never THEN EXTRACT(YEAR FROM predicted_date) END) as avg_predicted_year,
  MIN(CASE WHEN NOT is_never THEN predicted_date END) as earliest_date,
  MAX(CASE WHEN NOT is_never THEN predicted_date END) as latest_date,
  DATE_TRUNC('day', created_at) as prediction_date
FROM predictions 
GROUP BY nationality, locale, DATE_TRUNC('day', created_at)
ORDER BY prediction_date DESC, nationality;

-- Row Level Security (RLS) policies
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Allow public read access to predictions (for statistics)
CREATE POLICY "Allow public read access to predictions" ON predictions
  FOR SELECT USING (true);

-- Allow public insert to predictions
CREATE POLICY "Allow public insert to predictions" ON predictions
  FOR INSERT WITH CHECK (true);

-- Allow public read access to emails (limited)
CREATE POLICY "Allow public read access to emails" ON emails
  FOR SELECT USING (false); -- No public read access to emails

-- Allow public insert to emails
CREATE POLICY "Allow public insert to emails" ON emails
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON predictions TO anon, authenticated;
GRANT SELECT, INSERT ON emails TO anon, authenticated;
GRANT SELECT ON prediction_stats TO anon, authenticated;