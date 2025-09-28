/*
  # World's 50 Best Bars 2025 Events Migration

  1. New Events
    - Insert World's 50 Best Bars events with event_version = 'world_2025'
    - Include latitude/longitude coordinates for map functionality
    - Set proper dates for October 4-10, 2025

  2. Data Updates
    - All new events will have event_version = 'world_2025'
    - Existing events remain as 'asia_2025'
    - Coordinates included for Google Maps integration
*/

-- Insert World's 50 Best Bars events
INSERT INTO events (name, date, time, time_range_display, venue, hotel, location, image_url, description, feature_bar, info_link, latitude, longitude, event_version)
VALUES 
  (
    'Signature Sessions: Pan-American Party',
    '2025-10-04',
    '17:00',
    '5pm-9pm',
    'Honky Tonks Tavern',
    NULL,
    'Central',
    'https://imagedelivery.net/y2gc2AQWv5Cg-1Y3N7mCcg/f4328f68-aae5-4df3-e527-5821c4619800/Asia',
    'A fun-fuelled transcontinental takeover serving craveable crowd-pleasers from Denver''s Yacht Club (17:00-19:00) and Tres Monos from Buenos Aires (19:00-21:00).',
    '',
    'https://www.theworlds50best.com/bars/experiences.html',
    22.2835429764713,
    114.152757382376,
    'world_2025'
  ),
  (
    'Peter Kwok x Red Sugar',
    '2025-10-04',
    '20:00',
    '8pm-11pm',
    'Red Sugar',
    NULL,
    'Kowloon',
    'https://imagedelivery.net/y2gc2AQWv5Cg-1Y3N7mCcg/d5055a30-e229-404f-0569-92da742caf00/Asia',
    'Prepare for a thrilling week of mixology as Red Sugar partners with outstanding bartenders to bring you a week of flowing cocktails.',
    '',
    '',
    22.3014280325976,
    114.188170595871,
    'world_2025'
  ),
  (
    'Mamba Negra x Duddells',
    '2025-10-09',
    '18:00',
    '6pm-10pm',
    'Duddells',
    NULL,
    'Central',
    'https://imagedelivery.net/y2gc2AQWv5Cg-1Y3N7mCcg/daedff7f-604b-415a-f2aa-9720f1507b00/Asia',
    'On 9 October, Duddell''s presents an exclusive cocktail collaboration, welcoming the acclaimed Medellín bar Mamba Negra, ranked #81 on The World''s 50 Best Bars 2025.',
    'Juan David Zapata, Jose Manjarres, Mario Calderone',
    'https://www.instagram.com/p/DPGC1N3DA6J/',
    22.2804062970028,
    114.157253124706,
    'world_2025'
  ),
  (
    'Penpals at Penicillin',
    '2025-10-07',
    '16:00',
    '4pm-6pm',
    'Penicillin Bar',
    NULL,
    'Central',
    '',
    'Hong Kong, what''s the rush? Join us for pre-feast libations at Penicillin, as Takuma Watanabe and Nicolas Torres take over for a couple of hours to warm you up - or cool you down.',
    'Takuma Watanabe, Nicolas Torres',
    'https://www.instagram.com/p/DPEldnJkVpW/',
    22.2823696502839,
    114.154062011212,
    'world_2025'
  ),
  (
    'Wax On x The Old Man',
    '2025-10-08',
    '23:00',
    '11pm till Sold Out',
    'The Old Man',
    NULL,
    'Central',
    'https://imagedelivery.net/y2gc2AQWv5Cg-1Y3N7mCcg/b9511cfa-73d6-4e08-3db8-58bf8bfbf300/Asia',
    'World''s 50 Best week keeps going, this time with Berlin''s Wax On joining us behind the bar. On Wednesday, October 8 from 11PM till sold out, Sam Orrock and Guste are closing up the night.',
    'Sam Orrock, Gustė Paliukaitė',
    'https://www.instagram.com/p/DPGt2apD_84/',
    22.28297766662,
    114.151739384223,
    'world_2025'
  ),
  (
    'LALA presents Joseph Haywood',
    '2025-10-09',
    '18:00',
    '6pm-9pm',
    'LALA',
    NULL,
    'Central',
    '',
    'As part of LALA''s Thirst-days in Paris series, Joseph Haywood brings his signature style and storytelling to LALA''s bar area, serving cocktails that echo the spirit of Singapore''s iconic Warehouse Hotel.',
    '',
    '',
    22.2828253433364,
    114.153754853541,
    'world_2025'
  ),
  (
    'The Best of All Worlds: ZLB23 x Mostly Harmless',
    '2025-10-07',
    '19:00',
    '7pm-8pm',
    'Mostly Harmless',
    NULL,
    'Sheung Wan',
    'https://imagedelivery.net/y2gc2AQWv5Cg-1Y3N7mCcg/bd87771c-7a61-4194-b342-fef1c2d47a00/Asia',
    'Rising to No.31 Asia''s 50 Best Bars 2025, ZLB23 has become a cornerstone of Bangalore and the region''s craft cocktail scene.',
    'Rajib Mukherjee (ZLB23)',
    'https://www.instagram.com/p/DO-eb5akbQJ/',
    22.2863034633114,
    114.146150682376,
    'world_2025'
  ),
  (
    'Penrose x Greenroom',
    '2025-10-07',
    '20:00',
    '8pm-11pm',
    'Greenroom',
    NULL,
    'Admiralty',
    '',
    'Join us for a special guest shift with founder Jon Lee, Brandon and Matthew as they bring Penrose signature cocktails from Malaysia''s Best Bar and No. 10 on Asia''s 50 Best Bars to Green Room.',
    'Jon Lee, Brandon Tan, Matthew Goh (Penrose)',
    'https://www.instagram.com/p/DPGQNF9Eqo5/',
    22.2780235395236,
    114.165360267035,
    'world_2025'
  ),
  (
    'The Iconic Takeover x Qura',
    '2025-10-07',
    '22:00',
    '10pm-2pm',
    'Qura',
    NULL,
    'Kowloon',
    'https://imagedelivery.net/y2gc2AQWv5Cg-1Y3N7mCcg/eb7d8ec7-2910-4cff-8aac-6e9430712e00/Asia',
    'An exclusive night at Qura Bar—on October 7, from 10pm to 2am—where three legendary mixologists from the World''s 50 Best Bars meet. Experience Martini Night with Giancarlo Mancino, Salvatore Calabrese, and Peter Dorelli.',
    'Giancarlo Mancino, Salvatore Calabrese, and Peter Dorelli',
    'https://www.instagram.com/p/DON2cquAuqm/',
    22.2935773174225,
    114.173951195871,
    'world_2025'
  ),
  (
    'Martini Social Club',
    '2025-10-08',
    '13:00',
    '1pm-4pm',
    'Darkside',
    NULL,
    'Kowloon',
    'https://imagedelivery.net/y2gc2AQWv5Cg-1Y3N7mCcg/5f6cba3a-414b-444c-1240-e3214f02e700/Asia',
    'Enjoy us for the ultimate Italian Takeover featuring the most renewed Italian bartenders! 5 champions, 5 delicious twists of the most iconic Italian Aperitivos.',
    'Benjamin Cavagna (1930), Stefano Catino (Maybe Sammy), Maura Milia, Marc Alvarez (Sips), Riccardo Rossi (Freni&Frizioni)',
    'https://www.thebestwithstgermain.com/events/martinisocialclub',
    22.2951649883851,
    114.175821224706,
    'world_2025'
  ),
  (
    'Bae''s x Gossip After Party',
    '2025-10-08',
    '23:00',
    '11pm-2am',
    'Gossip',
    NULL,
    'Central',
    '',
    'When the curtain falls on the World''s 50 Best, the real rhythm begins. On Oct 8th, from 11pm till late, Bae''s Cocktail Club Singapore takes over GOSSiP for a guest shift steeped in R&B, Hip-Hop, and whispered indulgence.',
    'Vijay Mudaliar, Boo Jing Heng and Arshvin Nayar',
    'https://www.thebestwithstgermain.com/events/unofficialafterparty',
    22.2826056883611,
    114.154006353541,
    'world_2025'
  );

-- Update news items for World's 50 Best Bars theme
INSERT INTO news_items (title, content, published_at, icon_name, order_index)
VALUES 
  (
    'The World''s 50 Best Bars 2025 in Hong Kong',
    'Join us for the most anticipated week in global hospitality as we celebrate The World''s 50 Best Bars 2025. Events will take place across Hong Kong from October 4-10.',
    '2025-09-15T10:00:00Z',
    'Trophy',
    1
  ),
  (
    'Event Schedule Released',
    'The complete schedule for The World''s 50 Best Bars 2025 week is now available. Over 70 exclusive events across Hong Kong districts from October 4-10.',
    '2025-09-10T14:30:00Z',
    'Calendar',
    2
  ),
  (
    'Hong Kong Districts Featured',
    'Events will be held at premium venues across Central, Sheung Wan, Admiralty, and Kowloon, featuring the world''s best cocktail talent.',
    '2025-09-08T09:15:00Z',
    'MapPin',
    3
  )
ON CONFLICT (title) DO UPDATE SET
  content = EXCLUDED.content,
  published_at = EXCLUDED.published_at,
  icon_name = EXCLUDED.icon_name,
  order_index = EXCLUDED.order_index;

-- Update FAQ items for World's 50 Best Bars theme  
INSERT INTO faq_items (title, content, order_index)
VALUES 
  (
    'How do I add events to my agenda?',
    'Simply browse the events page and click the "+" button on any event card. You''ll need to sign in to save events to your personal agenda.',
    1
  ),
  (
    'Can I track which bars I''ve visited?',
    'Yes! Use the Bar Tracker feature to mark bars you''ve visited. This helps you keep track of your progress through the world''s finest establishments.',
    2
  ),
  (
    'What are predictions for?',
    'Make your predictions for the top 5 bars before the ceremony. See how your predictions compare with the actual results!',
    3
  ),
  (
    'Are events free to attend?',
    'Event access varies by venue and event type. Some events may require reservations or have cover charges. Check individual event details for specific information.',
    4
  ),
  (
    'How do I get around Hong Kong during the event?',
    'Hong Kong has excellent public transportation including MTR, buses, and taxis. Most venues are easily accessible via public transport.',
    5
  )
ON CONFLICT (title) DO UPDATE SET
  content = EXCLUDED.content,
  order_index = EXCLUDED.order_index;
