/*
  # Clear and repopulate events and bars data

  1. Data Cleanup
    - Clear all existing data from events and bars tables
    - Reset identity sequences to start fresh
    - Cascade deletions to dependent tables (user_agenda, user_bar_visits, user_predictions)

  2. Notes
    - This will remove all user-generated data (agendas, visits, predictions)
    - The application will automatically repopulate events and bars data on next load
    - User accounts and authentication data will remain intact
*/

-- Clear all data from events table and reset identity
TRUNCATE TABLE public.events RESTART IDENTITY CASCADE;

-- Clear all data from bars table and reset identity  
TRUNCATE TABLE public.bars RESTART IDENTITY CASCADE;