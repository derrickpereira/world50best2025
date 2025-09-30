import React from 'react';
import { Cloud, Star, Calendar, Target, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuestSignUpPromptProps {
  isVisible: boolean;
  onSignUpClick: () => void;
  onDismiss?: () => void;
  totalItems: number;
  trigger: 'agenda_items' | 'predictions_made' | 'bars_visited' | 'general';
  className?: string;
}

const GuestSignUpPrompt: React.FC<GuestSignUpPromptProps> = ({
  isVisible,
  onSignUpClick,
  onDismiss,
  totalItems,
  trigger,
  className = ''
}) => {
  const getPromptContent = () => {
    switch (trigger) {
      case 'agenda_items':
        return {
          icon: Calendar,
          title: "Don't lose your agenda!",
          description: `You have ${totalItems} events in your agenda. Sign up to access them from any device.`,
          buttonText: "Save my agenda"
        };
      case 'predictions_made':
        return {
          icon: Target,
          title: "Secure your predictions!",
          description: `You've made ${totalItems} predictions. Create an account to track your results.`,
          buttonText: "Save my predictions"
        };
      case 'bars_visited':
        return {
          icon: Star,
          title: "Track your bar journey!",
          description: `You've visited ${totalItems} bars. Sign up to keep your collection safe.`,
          buttonText: "Save my visits"
        };
      default:
        return {
          icon: Cloud,
          title: "Save your progress!",
          description: `You have ${totalItems} items saved locally. Create an account for cloud backup.`,
          buttonText: "Sign up now"
        };
    }
  };

  const content = getPromptContent();
  const Icon = content.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border border-red-200 dark:border-red-700/30 rounded-xl p-4 shadow-sm ${className}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/10 dark:bg-red-500/20 rounded-full flex items-center justify-center">
              <Icon size={20} className="text-red-600 dark:text-red-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {content.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {content.description}
              </p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onSignUpClick}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <span>{content.buttonText}</span>
                  <ArrowRight size={14} />
                </button>
                
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
                  >
                    Maybe later
                  </button>
                )}
              </div>
            </div>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuestSignUpPrompt;
