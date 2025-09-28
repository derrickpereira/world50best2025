/*
  # Add event_version column to events table

  1. Schema Changes
    - Add `event_version` column to existing `events` table
    - Set default value for existing records
    - Add index for better query performance
    - Update location constraint to include Hong Kong districts

  2. Data Migration
    - Set existing events to 'asia_2025' version
    - Prepare for new 'world_2024' events

  3. Performance
    - Add index on event_version for efficient filtering
*/

-- Add event_version column to existing events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_version'
  ) THEN
    ALTER TABLE events ADD COLUMN event_version text DEFAULT 'asia_2025';
  END IF;
END $$;

-- Update existing events to be marked as asia_2025 version
UPDATE events SET event_version = 'asia_2025' WHERE event_version IS NULL;

-- Make event_version NOT NULL after setting defaults
ALTER TABLE events ALTER COLUMN event_version SET NOT NULL;

-- Add latitude and longitude columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE events ADD COLUMN latitude numeric(10,8);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE events ADD COLUMN longitude numeric(11,8);
  END IF;
END $$;

-- Update location constraint to include Hong Kong districts
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'events' AND constraint_name = 'events_location_check'
  ) THEN
    ALTER TABLE events DROP CONSTRAINT events_location_check;
  END IF;
  
  -- Add new constraint with Hong Kong districts
  ALTER TABLE events ADD CONSTRAINT events_location_check 
    CHECK (location = ANY (ARRAY['Macau'::text, 'Hong Kong'::text, 'Central'::text, 'Sheung Wan'::text, 'Admiralty'::text, 'Kowloon'::text]));
END $$;

-- Add index on event_version for better query performance
CREATE INDEX IF NOT EXISTS events_event_version_idx ON events(event_version);

-- Add index on coordinates for map queries
CREATE INDEX IF NOT EXISTS events_coordinates_idx ON events(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;