import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, List } from 'lucide-react';
import { useEventStore } from '../../store/eventStore';
import { useAuthStore } from '../../store/authStore';
import { Event } from '../../types';
import EventFilters from './EventFilters';
import EventCard from './EventCard';
import EventModal from './EventModal';
import MapView from './MapView';
import AuthModal from '../Auth/AuthModal';

const EventsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    events,
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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [eventNotFound, setEventNotFound] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (user) {
      fetchUserAgenda();
    }
  }, [user, fetchUserAgenda]);

  // Handle deep linking to specific events
  useEffect(() => {
    if (eventId && events.length > 0 && !loading) {
      const targetEvent = events.find(event => event.id === eventId);
      if (targetEvent) {
        setSelectedEvent(targetEvent);
        setInitialShowTimeSelectorForModal(false);
        setEventNotFound(false);
      } else {
        setEventNotFound(true);
        // Redirect to events page after 3 seconds if event not found
        setTimeout(() => {
          navigate('/');
          setEventNotFound(false);
        }, 3000);
      }
    }
  }, [eventId, events, loading, navigate]);

  // Update URL when modal closes (remove event ID from URL)
  const handleModalClose = () => {
    setSelectedEvent(null);
    setInitialShowTimeSelectorForModal(false);
    // If we came from a direct link, navigate back to events page
    if (eventId) {
      navigate('/', { replace: true });
    }
  };

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
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
            <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent text-3xl md:text-5xl">
              World's 50 Best Bars 2025
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
            October 4-9, 2025 • Hong Kong • {events.length} Exclusive Events
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

        {/* View Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List size={18} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Map size={18} />
              <span>Map</span>
            </button>
          </div>
        </div>

        {eventNotFound ? (
          <div className="text-center py-12">
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Event Not Found</h2>
              <p className="text-red-700 dark:text-red-300 mb-4">
                The event you're looking for doesn't exist or may have been removed.
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Redirecting to events page in a few seconds...
              </p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No events found matching your criteria.</p>
          </div>
        ) : viewMode === 'list' ? (
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
        ) : (
          <MapView 
            events={filteredEvents}
            onEventSelect={(event) => {
              setSelectedEvent(event);
              setInitialShowTimeSelectorForModal(false);
            }}
          />
        )}
      </div>

      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        initialShowTimeSelector={initialShowTimeSelectorForModal}
        isInAgenda={selectedEvent ? userAgenda[selectedEvent.id] !== undefined : false}
        onClose={handleModalClose}
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
