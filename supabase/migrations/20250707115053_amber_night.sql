/*
  # Create News and FAQ Tables

  1. New Tables
    - `news_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `published_at` (timestamp with time zone)
      - `icon_name` (text)
      - `order_index` (integer, unique)
    - `faq_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `order_index` (integer, unique)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for anonymous insert (for seeding)
*/

-- Create news_items table
CREATE TABLE IF NOT EXISTS news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  published_at timestamptz DEFAULT now(),
  icon_name text NOT NULL,
  order_index integer UNIQUE NOT NULL
);

-- Create faq_items table
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  order_index integer UNIQUE NOT NULL
);

-- Enable RLS
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "News items are viewable by everyone"
  ON news_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "FAQ items are viewable by everyone"
  ON faq_items
  FOR SELECT
  TO public
  USING (true);

-- Create policies for anonymous insert (for seeding)
CREATE POLICY "Allow anonymous insert for seeding news"
  ON news_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert for seeding faq"
  ON faq_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX news_items_order_idx ON news_items (order_index);
CREATE INDEX faq_items_order_idx ON faq_items (order_index);