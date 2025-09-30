import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, Star } from 'lucide-react';
import { useBarStore } from '../../store/barStore';
import { useAuthStore } from '../../store/authStore';
import { Bar } from '../../types';
import AuthModal from '../Auth/AuthModal';

const PredictionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    bars,
    predictions,
    fetchBars,
    fetchPredictions,
    updatePredictions,
    getPredictionBars,
  } = useBarStore();

  const [selectedBars, setSelectedBars] = useState<Bar[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchBars();
  }, [fetchBars]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  useEffect(() => {
    if (predictions.length > 0 && bars.length > 0) {
      const predictionBars = predictions
        .map(id => bars.find(bar => bar.id === id))
        .filter(Boolean) as Bar[];
      setSelectedBars(predictionBars);
      setIsSaved(true);
    }
  }, [predictions, bars]);

  // Get only World's 50 Best bars for predictions
  const predictionBars = getPredictionBars();
  
  const availableBars = predictionBars.filter(bar => 
    !selectedBars.some(selected => selected.id === bar.id) &&
    (searchQuery === '' || 
     bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     bar.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddBar = (bar: Bar) => {
    if (selectedBars.length < 5) {
      const newSelection = [...selectedBars, bar];
      setSelectedBars(newSelection);
      setSearchQuery('');
      setIsSaved(false);
    }
  };

  const handleRemoveBar = (barId: string) => {
    const newSelection = selectedBars.filter(bar => bar.id !== barId);
    setSelectedBars(newSelection);
    setIsSaved(false);
  };

  const handleReorderBars = (fromIndex: number, toIndex: number) => {
    const newSelection = [...selectedBars];
    const [movedBar] = newSelection.splice(fromIndex, 1);
    newSelection.splice(toIndex, 0, movedBar);
    setSelectedBars(newSelection);
  };

  const handleSavePredictions = async () => {
    if (selectedBars.length > 0) {
      await updatePredictions(selectedBars.map(bar => bar.id));
      setIsSaved(true);
    }
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
              Top 5 Predictions
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
            Predict which bars will claim the top 5 spots in The World's 50 Best Bars 2025
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-center text-sm mt-2">
            Choose from the world's finest bars competing for the top rankings
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Predictions List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Trophy className="mr-3 text-red-600 dark:text-red-400" size={24} />
              Your Top 5 Predictions
            </h2>

            <div className="space-y-4 mb-6">
              {Array.from({ length: 5 }, (_, index) => {
                const bar = selectedBars[index];
                const position = index + 1;

                return (
                  <motion.div
                    key={`position-${position}`}
                    layout
                    className={`bg-white dark:bg-gray-900/80 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 ${
                      bar ? 'border-red-500 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700/50 border-dashed'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Position Number */}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                        position === 1 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                          : position === 2
                          ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black'
                          : position === 3
                          ? 'bg-gradient-to-r from-red-600 to-red-800 text-white'
                          : 'bg-gradient-to-r from-gray-600 to-gray-800 text-white'
                      }`}>
                        {position}
                      </div>

                      {bar ? (
                        <>
                          {/* Bar Info */}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{bar.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{bar.city}, {bar.country}</p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveBar(bar.id)}
                            className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 text-center text-gray-500 dark:text-gray-500">
                          <p>Select a bar for position #{position}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSavePredictions}
              disabled={selectedBars.length === 0 || isSaved}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedBars.length > 0 && !isSaved
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedBars.length === 0 
                ? 'Select at least 1 bar to save predictions'
                : isSaved 
                  ? `${selectedBars.length} Prediction${selectedBars.length !== 1 ? 's' : ''} Saved`
                  : `Save ${selectedBars.length} Prediction${selectedBars.length !== 1 ? 's' : ''}`
              }
            </button>
          </div>

          {/* Bar Selection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Star className="mr-3 text-red-600 dark:text-red-400" size={24} />
              Select from World's 50 Best
            </h2>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search bars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>

            {/* Available Bars */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {predictionBars.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <Star size={48} className="mx-auto mb-4 opacity-50" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                    World's 50 Best Bars Coming Soon!
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">
                    The World's 50 Best bars will be available for predictions once they're added to the database.
                  </p>
                </div>
              ) : availableBars.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No bars found matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                availableBars.slice(0, 50).map((bar) => (
                  <motion.button
                    key={bar.id}
                    layout
                    onClick={() => handleAddBar(bar)}
                    disabled={selectedBars.length >= 5}
                    className={`w-full text-left p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-lg transition-all duration-200 ${
                      selectedBars.length < 5
                        ? 'hover:border-red-500/50 dark:hover:border-red-500/30 hover:bg-gray-200 dark:hover:bg-gray-800/50'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{bar.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{bar.city}, {bar.country}</p>
                      </div>
                      {(bar.rank_2024 || bar.rank_2025) && (
                        <div className="text-red-600 dark:text-red-400 text-sm">
                          #{bar.rank_2025 || bar.rank_2024}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsPage;
