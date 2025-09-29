import React, { useState } from 'react';
import { Calendar, Clock, Bell, Star, Target, User, LogOut, Sun, Moon, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import AuthModal from '../Auth/AuthModal';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user, signOut, isAdminUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const tabs = [
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'agenda', label: 'Agenda', icon: Clock },
    { id: 'news', label: 'News', icon: Bell },
    { id: 'bars', label: 'Bars', icon: Star },
    { id: 'predict', label: 'Predict', icon: Target },
  ];

  // Add admin tab if user is admin
  if (isAdminUser()) {
    tabs.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <>
      {/* Mobile Header Strip */}
      <div className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-red-500/50 dark:border-red-500/20 px-4 py-2 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* User Info / Auth */}
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <User size={16} />
                <span className="text-sm truncate max-w-32">{user.email}</span>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-red-500/50 dark:border-red-500/20 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <div className="flex space-x-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-red-500 text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <User size={20} />
              <span className="text-sm">{user.email}</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
        
        {/* Theme Toggle for non-authenticated users */}
        {!user && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-t border-red-500/50 dark:border-red-500/20 z-50">
        <div className="flex justify-around items-center py-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 transition-all duration-200 ${
                activeTab === id
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Navigation;
