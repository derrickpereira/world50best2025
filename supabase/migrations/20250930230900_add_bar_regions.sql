-- Add region field to bars table for World's vs Asia's 50 Best distinction
-- This migration maintains backward compatibility for existing user data

-- Add region column to bars table
ALTER TABLE bars ADD COLUMN region VARCHAR(10) DEFAULT 'asia' CHECK (region IN ('asia', 'world'));

-- Set existing bars to 'asia' region (current data is Asia's 50 Best)
UPDATE bars SET region = 'asia' WHERE region IS NULL;

-- Make the region column not null now that we've set default values
ALTER TABLE bars ALTER COLUMN region SET NOT NULL;

-- Create index on region for efficient filtering
CREATE INDEX idx_bars_region ON bars(region);

-- Comments for documentation
COMMENT ON COLUMN bars.region IS 'Region designation: asia for Asias 50 Best, world for Worlds 50 Best';

-- Note: This migration preserves all existing bar IDs and user visit data
-- Users will see their existing visit history under the "Asia's 50 Best" tab
-- The new "World's 50 Best" tab will be the default view for new content
