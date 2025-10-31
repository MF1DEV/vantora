-- Add social media link support to links table
-- This allows links to be tagged as social media with platform-specific styling

ALTER TABLE links ADD COLUMN IF NOT EXISTS link_type TEXT DEFAULT 'regular' CHECK (link_type IN ('regular', 'social'));
ALTER TABLE links ADD COLUMN IF NOT EXISTS social_platform TEXT CHECK (
  social_platform IS NULL OR 
  social_platform IN (
    'twitter', 'instagram', 'facebook', 'linkedin', 'github', 
    'youtube', 'tiktok', 'twitch', 'discord', 'telegram',
    'whatsapp', 'snapchat', 'reddit', 'pinterest', 'medium',
    'behance', 'dribbble', 'spotify', 'soundcloud', 'patreon'
  )
);

-- Comments for documentation
COMMENT ON COLUMN links.link_type IS 'Type of link: regular or social media';
COMMENT ON COLUMN links.social_platform IS 'Social media platform identifier for custom logo display';
