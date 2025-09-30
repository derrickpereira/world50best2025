import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, Check, X } from 'lucide-react';
import { useBarStore } from '../../store/barStore';
import { useAuthStore } from '../../store/authStore';
import AuthModal from '../Auth/AuthModal';

const BarsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    bars,
    userVisits,
    loading,
    searchQuery,
    selectedRegion,
    fetchBars,
    fetchUserVisits,
    toggleBarVisit,
    setSearchQuery,
    setSelectedRegion,
    getFilteredBars,
    getVisitedCount,
    getVisitedPercentage,
  } = useBarStore();

  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchBars();
  }, [fetchBars]);

  useEffect(() => {
    fetchUserVisits();
  }, [fetchUserVisits]);

  const filteredBars = getFilteredBars();
  const visitedCount = getVisitedCount();
  const visitedPercentage = getVisitedPercentage();

  const handleToggleVisit = async (barId: string) => {
    await toggleBarVisit(barId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading bars...</p>
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
            <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">
              Bar Tracker
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center text-lg mb-6">
            Track your visits to World's finest bars
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-center text-sm mb-6">
            (The current list is a mix of 2025's 51-100 winners and 2024's Top 50, the final list will be updated after the awards)
          </p>

          {/* Region Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setSelectedRegion('world')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  selectedRegion === 'world'
                    ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>World's 50 Best</span>
              </button>
              <button
                onClick={() => setSelectedRegion('asia')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  selectedRegion === 'asia'
                    ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>Asia's 50 Best</span>
              </button>
            </div>
          </div>

          {/* Progress Stats */}
          {user && (
            <div className="bg-gray-100 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {visitedCount} / {bars.filter(bar => bar.region === selectedRegion).length}
                </div>
                <div className="text-gray-400">
                  {selectedRegion === 'world' ? "World's" : "Asia's"} 50 Best Bars Visited
                </div>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-rose-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${visitedPercentage}%` }}
                />
              </div>
              
              <div className="text-center text-sm text-gray-400">
                {visitedPercentage}% Complete
              </div>
            </div>
          )}
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search bars by name, city, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>

        {/* Bars Grid */}
        <motion.div
          layout
          className="grid gap-4"
        >
          {filteredBars.map((bar) => {
            const isVisited = userVisits[bar.id] || false;
            const rank = bar.rank_2025 || bar.rank_2024;
            
            return (
              <motion.div
                key={bar.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-900/80 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:border-red-500/50 dark:hover:border-red-500/30 ${
                  isVisited ? 'border-red-500 dark:border-red-500/50' : 'border-gray-200 dark:border-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                      rank && rank <= 10 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-black'
                        : rank && rank <= 25
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-black'
                        : 'bg-gradient-to-r from-red-800 to-red-900 text-white'
                    }`}>
                      {rank || '?'}
                    </div>

                    {/* Bar Info */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {bar.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <MapPin size={16} />
                          <span>{bar.city === bar.country ? bar.city : `${bar.city}, ${bar.country}`}</span>
                        </div>
                        {bar.rank_2024 && bar.rank_2025 && (
                          <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {bar.rank_2025 < bar.rank_2024 ? '↗' : '↘'} 
                            {' '}2024: #{bar.rank_2024} → 2025: #{bar.rank_2025}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visit Toggle */}
                  <button
                    onClick={() => handleToggleVisit(bar.id)}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                      isVisited
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white border border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {isVisited ? <Check size={20} /> : <Star size={20} />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredBars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No bars found matching your search.</p>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default BarsPage;
