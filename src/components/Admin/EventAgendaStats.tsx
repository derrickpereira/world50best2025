import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Clock } from 'lucide-react';
import { EventAgendaAggregate } from '../../types';
import { format, parseISO } from 'date-fns';

interface EventAgendaStatsProps {
  eventStats: EventAgendaAggregate[];
}

const EventAgendaStats: React.FC<EventAgendaStatsProps> = ({ eventStats }) => {
  const maxUsers = eventStats[0]?.total_users_added || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="text-indigo-600 dark:text-indigo-400" size={24} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Most Popular Events</h2>
      </div>

      {eventStats.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No event agenda data available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventStats.slice(0, 10).map((event, index) => {
            const eventDate = event.date ? parseISO(event.date) : null;
            const formattedDate = eventDate ? format(eventDate, 'MMM dd') : 'TBA';
            
            return (
              <motion.div
                key={event.event_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
                  index === 0 
                    ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 text-white'
                    : index === 1
                    ? 'bg-gradient-to-r from-indigo-300 to-indigo-500 text-white'
                    : index === 2
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white'
                    : 'bg-gradient-to-r from-gray-600 to-gray-800 text-white'
                }`}>
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {event.event_name}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{formattedDate}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.location === 'Macau' 
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    }`}>
                      {event.location}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                    {event.venue}
                  </p>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {event.total_users_added}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      user{event.total_users_added !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Visual bar */}
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${(event.total_users_added / maxUsers) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {eventStats.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing top 10 of {eventStats.length} events with agenda additions
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default EventAgendaStats;