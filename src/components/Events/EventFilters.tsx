import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { SortOption, FilterLocation } from '../../types';

interface EventFiltersProps {
  sortBy: SortOption;
  filterLocation: FilterLocation;
  filterDate: string;
  searchQuery: string;
  onSortChange: (sort: SortOption) => void;
  onLocationChange: (location: FilterLocation) => void;
  onDateChange: (date: string) => void;
  onSearchChange: (query: string) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({
  sortBy,
  filterLocation,
  filterDate,
  searchQuery,
  onSortChange,
  onLocationChange,
  onDateChange,
  onSearchChange,
}) => {
  const eventDates = [
    { value: '', label: 'All Dates' },
    { value: '2025-10-04', label: 'October 4th' },
    { value: '2025-10-05', label: 'October 5th' },
    { value: '2025-10-06', label: 'October 6th' },
    { value: '2025-10-07', label: 'October 7th' },
    { value: '2025-10-08', label: 'October 8th' },
    { value: '2025-10-09', label: 'October 9th' },
    { value: '2025-10-10', label: 'October 10th' },
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 md:p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search events, venues, or bars..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
      </div>

      {/* Filters - Mobile Optimized Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Location Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <select
            value={filterLocation}
            onChange={(e) => onLocationChange(e.target.value as FilterLocation)}
            className="flex-1 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          >
            <option value="all">All Districts</option>
            <option value="Central">Central</option>
            <option value="Sheung Wan">Sheung Wan</option>
            <option value="Admiralty">Admiralty</option>
            <option value="Kowloon">Kowloon</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2">
          <Calendar size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <select
            value={filterDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="flex-1 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          >
            {eventDates.map((date) => (
              <option key={date.value} value={date.value}>
                {date.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="venue">Sort by Venue</option>
        </select>
      </div>
    </div>
  );
};

export default EventFilters;
