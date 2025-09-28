import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Users, BarChart3, Trophy, MapPin, Calendar } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import PredictionStats from './PredictionStats';
import VisitStats from './VisitStats';
import EventAgendaStats from './EventAgendaStats';

const AdminDashboard: React.FC = () => {
  const { isAdminUser } = useAuthStore();
  const { loading, error, fetchAllAdminData, topPredictions, barVisitStats, eventAgendaStats } = useAdminStore();

  useEffect(() => {
    if (isAdminUser()) {
      fetchAllAdminData();
    }
  }, [isAdminUser, fetchAllAdminData]);

  // Redirect if not admin
  if (!isAdminUser()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <Shield size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this section.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <Shield size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalPredictions = topPredictions.reduce((sum, item) => sum + item.prediction_count, 0);
  const totalUniqueVisitors = barVisitStats.reduce((sum, item) => sum + item.total_visits, 0);
  const totalEventAdditions = eventAgendaStats.reduce((sum, item) => sum + item.total_users_added, 0);
  const mostPredictedBar = topPredictions[0];
  const mostVisitedBar = barVisitStats[0];
  const mostPopularEvent = eventAgendaStats[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
            Analytics and insights for Asia's 50 Best Bars 2025
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="text-amber-600 dark:text-amber-400" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Predictions</h3>
            </div>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{totalPredictions}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Across all users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unique Visitors</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalUniqueVisitors}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bar visits tracked</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="text-emerald-600 dark:text-emerald-400" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Predicted</h3>
            </div>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {mostPredictedBar?.bar_name || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mostPredictedBar?.prediction_count || 0} predictions
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <MapPin className="text-purple-600 dark:text-purple-400" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Visited</h3>
            </div>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">
              {mostVisitedBar?.bar_name || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mostVisitedBar?.total_visits || 0} unique visitors
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="text-indigo-600 dark:text-indigo-400" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Popular Event</h3>
            </div>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 truncate">
              {mostPopularEvent?.event_name || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mostPopularEvent?.total_users_added || 0} users added
            </p>
          </motion.div>
        </div>

        {/* Analytics Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <PredictionStats predictions={topPredictions} />
          <VisitStats visitStats={barVisitStats} />
          <EventAgendaStats eventStats={eventAgendaStats} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;