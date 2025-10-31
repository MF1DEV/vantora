-- Add advanced theme customization to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_colors JSONB DEFAULT '{
  "accent": "#3b82f6",
  "button": "#3b82f6",
  "buttonText": "#ffffff",
  "text": "#ffffff",
  "textSecondary": "#94a3b8"
}'::jsonb;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_heading TEXT DEFAULT 'Inter';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_body TEXT DEFAULT 'Inter';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_type TEXT DEFAULT 'gradient'; -- gradient, solid, image, video
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_video_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#0f172a';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_gradient JSONB DEFAULT '{
  "type": "linear",
  "angle": 135,
  "colors": ["#0f172a", "#1e293b"]
}'::jsonb;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enable_particles BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'rounded'; -- rounded, pill, square, outlined, soft, gradient, neon, glass, minimal

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_css TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_layout TEXT DEFAULT 'centered'; -- centered, grid, masonry, card, minimal

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '["avatar", "bio", "social", "links"]'::jsonb;

-- Add advanced link customization
ALTER TABLE links ADD COLUMN IF NOT EXISTS custom_style JSONB DEFAULT '{}'::jsonb;
ALTER TABLE links ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS badge TEXT; -- NEW, HOT, SALE, LIMITED, etc
ALTER TABLE links ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT '#ef4444';
ALTER TABLE links ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Create widgets table
CREATE TABLE IF NOT EXISTS profile_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- about, gallery, testimonials, faq, countdown, newsletter
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_widgets_user_id ON profile_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_widgets_position ON profile_widgets(position);

-- Enable RLS on widgets
ALTER TABLE profile_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own widgets"
  ON profile_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widgets"
  ON profile_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widgets"
  ON profile_widgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widgets"
  ON profile_widgets FOR DELETE
  USING (auth.uid() = user_id);

-- Allow public to view active widgets
CREATE POLICY "Public can view active widgets"
  ON profile_widgets FOR SELECT
  USING (is_active = true);

-- Comments
COMMENT ON COLUMN profiles.custom_colors IS 'Custom color scheme: accent, button, text colors';
COMMENT ON COLUMN profiles.font_heading IS 'Google Font name for headings';
COMMENT ON COLUMN profiles.font_body IS 'Google Font name for body text';
COMMENT ON COLUMN profiles.background_type IS 'Background type: gradient, solid, image, video';
COMMENT ON COLUMN profiles.background_gradient IS 'Gradient configuration with type, angle, and colors';
COMMENT ON COLUMN profiles.button_style IS 'Button style preset name';
COMMENT ON COLUMN profiles.custom_css IS 'User custom CSS (sanitized)';
COMMENT ON COLUMN profiles.profile_layout IS 'Profile layout type';
COMMENT ON COLUMN profiles.section_order IS 'Order of profile sections';

COMMENT ON COLUMN links.custom_style IS 'Per-link custom styling overrides';
COMMENT ON COLUMN links.thumbnail_url IS 'Link thumbnail/preview image';
COMMENT ON COLUMN links.badge IS 'Badge text (NEW, HOT, etc)';
COMMENT ON COLUMN links.category IS 'Link category/folder name';

COMMENT ON TABLE profile_widgets IS 'Custom widgets for profile pages (galleries, forms, etc)';
