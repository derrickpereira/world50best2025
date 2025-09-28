/*
  # Admin RLS Policies for Analytics Access

  1. Security
    - Enable RLS policies for admin access to user_predictions and user_bar_visits
    - Only allow SELECT access for derrickpereira@gmail.com
    - Ensure data privacy for all other users

  2. Tables Affected
    - user_predictions: Allow admin to read all prediction data for analytics
    - user_bar_visits: Allow admin to read all visit data for analytics
*/

-- Create admin access policy for user_predictions
CREATE POLICY "Admin can read all predictions"
  ON user_predictions
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'derrickpereira@gmail.com');

-- Create admin access policy for user_bar_visits  
CREATE POLICY "Admin can read all bar visits"
  ON user_bar_visits
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'derrickpereira@gmail.com');