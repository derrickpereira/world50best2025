import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackThemeChange } from '../utils/analytics';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        
        // Track theme change
        trackThemeChange(newTheme);
        
        // Update the HTML class
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      initializeTheme: () => {
        const { theme } = get();
        
        // Apply the theme to the HTML element
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);