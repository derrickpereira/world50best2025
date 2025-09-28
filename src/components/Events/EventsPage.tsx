import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useEventStore } from '../../store/eventStore';
import { useAuthStore } from '../../store/authStore';
import { Event } from '../../types';
import EventFilters from './EventFilters';
import EventCard from './EventCard';
import EventModal from './EventModal';
import AuthModal from '../Auth/AuthModal';

const EventsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    loading,
    sortBy,
    filterLocation,
    filterDate,
    searchQuery,
    userAgenda,
    fetchEvents,
    fetchUserAgenda,
    setSortBy,
    setFilterLocation,
    setFilterDate,
    setSearchQuery,
    addToAgenda,
    removeFromAgenda,
    getFilteredEvents,
  } = useEventStore();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [initialShowTimeSelectorForModal, setInitialShowTimeSelectorForModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (user) {
      fetchUserAgenda();
    }
  }, [user, fetchUserAgenda]);

  const filteredEvents = getFilteredEvents();

  const handleToggleAgenda = async (eventId: string, arrivalTime?: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (userAgenda[eventId] !== undefined) {
      await removeFromAgenda(eventId);
    } else {
      await addToAgenda(eventId, arrivalTime);
    }
  };

  const handleCardClick = (event: Event, openTimeSelector: boolean) => {
    setSelectedEvent(event);
    setInitialShowTimeSelectorForModal(openTimeSelector);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent text-3xl md:text-5xl">
              Asia's 50 Best Bars Event Planner
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
            July 11-16, 2025 • Macau & Hong Kong • 70+ Exclusive Events
          </p>
        </motion.div>

        <EventFilters
          sortBy={sortBy}
          filterLocation={filterLocation}
          filterDate={filterDate}
          searchQuery={searchQuery}
          onSortChange={setSortBy}
          onLocationChange={setFilterLocation}
          onDateChange={setFilterDate}
          onSearchChange={setSearchQuery}
        />

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No events found matching your criteria.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isInAgenda={userAgenda[event.id] !== undefined}
                onToggleAgenda={handleToggleAgenda}
                onCardClick={handleCardClick}
              />
            ))}
          </motion.div>
        )}
      </div>

      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        initialShowTimeSelector={initialShowTimeSelectorForModal}
        isInAgenda={selectedEvent ? userAgenda[selectedEvent.id] !== undefined : false}
        onClose={() => {
          setSelectedEvent(null);
          setInitialShowTimeSelectorForModal(false);
        }}
        onToggleAgenda={handleToggleAgenda}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default EventsPage;