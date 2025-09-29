import React from 'react';
import { MapPin, Clock, Calendar, Plus, Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Event } from '../../types';
import { trackExternalLink } from '../../utils/analytics';

interface EventCardProps {
  event: Event;
  isInAgenda: boolean;
  onToggleAgenda: (eventId: string, arrivalTime?: string) => void;
  onCardClick: (event: Event, openTimeSelector: boolean) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isInAgenda, 
  onToggleAgenda, 
  onCardClick 
}) => {
  // Handle TBA events
  const isTBA = !event.date || !event.time;
  const eventDate = event.date ? parseISO(event.date) : null;
  const formattedDate = eventDate ? format(eventDate, 'MMM dd') : 'TBA';
  const formattedDay = eventDate ? format(eventDate, 'EEEE') : 'Date TBC';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden hover:border-red-500/50 dark:hover:border-red-500/30 transition-all duration-300 cursor-pointer group"
      onClick={() => onCardClick(event, false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image_url}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Location Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
          event.location === 'Macau' 
            ? 'bg-emerald-500/90 text-white' 
            : 'bg-blue-500/90 text-white'
        }`}>
          {event.location}
        </div>

        {/* Add to Agenda Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isInAgenda) {
              // If already in agenda, remove it directly
              onToggleAgenda(event.id);
            } else {
              // If not in agenda, open the modal with time selector pre-activated
              onCardClick(event, true);
            }
          }}
          style={{ display: isTBA ? 'none' : 'block' }}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isInAgenda
              ? 'bg-red-500 text-black hover:bg-red-600'
              : 'bg-gray-200/80 dark:bg-black/50 text-gray-900 dark:text-white hover:bg-red-500 hover:text-white'
          }`}
          title={isInAgenda ? 'Remove from agenda' : 'Add to agenda'}
        >
          {isInAgenda ? <Check size={18} /> : <Plus size={18} />}
        </button>

        {/* Date & Time */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-2xl font-bold">{formattedDate}</div>
          <div className="text-sm opacity-90">{formattedDay}</div>
          {!isTBA && (
            <div className="flex items-center space-x-1 text-sm opacity-90 mt-1">
              <Clock size={14} />
              <span>{event.time_range_display || event.time}</span>
            </div>
          )}
          {isTBA && (
            <div className="text-sm opacity-90 mt-1">
              Time TBC
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {event.name}
        </h3>
        
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
          <MapPin size={16} />
          <span className="text-sm">
            {event.venue}
            {event.hotel && ` • ${event.hotel}`}
          </span>
        </div>

        <div className="text-red-600 dark:text-red-400 text-sm font-medium mb-3">
          Featuring: {event.feature_bar}
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4">
          {event.description}
        </p>
      </div>
    </motion.div>
  );
};

export default EventCard;
