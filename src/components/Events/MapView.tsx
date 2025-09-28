import React, { useEffect, useRef, useState } from 'react';
import { Event } from '../../types';
import EventModal from './EventModal';

interface MapViewProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
}

interface GoogleWindow extends Window {
  google: any;
  initMap: () => void;
}

declare const window: GoogleWindow;

const MapView: React.FC<MapViewProps> = ({ events, onEventSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hong Kong center coordinates
  const HONG_KONG_CENTER = {
    lat: 22.2783,
    lng: 114.1747
  };

  useEffect(() => {
    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=marker`;
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && window.google) {
      initializeMap();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (mapInstance.current && window.google) {
      updateMarkers();
    }
  }, [events, isLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: HONG_KONG_CENTER,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: getNightModeStyles(),
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER,
        style: window.google.maps.ZoomControlStyle.LARGE
      },
      scaleControl: true,
      rotateControl: true,
      gestureHandling: 'cooperative'
    });

    updateMarkers();
  };

  const getNightModeStyles = () => [
    // Water
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#1a2332' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#4e6d70' }]
    },
    // Landscape
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#263238' }]
    },
    {
      featureType: 'landscape.man_made',
      elementType: 'geometry',
      stylers: [{ color: '#334155' }]
    },
    // Roads
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#475569' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#64748b' }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#52525b' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca3af' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1f2937' }]
    },
    // Buildings
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#374151' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b7280' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1f2937' }]
    },
    // Administrative
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#4b5563' }]
    },
    {
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca3af' }]
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b7280' }]
    },
    // Transit
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#374151' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca3af' }]
    },
    // Hide less important POIs
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#1f2937' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b7280' }]
    }
  ];

  const updateMarkers = () => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // Create markers for events with coordinates
    const validEvents = events.filter(event => 
      event.latitude && event.longitude
    );

    validEvents.forEach((event, index) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: event.latitude!,
          lng: event.longitude!
        },
        map: mapInstance.current,
        title: event.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: getMarkerColor(event.location),
          fillOpacity: 0.9,
          strokeColor: '#1f2937', // Dark stroke for better visibility on dark theme
          strokeWeight: 3,
          scale: 12 // Larger size for better visibility
        }
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-gray-900 mb-1">${event.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${event.venue}</p>
            <p class="text-xs text-gray-500 mb-2">${event.location} • ${event.time_range_display || ''}</p>
            <button 
              onclick="window.viewEventDetails('${event.id}')" 
              class="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1 rounded transition-colors"
            >
              View Details
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close all other info windows
        markersRef.current.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        
        infoWindow.open(mapInstance.current, marker);
        
        if (onEventSelect) {
          onEventSelect(event);
        }
      });

      marker.infoWindow = infoWindow;
      markersRef.current.push(marker);
    });

    // Set up global event handler for "View Details" button
    (window as any).viewEventDetails = (eventId: string) => {
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
      }
    };
  };

  const getMarkerColor = (location: string): string => {
    const colors: Record<string, string> = {
      'Central': '#f59e0b',      // amber-500
      'Sheung Wan': '#10b981',   // emerald-500  
      'Admiralty': '#3b82f6',    // blue-500
      'Kowloon': '#ef4444'       // red-500
    };
    return colors[location] || '#6b7280'; // gray-500 as default
  };

  const getLocationStats = () => {
    const stats = events.reduce((acc, event) => {
      if (event.latitude && event.longitude) {
        acc[event.location] = (acc[event.location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([location, count]) => ({
      location,
      count,
      color: getMarkerColor(location)
    }));
  };

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Google Maps API key not configured</p>
          <p className="text-sm text-gray-400">Please add VITE_GOOGLE_MAPS_API_KEY to your environment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Event Locations</h3>
        <div className="flex flex-wrap gap-4">
          {getLocationStats().map(({ location, count, color }) => (
            <div key={location} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {location} ({count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div 
          ref={mapRef}
          className="w-full h-96"
          style={{ minHeight: '400px' }}
        >
          {!isLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        initialShowTimeSelector={false}
        isInAgenda={false}
        onClose={() => setSelectedEvent(null)}
        onToggleAgenda={() => {}}
      />
    </div>
  );
};

export default MapView;
