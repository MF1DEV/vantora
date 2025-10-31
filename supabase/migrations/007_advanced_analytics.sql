-- Expand analytics table with detailed tracking data
ALTER TABLE analytics 
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS device_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS browser VARCHAR(50),
ADD COLUMN IF NOT EXISTS os VARCHAR(50),
ADD COLUMN IF NOT EXISTS country VARCHAR(2),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS ip_address INET;

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics(country);
CREATE INDEX IF NOT EXISTS idx_analytics_referrer ON analytics(referrer);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Create a view for link click-through rates
CREATE OR REPLACE VIEW link_ctr_stats AS
SELECT 
  l.id as link_id,
  l.user_id,
  l.title,
  l.url,
  COUNT(DISTINCT CASE WHEN a.event_type = 'click' THEN a.id END) as total_clicks,
  COUNT(DISTINCT CASE WHEN a.event_type = 'view' THEN a.created_at::date END) as unique_days_with_views,
  ROUND(
    (COUNT(DISTINCT CASE WHEN a.event_type = 'click' THEN a.id END)::numeric / 
    NULLIF(COUNT(DISTINCT CASE WHEN a.event_type = 'view' THEN a.id END), 0)) * 100, 
    2
  ) as ctr_percentage
FROM links l
LEFT JOIN analytics a ON l.id = a.link_id
GROUP BY l.id, l.user_id, l.title, l.url;

-- Create a function to get top referrers for a user
CREATE OR REPLACE FUNCTION get_top_referrers(
  user_uuid UUID,
  days_back INTEGER DEFAULT 30,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  referrer TEXT,
  clicks BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_clicks BIGINT;
BEGIN
  -- Get total clicks
  SELECT COUNT(*) INTO total_clicks
  FROM analytics
  WHERE user_id = user_uuid
    AND event_type = 'click'
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND referrer IS NOT NULL
    AND referrer != '';

  -- Return top referrers with percentage
  RETURN QUERY
  SELECT 
    a.referrer,
    COUNT(*)::BIGINT as clicks,
    ROUND((COUNT(*)::NUMERIC / NULLIF(total_clicks, 0)) * 100, 2) as percentage
  FROM analytics a
  WHERE a.user_id = user_uuid
    AND a.event_type = 'click'
    AND a.created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND a.referrer IS NOT NULL
    AND a.referrer != ''
  GROUP BY a.referrer
  ORDER BY clicks DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get geographic breakdown
CREATE OR REPLACE FUNCTION get_geographic_stats(
  user_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  country VARCHAR(2),
  city VARCHAR(100),
  visits BIGINT,
  clicks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.country,
    a.city,
    COUNT(DISTINCT CASE WHEN a.event_type = 'view' THEN a.id END)::BIGINT as visits,
    COUNT(DISTINCT CASE WHEN a.event_type = 'click' THEN a.id END)::BIGINT as clicks
  FROM analytics a
  WHERE a.user_id = user_uuid
    AND a.created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND a.country IS NOT NULL
  GROUP BY a.country, a.city
  ORDER BY visits DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get device breakdown
CREATE OR REPLACE FUNCTION get_device_stats(
  user_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  device_type VARCHAR(20),
  visits BIGINT,
  clicks BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_events BIGINT;
BEGIN
  -- Get total events
  SELECT COUNT(*) INTO total_events
  FROM analytics
  WHERE user_id = user_uuid
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL;

  -- Return device breakdown
  RETURN QUERY
  SELECT 
    a.device_type,
    COUNT(DISTINCT CASE WHEN a.event_type = 'view' THEN a.id END)::BIGINT as visits,
    COUNT(DISTINCT CASE WHEN a.event_type = 'click' THEN a.id END)::BIGINT as clicks,
    ROUND((COUNT(*)::NUMERIC / NULLIF(total_events, 0)) * 100, 2) as percentage
  FROM analytics a
  WHERE a.user_id = user_uuid
    AND a.created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND a.device_type IS NOT NULL
  GROUP BY a.device_type
  ORDER BY visits DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function for hourly click patterns
CREATE OR REPLACE FUNCTION get_hourly_click_pattern(
  user_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  hour_of_day INTEGER,
  clicks BIGINT,
  views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM a.created_at)::INTEGER as hour_of_day,
    COUNT(DISTINCT CASE WHEN a.event_type = 'click' THEN a.id END)::BIGINT as clicks,
    COUNT(DISTINCT CASE WHEN a.event_type = 'view' THEN a.id END)::BIGINT as views
  FROM analytics a
  WHERE a.user_id = user_uuid
    AND a.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY hour_of_day
  ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql;
