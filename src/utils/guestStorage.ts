/**
 * Guest Mode Storage Utilities
 * Handles localStorage operations for unauthenticated users
 */

// Storage keys
const STORAGE_KEYS = {
  GUEST_AGENDA: 'world_50_best_guest_agenda',
  GUEST_BAR_VISITS: 'world_50_best_guest_bar_visits',
  GUEST_PREDICTIONS: 'world_50_best_guest_predictions',
  GUEST_SESSION_ID: 'world_50_best_guest_session_id',
} as const;

// Generate a unique session ID for the guest
export const generateGuestSessionId = (): string => {
  const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(STORAGE_KEYS.GUEST_SESSION_ID, sessionId);
  return sessionId;
};

export const getGuestSessionId = (): string => {
  let sessionId = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION_ID);
  if (!sessionId) {
    sessionId = generateGuestSessionId();
  }
  return sessionId;
};

// Guest Agenda Operations
export interface GuestAgendaItem {
  eventId: string;
  arrivalTime: string;
  addedAt: string;
}

export const getGuestAgenda = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GUEST_AGENDA);
    if (!stored) return {};
    
    const items: GuestAgendaItem[] = JSON.parse(stored);
    const agenda: Record<string, string> = {};
    
    items.forEach(item => {
      agenda[item.eventId] = item.arrivalTime;
    });
    
    return agenda;
  } catch (error) {
    console.error('Error loading guest agenda:', error);
    return {};
  }
};

export const saveGuestAgenda = (agenda: Record<string, string>): void => {
  try {
    const items: GuestAgendaItem[] = Object.entries(agenda).map(([eventId, arrivalTime]) => ({
      eventId,
      arrivalTime,
      addedAt: new Date().toISOString(),
    }));
    
    localStorage.setItem(STORAGE_KEYS.GUEST_AGENDA, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving guest agenda:', error);
  }
};

export const addToGuestAgenda = (eventId: string, arrivalTime: string): void => {
  const currentAgenda = getGuestAgenda();
  currentAgenda[eventId] = arrivalTime;
  saveGuestAgenda(currentAgenda);
};

export const removeFromGuestAgenda = (eventId: string): void => {
  const currentAgenda = getGuestAgenda();
  delete currentAgenda[eventId];
  saveGuestAgenda(currentAgenda);
};

// Guest Bar Visits Operations
export interface GuestBarVisit {
  barId: string;
  visited: boolean;
  visitedAt: string | null;
}

export const getGuestBarVisits = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GUEST_BAR_VISITS);
    if (!stored) return {};
    
    const visits: GuestBarVisit[] = JSON.parse(stored);
    const barVisits: Record<string, boolean> = {};
    
    visits.forEach(visit => {
      barVisits[visit.barId] = visit.visited;
    });
    
    return barVisits;
  } catch (error) {
    console.error('Error loading guest bar visits:', error);
    return {};
  }
};

export const saveGuestBarVisits = (visits: Record<string, boolean>): void => {
  try {
    const items: GuestBarVisit[] = Object.entries(visits).map(([barId, visited]) => ({
      barId,
      visited,
      visitedAt: visited ? new Date().toISOString() : null,
    }));
    
    localStorage.setItem(STORAGE_KEYS.GUEST_BAR_VISITS, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving guest bar visits:', error);
  }
};

export const toggleGuestBarVisit = (barId: string): boolean => {
  const currentVisits = getGuestBarVisits();
  const newVisitedState = !currentVisits[barId];
  currentVisits[barId] = newVisitedState;
  saveGuestBarVisits(currentVisits);
  return newVisitedState;
};

// Guest Predictions Operations
export const getGuestPredictions = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GUEST_PREDICTIONS);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    return data.predictions || [];
  } catch (error) {
    console.error('Error loading guest predictions:', error);
    return [];
  }
};

export const saveGuestPredictions = (predictions: string[]): void => {
  try {
    const data = {
      predictions,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEYS.GUEST_PREDICTIONS, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving guest predictions:', error);
  }
};

// Migration utilities for when user signs up
export interface GuestDataExport {
  sessionId: string;
  agenda: GuestAgendaItem[];
  barVisits: GuestBarVisit[];
  predictions: {
    predictions: string[];
    updatedAt: string;
  };
  exportedAt: string;
}

export const exportGuestData = (): GuestDataExport | null => {
  try {
    const agenda = localStorage.getItem(STORAGE_KEYS.GUEST_AGENDA);
    const barVisits = localStorage.getItem(STORAGE_KEYS.GUEST_BAR_VISITS);
    const predictions = localStorage.getItem(STORAGE_KEYS.GUEST_PREDICTIONS);
    const sessionId = getGuestSessionId();
    
    // Only export if there's actual data
    const hasData = (agenda && JSON.parse(agenda).length > 0) ||
                   (barVisits && JSON.parse(barVisits).length > 0) ||
                   (predictions && JSON.parse(predictions).predictions?.length > 0);
    
    if (!hasData) return null;
    
    return {
      sessionId,
      agenda: agenda ? JSON.parse(agenda) : [],
      barVisits: barVisits ? JSON.parse(barVisits) : [],
      predictions: predictions ? JSON.parse(predictions) : { predictions: [], updatedAt: new Date().toISOString() },
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exporting guest data:', error);
    return null;
  }
};

export const clearGuestData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
};

// Check if user has any guest data
export const hasGuestData = (): boolean => {
  const agenda = getGuestAgenda();
  const barVisits = getGuestBarVisits();
  const predictions = getGuestPredictions();
  
  return Object.keys(agenda).length > 0 || 
         Object.keys(barVisits).length > 0 || 
         predictions.length > 0;
};

// Get summary of guest data for UI display
export const getGuestDataSummary = () => {
  const agenda = getGuestAgenda();
  const barVisits = getGuestBarVisits();
  const predictions = getGuestPredictions();
  
  const visitedBars = Object.values(barVisits).filter(visited => visited).length;
  
  return {
    agendaCount: Object.keys(agenda).length,
    visitedBarsCount: visitedBars,
    predictionsCount: predictions.length,
    hasAnyData: Object.keys(agenda).length > 0 || visitedBars > 0 || predictions.length > 0,
  };
};
