-- Add appearance customization columns to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'solid' CHECK (button_style IN ('solid', 'outline', 'soft-shadow', 'neon-glow'));
ALTER TABLE links ADD COLUMN IF NOT EXISTS custom_color TEXT; -- Hex color override
ALTER TABLE links ADD COLUMN IF NOT EXISTS border_radius TEXT DEFAULT 'rounded' CHECK (border_radius IN ('none', 'sm', 'rounded', 'lg', 'full'));
ALTER TABLE links ADD COLUMN IF NOT EXISTS animation TEXT DEFAULT 'none' CHECK (animation IN ('none', 'pulse', 'bounce', 'glow'));
