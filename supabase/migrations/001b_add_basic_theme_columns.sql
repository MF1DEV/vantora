-- Add basic theme columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_background TEXT DEFAULT 'gradient-blue';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_button_style TEXT DEFAULT 'rounded';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_accent_color TEXT DEFAULT 'blue';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS music_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_music_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS music_volume DECIMAL DEFAULT 0.5;

-- Add comments
COMMENT ON COLUMN profiles.theme_background IS 'Background theme preset name';
COMMENT ON COLUMN profiles.theme_button_style IS 'Button style preset name';
COMMENT ON COLUMN profiles.theme_accent_color IS 'Accent color name';
COMMENT ON COLUMN profiles.total_views IS 'Total profile views count';
COMMENT ON COLUMN profiles.social_links IS 'Social media links JSONB object';
COMMENT ON COLUMN profiles.music_enabled IS 'Whether background music is enabled';
COMMENT ON COLUMN profiles.background_music_url IS 'URL to background music file';
COMMENT ON COLUMN profiles.music_volume IS 'Background music volume (0-1)';
