export interface Event {
  id: string;
  name: string;
  date: string | null; // ISO format or null for TBA
  time: string | null; // HH:mm format or null for TBA
  time_range_display?: string; // Full time range description (e.g., "7pm till late")
  venue: string;
  hotel?: string;
  location: 'Macau' | 'Hong Kong' | 'Central' | 'Sheung Wan' | 'Admiralty' | 'Kowloon';
  image_url: string;
  description: string;
  feature_bar: string;
  info_link?: string;
  created_at?: string;
  latitude?: number;
  longitude?: number;
  event_version?: 'asia_2025' | 'world_2024';
  event_year?: number;
}

export interface Bar {
  id: string;
  name: string;
  rank_2024?: number;
  rank_2025?: number;
  city: string;
  country: string;
  visited_count?: number;
  is_predicted_top5?: boolean;
}

export interface UserAgenda {
  id: string;
  user_id: string;
  event_id: string;
  arrival_time?: string; // User's chosen arrival time
  arrival_time?: string; // User's chosen arrival time
  added_at: string;
}

export interface UserBarVisit {
  id: string;
  user_id: string;
  bar_id: string;
  visited: boolean;
  visited_at?: string;
}

export interface UserPrediction {
  id: string;
  user_id: string;
  prediction_json: string;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  published_at: string;
  icon_name: string;
  order_index: number;
}

export interface FaqItem {
  id: string;
  title: string;
  content: string;
  order_index: number;
}

export interface PredictionAggregate {
  bar_id: string;
  bar_name: string;
  prediction_count: number;
  rank_2025?: number;
  city: string;
  country: string;
}

export interface BarVisitAggregate {
  bar_id: string;
  bar_name: string;
  total_visits: number;
  rank_2025?: number;
  city: string;
  country: string;
}

export interface EventAgendaAggregate {
  event_id: string;
  event_name: string;
  total_users_added: number;
  date: string | null;
  time: string | null;
  location: 'Macau' | 'Hong Kong';
  venue: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export type SortOption = 'date' | 'name' | 'venue';
export type FilterLocation = 'all' | 'Macau' | 'Hong Kong' | 'Central' | 'Sheung Wan' | 'Admiralty' | 'Kowloon';