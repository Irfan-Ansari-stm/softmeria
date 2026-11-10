import { create } from 'zustand';
import { api } from '../lib/api';
import { useThemeStore } from './useThemeStore';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  role?: string;
  logoUrl?: string | null;
  settings?: {
    themePreference?: string;
  } | null;
}

interface AuthState {
  user: User | null;
  workspaces: WorkspaceItem[];
  currentWorkspace: WorkspaceItem | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;

  setAuth: (user: User, token: string, workspaces: WorkspaceItem[]) => void;
  setUser: (user: User) => void;
  setCurrentWorkspace: (workspace: WorkspaceItem) => void;
  initAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  workspaces: [],
  currentWorkspace: null,
  isLoading: true,
  isAuthenticated: false,
  token: typeof window !== 'undefined' ? localStorage.getItem('devblueprint_token') : null,

  setAuth: (user, token, workspaces) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('devblueprint_token', token);
    }
    const current = workspaces[0] || null;
    if (current && typeof window !== 'undefined') {
      localStorage.setItem('devblueprint_active_workspace', JSON.stringify(current));
    }
    set({
      user,
      token,
      workspaces,
      currentWorkspace: current,
      isAuthenticated: true,
      isLoading: false
    });
  },

  setUser: (user) => {
    set({ user });
  },

  setCurrentWorkspace: (workspace) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('devblueprint_active_workspace', JSON.stringify(workspace));
    }
    set({ currentWorkspace: workspace });
  },

  initAuth: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem('devblueprint_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const res = await api.get<any>('/auth/me');
      if (res.success && res.data) {
        const u = res.data;
        const workspaces: WorkspaceItem[] = (u.workspaceMemberships || []).map((m: any) => ({
          id: m.workspace.id,
          name: m.workspace.name,
          slug: m.workspace.slug,
          logoUrl: m.workspace.logoUrl,
          role: m.role,
          settings: m.workspace.settings
        }));

        let activeWs: WorkspaceItem | null = null;
        const storedWs = localStorage.getItem('devblueprint_active_workspace');
        if (storedWs) {
          try {
            const parsed = JSON.parse(storedWs);
            activeWs = workspaces.find((w) => w.id === parsed.id) || workspaces[0] || null;
          } catch {
            activeWs = workspaces[0] || null;
          }
        } else {
          activeWs = workspaces[0] || null;
        }

        if (activeWs?.settings?.themePreference) {
          useThemeStore.getState().syncWithWorkspace(activeWs.settings.themePreference);
        }

        set({
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            avatarUrl: u.avatarUrl
          },
          workspaces,
          currentWorkspace: activeWs,
          isAuthenticated: true,
          token,
          isLoading: false
        });
      } else {
        localStorage.removeItem('devblueprint_token');
        set({ isLoading: false, isAuthenticated: false, user: null, token: null });
      }
    } catch {
      localStorage.removeItem('devblueprint_token');
      set({ isLoading: false, isAuthenticated: false, user: null, token: null });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devblueprint_token');
      localStorage.removeItem('devblueprint_active_workspace');
    }
    set({
      user: null,
      token: null,
      workspaces: [],
      currentWorkspace: null,
      isAuthenticated: false,
      isLoading: false
    });
  }
}));

