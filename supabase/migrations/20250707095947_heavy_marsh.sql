/*
  # Add time range and arrival time fields

  1. Schema Changes
    - Add `time_range_display` column to `events` table for full time descriptions
    - Add `arrival_time` column to `user_agenda` table for user's chosen arrival time

  2. Data Migration
    - Populate `time_range_display` with appropriate values based on existing data
*/

-- Add time_range_display column to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'time_range_display'
  ) THEN
    ALTER TABLE events ADD COLUMN time_range_display text;
  END IF;
END $$;

-- Add arrival_time column to user_agenda table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_agenda' AND column_name = 'arrival_time'
  ) THEN
    ALTER TABLE user_agenda ADD COLUMN arrival_time text;
  END IF;
END $$;