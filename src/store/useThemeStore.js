import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return 'dark';
  }
  return 'dark';
};

export const useThemeStore = create((set, get) => ({
  theme: 'dark',

  initializeTheme: () => {
    const theme = getInitialTheme();
    set({ theme });
    localStorage.setItem('theme', theme);
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    localStorage.setItem('theme', newTheme);
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
  },
}));

export default useThemeStore;
