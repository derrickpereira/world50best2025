// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Check if Google Analytics is available
const isGAAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Track page views
export const trackPageView = (page_title: string, page_location?: string): void => {
  if (!isGAAvailable()) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) {
    console.warn('GA Measurement ID not configured');
    return;
  }
  
  try {
    window.gtag('config', measurementId, {
      page_title,
      page_location: page_location || window.location.href,
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  custom_parameters?: Record<string, any>
): void => {
  if (!isGAAvailable()) return;
  
  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...custom_parameters,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Specific tracking functions for common actions
export const trackUserAuth = (action: 'sign_in' | 'sign_up' | 'sign_out'): void => {
  trackEvent(action, 'authentication');
};

export const trackAgendaAction = (action: 'add_event' | 'remove_event', event_name?: string): void => {
  trackEvent(action, 'agenda', event_name);
};

export const trackBarAction = (action: 'mark_visited' | 'mark_unvisited', bar_name?: string): void => {
  trackEvent(action, 'bar_tracker', bar_name);
};

export const trackPrediction = (action: 'save_predictions', prediction_count?: number): void => {
  trackEvent(action, 'predictions', undefined, prediction_count);
};

export const trackSearch = (category: 'events' | 'bars', query: string): void => {
  trackEvent('search', category, query);
};

export const trackFilter = (category: 'events', filter_type: string, filter_value: string): void => {
  trackEvent('filter', category, `${filter_type}:${filter_value}`);
};

export const trackThemeChange = (theme: 'light' | 'dark'): void => {
  trackEvent('theme_change', 'ui', theme);
};

export const trackEventView = (event_name: string): void => {
  trackEvent('view_event_details', 'events', event_name);
};

export const trackExternalLink = (url: string, source: string): void => {
  trackEvent('click_external_link', 'engagement', source, undefined, { url });
};
