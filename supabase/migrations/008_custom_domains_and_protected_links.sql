-- Add custom domain support to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

-- Create custom_domains table for domain verification and management
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT NOT NULL,
  dns_configured BOOLEAN DEFAULT FALSE,
  ssl_status TEXT DEFAULT 'pending', -- pending, active, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON custom_domains(user_id);

-- Add password protection to links
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT FALSE;
ALTER TABLE links ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add enhanced scheduling fields to links
ALTER TABLE links ADD COLUMN IF NOT EXISTS time_start TIME;
ALTER TABLE links ADD COLUMN IF NOT EXISTS time_end TIME;
ALTER TABLE links ADD COLUMN IF NOT EXISTS recurring_schedule JSONB;

-- Function to check if link is currently visible based on schedule
CREATE OR REPLACE FUNCTION is_link_visible(
  link_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  link RECORD;
  check_time TIME;
  check_date DATE;
  check_day INT; -- 0 = Sunday, 6 = Saturday
BEGIN
  SELECT * INTO link FROM links WHERE id = link_id;
  
  -- If link is not active, return false
  IF NOT link.is_active THEN
    RETURN FALSE;
  END IF;
  
  check_time := LOCALTIME;
  check_date := CURRENT_DATE;
  check_day := EXTRACT(DOW FROM check_date);
  
  -- Check date range
  IF link.schedule_start IS NOT NULL AND check_date < link.schedule_start THEN
    RETURN FALSE;
  END IF;
  
  IF link.schedule_end IS NOT NULL AND check_date > link.schedule_end THEN
    RETURN FALSE;
  END IF;
  
  -- Check time range
  IF link.time_start IS NOT NULL AND link.time_end IS NOT NULL THEN
    IF check_time < link.time_start OR check_time > link.time_end THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check recurring schedule
  IF link.recurring_schedule IS NOT NULL THEN
    -- Check if current day is in allowed days
    IF link.recurring_schedule->>'type' = 'days_of_week' THEN
      IF NOT (link.recurring_schedule->'days' ? check_day::TEXT) THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on custom_domains
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_domains
CREATE POLICY "Users can view their own domains"
  ON custom_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own domains"
  ON custom_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains"
  ON custom_domains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains"
  ON custom_domains FOR DELETE
  USING (auth.uid() = user_id);

-- Comment on tables
COMMENT ON TABLE custom_domains IS 'Stores custom domain configurations for user profiles';
COMMENT ON COLUMN links.is_protected IS 'Whether this link requires a password to access';
COMMENT ON COLUMN links.password_hash IS 'Hashed password for protected links';
COMMENT ON COLUMN links.time_start IS 'Daily start time for link visibility';
COMMENT ON COLUMN links.time_end IS 'Daily end time for link visibility';
COMMENT ON COLUMN links.recurring_schedule IS 'JSON configuration for recurring schedules (e.g., weekends only)';
