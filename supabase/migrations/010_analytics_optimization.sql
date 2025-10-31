-- Optimized RPC functions for analytics with better performance

-- Get analytics summary with single query
CREATE OR REPLACE FUNCTION get_analytics_summary(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', (
      SELECT COUNT(*) 
      FROM analytics 
      WHERE user_id = p_user_id 
        AND event_type = 'view'
        AND created_at BETWEEN p_start_date AND p_end_date
    ),
    'total_clicks', (
      SELECT COUNT(*) 
      FROM analytics 
      WHERE user_id = p_user_id 
        AND event_type = 'click'
        AND created_at BETWEEN p_start_date AND p_end_date
    ),
    'unique_visitors', (
      SELECT COUNT(DISTINCT ip_address) 
      FROM analytics 
      WHERE user_id = p_user_id 
        AND created_at BETWEEN p_start_date AND p_end_date
    ),
    'top_links', (
      SELECT json_agg(link_stats ORDER BY clicks DESC)
      FROM (
        SELECT 
          l.id,
          l.title,
          COUNT(a.id) as clicks,
          COUNT(DISTINCT a.ip_address) as unique_clicks
        FROM links l
        LEFT JOIN analytics a ON a.link_id = l.id 
          AND a.event_type = 'click'
          AND a.created_at BETWEEN p_start_date AND p_end_date
        WHERE l.user_id = p_user_id
        GROUP BY l.id, l.title
        ORDER BY clicks DESC
        LIMIT 10
      ) link_stats
    ),
    'device_breakdown', (
      SELECT json_agg(device_stats)
      FROM (
        SELECT 
          device_type,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 2) as percentage
        FROM analytics
        WHERE user_id = p_user_id
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY device_type
      ) device_stats
    ),
    'top_countries', (
      SELECT json_agg(country_stats ORDER BY visits DESC)
      FROM (
        SELECT 
          COALESCE(country, 'Unknown') as country,
          COUNT(*) as visits,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM analytics
        WHERE user_id = p_user_id
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY country
        ORDER BY visits DESC
        LIMIT 10
      ) country_stats
    ),
    'hourly_pattern', (
      SELECT json_agg(hourly_stats ORDER BY hour)
      FROM (
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) FILTER (WHERE event_type = 'view') as views,
          COUNT(*) FILTER (WHERE event_type = 'click') as clicks
        FROM analytics
        WHERE user_id = p_user_id
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY hour
      ) hourly_stats
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Get link performance metrics
CREATE OR REPLACE FUNCTION get_link_performance(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  link_id UUID,
  link_title TEXT,
  total_views BIGINT,
  total_clicks BIGINT,
  unique_clicks BIGINT,
  ctr NUMERIC,
  avg_time_to_click INTERVAL,
  top_referrer TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id as link_id,
    l.title as link_title,
    COUNT(DISTINCT av.id) as total_views,
    COUNT(DISTINCT ac.id) as total_clicks,
    COUNT(DISTINCT ac.ip_address) as unique_clicks,
    CASE 
      WHEN COUNT(DISTINCT av.id) > 0 
      THEN ROUND((COUNT(DISTINCT ac.id)::NUMERIC / COUNT(DISTINCT av.id)::NUMERIC) * 100, 2)
      ELSE 0 
    END as ctr,
    AVG(ac.created_at - av.created_at) as avg_time_to_click,
    (
      SELECT ac2.referrer 
      FROM analytics ac2 
      WHERE ac2.link_id = l.id 
        AND ac2.referrer IS NOT NULL
        AND ac2.created_at BETWEEN p_start_date AND p_end_date
      GROUP BY ac2.referrer 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as top_referrer
  FROM links l
  LEFT JOIN analytics av ON av.link_id = l.id 
    AND av.event_type = 'view'
    AND av.created_at BETWEEN p_start_date AND p_end_date
  LEFT JOIN analytics ac ON ac.link_id = l.id 
    AND ac.event_type = 'click'
    AND ac.created_at BETWEEN p_start_date AND p_end_date
  WHERE l.user_id = p_user_id
  GROUP BY l.id, l.title
  ORDER BY total_clicks DESC;
END;
$$ LANGUAGE plpgsql;

-- Get geographic analytics with city-level data
CREATE OR REPLACE FUNCTION get_geographic_analytics(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  country TEXT,
  city TEXT,
  visits BIGINT,
  clicks BIGINT,
  unique_visitors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(a.country, 'Unknown') as country,
    COALESCE(a.city, 'Unknown') as city,
    COUNT(*) FILTER (WHERE a.event_type = 'view') as visits,
    COUNT(*) FILTER (WHERE a.event_type = 'click') as clicks,
    COUNT(DISTINCT a.ip_address) as unique_visitors
  FROM analytics a
  WHERE a.user_id = p_user_id
    AND a.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY a.country, a.city
  ORDER BY visits DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Get conversion funnel data
CREATE OR REPLACE FUNCTION get_conversion_funnel(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  step_name TEXT,
  step_count BIGINT,
  step_percentage NUMERIC
) AS $$
DECLARE
  v_profile_views BIGINT;
  v_link_clicks BIGINT;
  v_external_visits BIGINT;
  v_conversions BIGINT;
BEGIN
  -- Step 1: Profile Views
  SELECT COUNT(DISTINCT ip_address) INTO v_profile_views
  FROM analytics
  WHERE user_id = p_user_id
    AND event_type = 'view'
    AND link_id IS NULL
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Step 2: Link Clicks
  SELECT COUNT(DISTINCT ip_address) INTO v_link_clicks
  FROM analytics
  WHERE user_id = p_user_id
    AND event_type = 'click'
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Step 3: External Visits (users who clicked and visited external link)
  SELECT COUNT(DISTINCT ip_address) INTO v_external_visits
  FROM analytics a1
  WHERE a1.user_id = p_user_id
    AND a1.event_type = 'click'
    AND EXISTS (
      SELECT 1 FROM analytics a2 
      WHERE a2.ip_address = a1.ip_address 
        AND a2.event_type = 'external_visit'
        AND a2.created_at > a1.created_at
        AND a2.created_at < a1.created_at + INTERVAL '5 minutes'
    )
    AND a1.created_at BETWEEN p_start_date AND p_end_date;

  -- Step 4: Conversions (if tracking conversions)
  SELECT COUNT(*) INTO v_conversions
  FROM analytics
  WHERE user_id = p_user_id
    AND event_type = 'conversion'
    AND created_at BETWEEN p_start_date AND p_end_date;

  RETURN QUERY
  SELECT * FROM (
    VALUES
      ('Profile Views', v_profile_views, 100.0),
      ('Link Clicks', v_link_clicks, 
        CASE WHEN v_profile_views > 0 
          THEN ROUND((v_link_clicks::NUMERIC / v_profile_views::NUMERIC) * 100, 2)
          ELSE 0 
        END
      ),
      ('External Visits', v_external_visits,
        CASE WHEN v_profile_views > 0
          THEN ROUND((v_external_visits::NUMERIC / v_profile_views::NUMERIC) * 100, 2)
          ELSE 0
        END
      ),
      ('Conversions', v_conversions,
        CASE WHEN v_profile_views > 0
          THEN ROUND((v_conversions::NUMERIC / v_profile_views::NUMERIC) * 100, 2)
          ELSE 0
        END
      )
  ) AS funnel(step_name, step_count, step_percentage);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_user_event_date 
  ON analytics(user_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_link_date 
  ON analytics(link_id, created_at DESC) WHERE link_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_ip_date 
  ON analytics(ip_address, created_at DESC) WHERE ip_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_country 
  ON analytics(country) WHERE country IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_device 
  ON analytics(device_type);

CREATE INDEX IF NOT EXISTS idx_analytics_referrer 
  ON analytics(referrer) WHERE referrer IS NOT NULL;

-- Materialized view for daily analytics (updates once per day)
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_analytics_summary AS
SELECT 
  user_id,
  DATE(created_at) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT ip_address) as unique_visitors,
  COUNT(DISTINCT link_id) as unique_links
FROM analytics
GROUP BY user_id, DATE(created_at), event_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_analytics_unique 
  ON daily_analytics_summary(user_id, date, event_type);

-- Function to refresh daily analytics (run as cron job)
CREATE OR REPLACE FUNCTION refresh_daily_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_analytics_summary;
END;
$$ LANGUAGE plpgsql;
