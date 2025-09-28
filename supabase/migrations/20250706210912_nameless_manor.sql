/*
  # Add seeding policies for events and bars tables

  1. Security Changes
    - Add INSERT policy for `events` table to allow anonymous users to seed data
    - Add INSERT policy for `bars` table to allow anonymous users to seed data
    
  2. Notes
    - These policies are specifically for seeding initial data
    - In production, you may want to restrict these policies or remove them after seeding
*/

-- Add INSERT policy for events table to allow seeding
CREATE POLICY "Allow anonymous insert for seeding events"
  ON events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add INSERT policy for bars table to allow seeding  
CREATE POLICY "Allow anonymous insert for seeding bars"
  ON bars
  FOR INSERT
  TO anon
  WITH CHECK (true);