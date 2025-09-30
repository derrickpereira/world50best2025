import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, MapPin, Star, Trophy, Target, User, Clock, ExternalLink } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useNewsStore } from '../../store/newsStore';

// Icon mapping for news items
const iconMap = {
  'Bell': Bell,
  'Calendar': Calendar,
  'MapPin': MapPin,
  'Star': Star,
  'Trophy': Trophy,
  'Target': Target,
  'User': User,
  'Clock': Clock,
  'ExternalLink': ExternalLink,
};

const NewsPage: React.FC = () => {
  const { newsItems, faqItems, loading, fetchAll } = useNewsStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading news and updates...</p>
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
              News & Updates
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
            Stay informed about World's 50 Best Bars 2025
          </p>
        </motion.div>

        {/* Latest News */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Bell className="mr-3 text-red-600 dark:text-red-400" size={24} />
            Latest News
          </h2>
          
          {newsItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No news items available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {newsItems.map((item, index) => {
                const IconComponent = iconMap[item.icon_name as keyof typeof iconMap] || Bell;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 hover:border-red-500/50 dark:hover:border-red-500/30 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 p-3 bg-red-500/20 rounded-lg">
                        <IconComponent className="text-red-600 dark:text-red-400" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {item.content}
                        </p>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(item.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Star className="mr-3 text-red-600 dark:text-red-400" size={24} />
            Frequently Asked Questions
          </h2>
          
          {faqItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No FAQ items available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-100 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden"
                >
                  <details className="group">
                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800/50 transition-colors">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-open:text-red-600 dark:group-open:text-red-400 transition-colors pr-4 flex-1">
                        {item.title}
                      </h3>
                      <div className="text-gray-600 dark:text-gray-400 group-open:text-red-600 dark:group-open:text-red-400 group-open:rotate-180 transition-all duration-200 flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </summary>
                    <div className="px-6 pb-6">
                      <div 
                        className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-a:text-red-600 dark:prose-a:text-red-400 prose-a:underline hover:prose-a:no-underline"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }}
                      />
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default NewsPage;
