import { create } from 'zustand';
import { api } from '../lib/api';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode, workspaceId?: string) => Promise<void>;
  toggleTheme: (workspaceId?: string) => Promise<void>;
  syncWithWorkspace: (themePreference?: string | null) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  initTheme: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('devblueprint_theme') as ThemeMode | null;
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
        set({ theme: 'dark' });
      } else {
        document.documentElement.classList.remove('dark');
        set({ theme: 'light' });
      }
    }
  },

  setTheme: async (theme: ThemeMode, workspaceId?: string) => {
    // 1. Update DOM immediately without reloading
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // 2. Persist locally for immediate subsequent visits
    if (typeof window !== 'undefined') {
      localStorage.setItem('devblueprint_theme', theme);
    }

    set({ theme });

    // 3. Persist to backend if workspaceId provided
    if (workspaceId) {
      try {
        await api.put(`/workspaces/${workspaceId}`, { themePreference: theme });
      } catch (err) {
        console.error('Failed to persist theme preference to backend:', err);
      }
    }
  },

  toggleTheme: async (workspaceId?: string) => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    await get().setTheme(nextTheme, workspaceId);
  },

  syncWithWorkspace: (themePreference?: string | null) => {
    if (themePreference === 'dark' || themePreference === 'light') {
      const currentLocal = typeof window !== 'undefined' ? localStorage.getItem('devblueprint_theme') : null;
      // Precedence: if no local preference exists yet, adopt workspace preference
      if (!currentLocal) {
        get().setTheme(themePreference as ThemeMode);
      } else {
        get().setTheme(currentLocal as ThemeMode);
      }
    }
  }
}));
