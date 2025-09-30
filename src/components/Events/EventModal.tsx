import React from 'react';
import { X, MapPin, Clock, Calendar, ExternalLink, Plus, Check, AlertCircle, Share, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Event } from '../../types';
import { generateArrivalTimeSlots } from '../../store/eventStore';
import { useEventStore } from '../../store/eventStore';
import { trackEventView } from '../../utils/analytics';
import { useState, useEffect } from 'react';

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  initialShowTimeSelector: boolean;
  isInAgenda: boolean;
  onClose: () => void;
  onToggleAgenda: (eventId: string, arrivalTime?: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  initialShowTimeSelector,
  isInAgenda,
  onClose,
  onToggleAgenda,
}) => {
  const { conflictMessage } = useEventStore();
  
  // Handle TBA events
  const isTBA = !event?.date || !event?.time;
  
  const [selectedArrivalTime, setSelectedArrivalTime] = useState<string>('');
  const [showTimeSelectorInternal, setShowTimeSelectorInternal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  // Generate available time slots for the event
  const availableTimeSlots = event ? generateArrivalTimeSlots(event) : [];
  
  // Format the event date
  const formattedDate = event && event.date ? format(parseISO(event.date), 'EEEE, MMMM d, yyyy') : 'Date to be confirmed';
  
  // Handle initial time selector state based on props
  useEffect(() => {
    if (!event || isTBA) return;
    
    // Track event view when modal opens
    if (isOpen) {
      trackEventView(event.name);
    }
    
    if (isOpen && initialShowTimeSelector && availableTimeSlots.length > 1 && !isInAgenda) {
      setShowTimeSelectorInternal(true);
      setSelectedArrivalTime(event.time);
    } else {
      setShowTimeSelectorInternal(false);
    }
    
    // Reset when modal closes
    if (!isOpen) {
      setShowTimeSelectorInternal(false);
    }
  }, [isOpen, initialShowTimeSelector, availableTimeSlots.length, isInAgenda, event?.time, isTBA]);
  
  if (!event) return null;

  const handleMainActionButtonClick = () => {
    if (isTBA) {
      // Do nothing for TBA events
      return;
    } else if (isInAgenda) {
      // Remove from agenda
      onToggleAgenda(event.id);
    } else if (showTimeSelectorInternal) {
      // Confirm the selected time
      handleConfirmTime();
    } else {
      // Show time selector or add directly
      if (availableTimeSlots.length > 1) {
        setShowTimeSelectorInternal(true);
        setSelectedArrivalTime(event.time); // Default to event start time
      } else {
        // Only one time slot, add directly
        onToggleAgenda(event.id, event.time);
      }
    }
  };
  
  const handleConfirmTime = () => {
    onToggleAgenda(event.id, selectedArrivalTime);
    setShowTimeSelectorInternal(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/event/${event.id}`;
    
    try {
      // Try using the Web Share API first (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: `${event.name} - World's 50 Best Bars 2025`,
          text: `Check out this exclusive bar event: ${event.name} featuring ${event.feature_bar}`,
          url: shareUrl,
        });
        return;
      }
      
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error('Share failed:', error);
      // Final fallback - try to copy to clipboard manually
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
    }
  };

  const handleGoogleMaps = () => {
    if (event.venue) {
      const searchQuery = `${event.venue} Hong Kong`;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-red-500/50 dark:border-red-500/20"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-200/80 dark:bg-black/50 rounded-full text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Share Success Message */}
            {shareSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-16 right-4 z-10 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
              >
                Link copied to clipboard!
              </motion.div>
            )}

            {/* Hero Image */}
            <div className="relative h-64 md:h-80">
              <img
                src={event.image_url}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Location Badge */}
              <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold ${
                event.location === 'Macau' 
                  ? 'bg-emerald-500/90 text-white' 
                  : 'bg-blue-500/90 text-white'
              }`}>
                {event.location}
              </div>

              {/* Event Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {event.name}
                </h1>
                <div className="flex items-center space-x-4 text-white/90 drop-shadow">
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>{formattedDate}</span>
                  </div>
                  {!isTBA && (
                    <div className="flex items-center space-x-2">
                      <Clock size={18} />
                      <span>{event.time_range_display || event.time}</span>
                    </div>
                  )}
                  {isTBA && (
                    <div className="flex items-center space-x-2">
                      <Clock size={18} />
                      <span>Time to be confirmed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Venue Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <MapPin size={20} className="text-red-600 dark:text-red-400" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{event.venue}</div>
                    {event.hotel && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{event.hotel}</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  {/* Time Selector */}
                  {showTimeSelectorInternal && !isInAgenda && !isTBA && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Choose your arrival time:
                      </h4>
                      <div className="flex items-center space-x-2 mb-3">
                        <select
                          value={selectedArrivalTime}
                          onChange={(e) => setSelectedArrivalTime(e.target.value)}
                          className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        >
                          {availableTimeSlots.map((timeSlot) => (
                            <option key={timeSlot} value={timeSlot}>
                              {timeSlot}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Event time: {event.time_range_display || `${event.time} onwards`}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleConfirmTime}
                          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowTimeSelectorInternal(false)}
                          className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Conflict Message */}
                  {conflictMessage && !isTBA && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3 flex items-start space-x-2">
                      <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-300">{conflictMessage}</p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    {/* Share and Maps Buttons Row */}
                    <div className="flex space-x-2">
                      {/* Share Button */}
                      <button
                        onClick={handleShare}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
                        title="Share this event"
                      >
                        <Share size={16} />
                        <span className="text-sm">Share</span>
                      </button>

                      {/* Google Maps Button - Only show if venue exists */}
                      {event.venue && (
                        <button
                          onClick={handleGoogleMaps}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
                          title="View on Google Maps"
                        >
                          <Map size={16} />
                          <span className="text-sm">Maps</span>
                        </button>
                      )}
                    </div>

                    {/* Add/Remove Button - Only show for non-TBA events */}
                    {!isTBA && (
                      <button
                        onClick={handleMainActionButtonClick}
                        className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          isInAgenda
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-red-500 hover:text-white border border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        {isInAgenda ? <Check size={20} /> : <Plus size={20} />}
                        <span>
                          {isInAgenda 
                            ? 'In Agenda' 
                            : showTimeSelectorInternal 
                              ? 'Confirm Arrival Time' 
                              : 'Add to Agenda'
                          }
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Featuring */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Featuring</h3>
                <p className="text-gray-900 dark:text-white">{event.feature_bar}</p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About This Event</h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>

              {/* Read More Link */}
              {event.info_link && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={event.info_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <ExternalLink size={18} />
                    <span>Read More Details</span>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EventModal;
