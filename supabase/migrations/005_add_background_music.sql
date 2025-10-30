-- Add background music URL to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS background_music_url TEXT,
ADD COLUMN IF NOT EXISTS music_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS music_volume DECIMAL(3,2) DEFAULT 0.5 CHECK (music_volume >= 0 AND music_volume <= 1);
