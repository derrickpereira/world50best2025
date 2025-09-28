import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { PredictionAggregate } from '../../types';

interface PredictionStatsProps {
  predictions: PredictionAggregate[];
}

const PredictionStats: React.FC<PredictionStatsProps> = ({ predictions }) => {
  const maxCount = predictions[0]?.prediction_count || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Trophy className="text-amber-600 dark:text-amber-400" size={24} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Predicted Bars</h2>
      </div>

      {predictions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No prediction data available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {predictions.slice(0, 10).map((prediction, index) => (
            <motion.div
              key={prediction.bar_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white'
                  : 'bg-gradient-to-r from-gray-600 to-gray-800 text-white'
              }`}>
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {prediction.bar_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {prediction.city === prediction.country ? prediction.city : `${prediction.city}, ${prediction.country}`}
                  {prediction.rank_2025 && (
                    <span className="ml-2 text-amber-600 dark:text-amber-400">
                      #{prediction.rank_2025}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {prediction.prediction_count}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    prediction{prediction.prediction_count !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {/* Visual bar */}
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                    style={{ width: `${(prediction.prediction_count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {predictions.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing top 10 of {predictions.length} predicted bars
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PredictionStats;