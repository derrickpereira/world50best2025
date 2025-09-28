/*
  # Initial Database Schema for Asia's 50 Best Bars 2025

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `name` (text, event name)
      - `date` (date, event date)
      - `time` (text, event time)
      - `venue` (text, venue name)
      - `hotel` (text, hotel name, optional)
      - `location` (text, Macau or Hong Kong)
      - `image_url` (text, event image)
      - `description` (text, event description)
      - `feature_bar` (text, featured bar/bartender)
      - `info_link` (text, additional info link, optional)
      - `created_at` (timestamp)

    - `bars`
      - `id` (uuid, primary key)
      - `name` (text, bar name)
      - `rank_2024` (integer, 2024 ranking, optional)
      - `rank_2025` (integer, 2025 ranking, optional)
      - `city` (text, city name)
      - `country` (text, country name)

    - `user_agenda`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `event_id` (uuid, foreign key to events)
      - `added_at` (timestamp)

    - `user_bar_visits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `bar_id` (uuid, foreign key to bars)
      - `visited` (boolean, visit status)
      - `visited_at` (timestamp, optional)

    - `user_predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `prediction_json` (text, JSON array of bar IDs)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for events and bars
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  venue text NOT NULL,
  hotel text,
  location text NOT NULL CHECK (location IN ('Macau', 'Hong Kong')),
  image_url text NOT NULL,
  description text NOT NULL,
  feature_bar text NOT NULL,
  info_link text,
  created_at timestamptz DEFAULT now()
);

-- Create bars table
CREATE TABLE IF NOT EXISTS bars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rank_2024 integer,
  rank_2025 integer,
  city text NOT NULL,
  country text NOT NULL
);

-- Create user_agenda table
CREATE TABLE IF NOT EXISTS user_agenda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create user_bar_visits table
CREATE TABLE IF NOT EXISTS user_bar_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bar_id uuid NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  visited boolean DEFAULT false,
  visited_at timestamptz,
  UNIQUE(user_id, bar_id)
);

-- Create user_predictions table
CREATE TABLE IF NOT EXISTS user_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_json text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bar_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for events (public read)
CREATE POLICY "Events are viewable by everyone"
  ON events
  FOR SELECT
  TO public
  USING (true);

-- Create policies for bars (public read)
CREATE POLICY "Bars are viewable by everyone"
  ON bars
  FOR SELECT
  TO public
  USING (true);

-- Create policies for user_agenda
CREATE POLICY "Users can view own agenda"
  ON user_agenda
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agenda items"
  ON user_agenda
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own agenda items"
  ON user_agenda
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_bar_visits
CREATE POLICY "Users can view own bar visits"
  ON user_bar_visits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bar visits"
  ON user_bar_visits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bar visits"
  ON user_bar_visits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_predictions
CREATE POLICY "Users can view own predictions"
  ON user_predictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON user_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
  ON user_predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_location_idx ON events(location);
CREATE INDEX IF NOT EXISTS bars_rank_2025_idx ON bars(rank_2025);
CREATE INDEX IF NOT EXISTS bars_rank_2024_idx ON bars(rank_2024);
CREATE INDEX IF NOT EXISTS user_agenda_user_id_idx ON user_agenda(user_id);
CREATE INDEX IF NOT EXISTS user_bar_visits_user_id_idx ON user_bar_visits(user_id);
CREATE INDEX IF NOT EXISTS user_predictions_user_id_idx ON user_predictions(user_id);