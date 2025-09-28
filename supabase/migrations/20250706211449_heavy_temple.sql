/*
  # Clear duplicates and ensure clean data

  1. Database Cleanup
    - Remove all existing events and bars data
    - Reset identity sequences
    - Clear all related user data

  2. Data Integrity
    - Ensure no duplicates exist
    - Reset auto-increment counters
*/

-- Clear all data and reset sequences
TRUNCATE TABLE public.events RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.bars RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_agenda RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_bar_visits RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_predictions RESTART IDENTITY CASCADE;

-- Ensure sequences are properly reset
ALTER SEQUENCE IF EXISTS events_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS bars_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_agenda_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_bar_visits_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_predictions_id_seq RESTART WITH 1;