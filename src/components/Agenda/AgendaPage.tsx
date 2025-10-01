import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trash2, User, CalendarPlus, Download } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { useEventStore } from '../../store/eventStore';
import { useAuthStore } from '../../store/authStore';
import { Event } from '../../types';
import AuthModal from '../Auth/AuthModal';
import EventModal from '../Events/EventModal';
import GuestDataIndicator from '../Auth/GuestDataIndicator';
import { openGoogleCalendarEvents, downloadICSFile, trackCalendarExport } from '../../utils/calendarExport';

const AgendaPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    events,
    userAgenda,
    fetchEvents,
    fetchUserAgenda,
    removeFromAgenda,
  } = useEventStore();

  const [selectedDate, setSelectedDate] = useState('2025-10-04');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchUserAgenda();
  }, [fetchUserAgenda]);

  const eventDates = [
    '2025-10-04',
    '2025-10-05',
    '2025-10-06',
    '2025-10-07',
    '2025-10-08',
    '2025-10-09',
  ];

  const agendaEvents = events.filter(event => userAgenda[event.id] !== undefined);
  const selectedDateEvents = agendaEvents.filter(event => 
    event.date && isSameDay(parseISO(event.date), parseISO(selectedDate))
  );

  const handleRemoveFromAgenda = async (eventId: string) => {
    await removeFromAgenda(eventId);
  };

  const handleToggleAgenda = async (eventId: string, arrivalTime?: string) => {
    // For agenda page, we only handle removal
    await handleRemoveFromAgenda(eventId);
  };

  const handleExportToGoogle = () => {
    if (agendaEvents.length === 0) return;
    
    openGoogleCalendarEvents(agendaEvents, userAgenda);
    trackCalendarExport('google', agendaEvents.length);
  };

  const handleExportToApple = () => {
    if (agendaEvents.length === 0) return;
    
    downloadICSFile(agendaEvents, userAgenda);
    trackCalendarExport('apple', agendaEvents.length);
  };

  const handleExportSingleEvent = (event: Event) => {
    openGoogleCalendarEvents([event], userAgenda);
    trackCalendarExport('google', 1);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">
              My Agenda
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
            Your personalized schedule for World's 50 Best Bars 2025
          </p>
          
          {/* Guest Data Indicator */}
          {!user && agendaEvents.length > 0 && (
            <div className="flex justify-center mt-4">
              <GuestDataIndicator 
                itemCount={agendaEvents.length}
                itemType="events"
                onSignUpClick={() => setShowAuthModal(true)}
              />
            </div>
          )}
        </motion.div>

        {/* Date Navigation - Compact Design */}
        <div className="mb-8">
          <div className="flex overflow-x-auto space-x-3 pb-4">
            {eventDates.map((date) => {
              const dateObj = parseISO(date);
              const dayName = format(dateObj, 'EEE');
              const dayNumber = format(dateObj, 'dd');
              const monthName = format(dateObj, 'MMM');
              const eventsCount = agendaEvents.filter(event => 
                event.date && isSameDay(parseISO(event.date), dateObj)
              ).length;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 w-20 p-3 rounded-xl border transition-all duration-200 ${
                    selectedDate === date
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700/50 hover:border-red-500/50 dark:hover:border-red-500/30'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium">{dayName}</div>
                    <div className="text-lg font-bold">{dayNumber} {monthName}</div>
                    {eventsCount > 0 && (
                      <div className={`text-xs mt-1 px-1.5 py-0.5 rounded-full ${
                        selectedDate === date
                          ? 'bg-white/20 text-white'
                          : 'bg-red-500/20 text-red-600 dark:text-red-400'
                      }`}>
                        {eventsCount} event{eventsCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Buttons */}
        {agendaEvents.length > 0 && (
          <div className="mb-6">
            <div className="bg-gray-100 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">
                Export Your Agenda
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleExportToGoogle}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  <CalendarPlus size={18} />
                  <span>Google Calendar</span>
                </button>
                <button
                  onClick={handleExportToApple}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  <CalendarPlus size={18} />
                  <span>Apple Calendar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events for Selected Date - Mobile Optimized */}
        <div className="space-y-3">
          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No events in your agenda for {format(parseISO(selectedDate), 'EEEE, MMMM dd')}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                Browse events and add them to your agenda to see them here
              </p>
            </div>
          ) : (
            selectedDateEvents
              .sort((a, b) => {
                const arrivalTimeA = userAgenda[a.id] || a.time || '';
                const arrivalTimeB = userAgenda[b.id] || b.time || '';
                return arrivalTimeA.localeCompare(arrivalTimeB);
              })
              .map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden hover:border-red-500/50 dark:hover:border-red-500/30 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 truncate">
                          {event.name}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Clock size={14} />
                            <span>{event.time_range_display || event.time}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <User size={14} />
                            <span>Your arrival: {userAgenda[event.id] || event.time}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin size={14} />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        </div>

                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 ${
                          event.location === 'Macau' 
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                          {event.location}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                        {/* Export Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportSingleEvent(event);
                          }}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Export to Calendar"
                        >
                          <CalendarPlus size={16} />
                        </button>
                        
                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromAgenda(event.id);
                          }}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Remove from agenda"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
          )}
        </div>

      </div>

      {/* Event Detail Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        initialShowTimeSelector={false}
        isInAgenda={selectedEvent ? userAgenda[selectedEvent.id] !== undefined : false}
        onClose={() => setSelectedEvent(null)}
        onToggleAgenda={handleToggleAgenda}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default AgendaPage;
