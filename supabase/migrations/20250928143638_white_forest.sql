/*
  # World's 50 Best Bars V2 Support - Hong Kong Event

  1. Schema Updates
    - Add latitude and longitude fields to events table
    - Update location constraint to include Hong Kong districts
    - Add event_version field to distinguish between Asia's 50 Best and World's 50 Best events
    
  2. Backward Compatibility
    - Existing events remain unchanged (Asia's 50 Best 2025)
    - New events will be marked as World's 50 Best 2024
    - User data (agenda, predictions, bar visits) remains intact
    
  3. New Features
    - Support for precise location coordinates
    - District-level location filtering for Hong Kong
*/

-- Add new columns to events table
DO $$
BEGIN
  -- Add latitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE events ADD COLUMN latitude decimal(10, 8);
  END IF;

  -- Add longitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE events ADD COLUMN longitude decimal(11, 8);
  END IF;

  -- Add event_version column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_version'
  ) THEN
    ALTER TABLE events ADD COLUMN event_version text DEFAULT 'asia_2025';
  END IF;

  -- Add event_year column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_year'
  ) THEN
    ALTER TABLE events ADD COLUMN event_year integer DEFAULT 2025;
  END IF;
END $$;

-- Update the location constraint to include Hong Kong districts
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_location_check;
ALTER TABLE events ADD CONSTRAINT events_location_check 
  CHECK ((location = ANY (ARRAY['Macau'::text, 'Hong Kong'::text, 'Central'::text, 'Sheung Wan'::text, 'Admiralty'::text, 'Kowloon'::text])));

-- Create index for event version filtering
CREATE INDEX IF NOT EXISTS events_event_version_idx ON events(event_version);
CREATE INDEX IF NOT EXISTS events_event_year_idx ON events(event_year);

-- Create index for location coordinates
CREATE INDEX IF NOT EXISTS events_coordinates_idx ON events(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Update existing events to have the Asia 2025 version marker
UPDATE events 
SET event_version = 'asia_2025', event_year = 2025 
WHERE event_version IS NULL OR event_version = 'asia_2025';