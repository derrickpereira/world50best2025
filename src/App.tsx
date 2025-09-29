import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { seedDatabase, resetSeedingState } from './utils/seedDatabase';
import { trackPageView } from './utils/analytics';
import Navigation from './components/Layout/Navigation';
import EventsPage from './components/Events/EventsPage';
import AgendaPage from './components/Agenda/AgendaPage';
import NewsPage from './components/News/NewsPage';
import BarsPage from './components/Bars/BarsPage';
import PredictionsPage from './components/Predictions/PredictionsPage';
import AdminDashboard from './components/Admin/AdminDashboard';

// Inner component that has access to useLocation
const AppContent: React.FC = () => {
  const location = useLocation();

  // Track page views when location changes
  useEffect(() => {
    const path = location.pathname;
    let pageTitle = "World's 50 Best Bars 2025";
    
    if (path.startsWith('/event/')) {
      pageTitle += ' - Event Details';
    } else if (path === '/agenda') {
      pageTitle += ' - My Agenda';
    } else if (path === '/news') {
      pageTitle += ' - News & Updates';
    } else if (path === '/bars') {
      pageTitle += ' - Bar Directory';
    } else if (path === '/predict') {
      pageTitle += ' - Predictions';
    } else if (path === '/admin') {
      pageTitle += ' - Admin Dashboard';
    } else {
      pageTitle += ' - Events';
    }
    
    trackPageView(pageTitle);
  }, [location]);

  // Get current tab based on location
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.startsWith('/event/') || path === '/' || path === '') return 'events';
    if (path === '/agenda') return 'agenda';
    if (path === '/news') return 'news';
    if (path === '/bars') return 'bars';
    if (path === '/predict') return 'predict';
    if (path === '/admin') return 'admin';
    return 'events';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navigation activeTab={getCurrentTab()} />
      <main>
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/event/:eventId" element={<EventsPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/bars" element={<BarsPage />} />
          <Route path="/predict" element={<PredictionsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  const { initialize, loading } = useAuthStore();
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initialize();
    initializeTheme();
    // Reset seeding state in development and seed database
    if (import.meta.env.DEV) {
      resetSeedingState();
    }
    // Seed database with improved duplicate prevention
    setTimeout(() => seedDatabase(), 1000);
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
