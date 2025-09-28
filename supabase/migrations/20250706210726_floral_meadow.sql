/*
  # Clear events table for complete re-seeding

  1. Purpose
    - Remove all existing events from the events table
    - This allows the seedDatabase function to run again and insert all events
    - Ensures we have the complete list of events from the provided data

  2. Security
    - Only affects the events table
    - User agenda items will be preserved (foreign key constraints will handle cleanup)
*/

-- Clear all events to allow complete re-seeding
TRUNCATE TABLE events RESTART IDENTITY CASCADE;