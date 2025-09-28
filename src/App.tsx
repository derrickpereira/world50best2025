import React, { useEffect, useState } from 'react';
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

function App() {
  const { initialize, loading } = useAuthStore();
  const { initializeTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('events');

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

  // Track page views when tab changes
  useEffect(() => {
    const pageTitle = `World's 50 Best Bars 2025 - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;
    trackPageView(pageTitle);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'events':
        return <EventsPage />;
      case 'agenda':
        return <AgendaPage />;
      case 'news':
        return <NewsPage />;
      case 'bars':
        return <BarsPage />;
      case 'predict':
        return <PredictionsPage />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <EventsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
