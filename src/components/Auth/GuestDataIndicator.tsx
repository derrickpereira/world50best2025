import React from 'react';
import { Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface GuestDataIndicatorProps {
  itemCount: number;
  itemType: 'events' | 'predictions' | 'bars';
  onSignUpClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const GuestDataIndicator: React.FC<GuestDataIndicatorProps> = ({
  itemCount,
  itemType,
  onSignUpClick,
  className = '',
  size = 'medium'
}) => {
  if (itemCount === 0) return null;

  const getItemLabel = () => {
    switch (itemType) {
      case 'events': return itemCount === 1 ? 'event' : 'events';
      case 'predictions': return itemCount === 1 ? 'prediction' : 'predictions';
      case 'bars': return itemCount === 1 ? 'bar visit' : 'bar visits';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'text-xs px-2 py-1';
      case 'large': return 'text-sm px-4 py-3';
      default: return 'text-xs px-3 py-2';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg ${getSizeClasses()} ${className}`}
    >
      <CloudOff size={size === 'small' ? 12 : 14} className="text-amber-600 dark:text-amber-400" />
      <span className="text-amber-700 dark:text-amber-300 font-medium">
        {itemCount} {getItemLabel()} saved locally
      </span>
      {onSignUpClick && (
        <>
          <span className="text-amber-500 dark:text-amber-400">•</span>
          <button
            onClick={onSignUpClick}
            className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 underline font-medium"
          >
            Sign up to sync
          </button>
        </>
      )}
    </motion.div>
  );
};

export default GuestDataIndicator;
