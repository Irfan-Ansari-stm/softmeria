import { create } from 'zustand';

export type FavoriteType = 'project' | 'document' | 'board' | 'report' | 'roadmap';
export type RecentType = 'project' | 'task' | 'document' | 'board';

export interface FavoriteItem {
  id: string;
  title: string;
  type: FavoriteType;
  href: string;
  color?: string;
  projectId?: string;
}

export interface RecentItem {
  id: string;
  title: string;
  type: RecentType;
  href: string;
  visitedAt: number;
  color?: string;
}

interface NavigationState {
  // Collapsed / Expanded Navigation Groups
  expandedGroups: Record<string, boolean>;
  toggleGroup: (groupKey: string) => void;
  setGroupExpanded: (groupKey: string, expanded: boolean) => void;

  // Favorites
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  reorderFavorites: (fromIndex: number, toIndex: number) => void;
  isFavorite: (href: string) => boolean;

  // Recent Items
  recentItems: RecentItem[];
  addRecentItem: (item: Omit<RecentItem, 'visitedAt'>) => void;
  clearRecentItems: () => void;

  // Modals
  isQuickCreateOpen: boolean;
  setQuickCreateOpen: (open: boolean) => void;
  isCreateWorkspaceOpen: boolean;
  setCreateWorkspaceOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;

  // Project navigation subview
  projectNavMode: 'project' | 'global';
  setProjectNavMode: (mode: 'project' | 'global') => void;

  initNavigation: (workspaceId?: string) => void;
}

const DEFAULT_EXPANDED_GROUPS: Record<string, boolean> = {
  favorites: true,
  recent: true,
  workspace: true,
  projectManagement: true,
  execution: true,
  engineering: false,
  collaboration: false,
  insights: false,
  administration: false
};

const DEFAULT_FAVORITES: FavoriteItem[] = [
  {
    id: 'fav-fpo',
    title: 'FinTech Payment Orchestrator',
    type: 'project',
    href: '/projects/3ed8c194-f44d-475a-bde1-67dcc210d955',
    color: '#10B981'
  },
  {
    id: 'fav-bsp',
    title: 'Blank Scratchpad Project',
    type: 'project',
    href: '/projects/9d8ee1fa-f2e3-48d6-93d5-fa419106b707',
    color: '#3B82F6'
  },
  {
    id: 'fav-board',
    title: 'Payment Switch Sprint Board',
    type: 'board',
    href: '/projects/3ed8c194-f44d-475a-bde1-67dcc210d955?tab=board',
    color: '#10B981'
  },
  {
    id: 'fav-reports',
    title: 'Velocity & Defect Reports',
    type: 'report',
    href: '/reports',
    color: '#8B5CF6'
  }
];

const DEFAULT_RECENT_ITEMS: RecentItem[] = [
  {
    id: 'rec-fpo',
    title: 'FinTech Payment Orchestrator',
    type: 'project',
    href: '/projects/3ed8c194-f44d-475a-bde1-67dcc210d955',
    visitedAt: Date.now() - 1000 * 60 * 12,
    color: '#10B981'
  },
  {
    id: 'rec-mmp',
    title: 'Minimal Microservice Project',
    type: 'project',
    href: '/projects/b31b21d1-5ac7-4ebc-b2b5-d08ecfd440be',
    visitedAt: Date.now() - 1000 * 60 * 45,
    color: '#8B5CF6'
  },
  {
    id: 'rec-task',
    title: 'FPO-101 Payment Gateway Router',
    type: 'task',
    href: '/projects/3ed8c194-f44d-475a-bde1-67dcc210d955?tab=tasks',
    visitedAt: Date.now() - 1000 * 60 * 90
  }
];

export const useNavigationStore = create<NavigationState>((set, get) => ({
  expandedGroups: DEFAULT_EXPANDED_GROUPS,
  favorites: DEFAULT_FAVORITES,
  recentItems: DEFAULT_RECENT_ITEMS,
  isQuickCreateOpen: false,
  setQuickCreateOpen: (open) => set({ isQuickCreateOpen: open }),
  isCreateWorkspaceOpen: false,
  setCreateWorkspaceOpen: (open) => set({ isCreateWorkspaceOpen: open }),
  isGlobalSearchOpen: false,
  setGlobalSearchOpen: (open) => set({ isGlobalSearchOpen: open }),
  projectNavMode: 'project',
  setProjectNavMode: (mode) => set({ projectNavMode: mode }),

  initNavigation: (workspaceId = 'default') => {
    if (typeof window === 'undefined') return;

    try {
      // 1. Expanded groups
      const savedGroups = localStorage.getItem(`devblueprint_groups_${workspaceId}`);
      if (savedGroups) {
        set({ expandedGroups: { ...DEFAULT_EXPANDED_GROUPS, ...JSON.parse(savedGroups) } });
      }

      // 2. Favorites
      const savedFavs = localStorage.getItem(`devblueprint_favorites_${workspaceId}`);
      if (savedFavs) {
        set({ favorites: JSON.parse(savedFavs) });
      }

      // 3. Recent items
      const savedRecent = localStorage.getItem(`devblueprint_recent_${workspaceId}`);
      if (savedRecent) {
        set({ recentItems: JSON.parse(savedRecent) });
      }
    } catch (e) {
      console.error('Failed to load navigation preferences:', e);
    }
  },

  toggleGroup: (groupKey) => {
    set((state) => {
      const next = {
        ...state.expandedGroups,
        [groupKey]: !state.expandedGroups[groupKey]
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('devblueprint_groups_default', JSON.stringify(next));
      }
      return { expandedGroups: next };
    });
  },

  setGroupExpanded: (groupKey, expanded) => {
    set((state) => {
      const next = {
        ...state.expandedGroups,
        [groupKey]: expanded
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('devblueprint_groups_default', JSON.stringify(next));
      }
      return { expandedGroups: next };
    });
  },

  addFavorite: (item) => {
    set((state) => {
      if (state.favorites.some((f) => f.href === item.href)) return state;
      const next = [item, ...state.favorites];
      if (typeof window !== 'undefined') {
        localStorage.setItem('devblueprint_favorites_default', JSON.stringify(next));
      }
      return { favorites: next };
    });
  },

  removeFavorite: (id) => {
    set((state) => {
      const next = state.favorites.filter((f) => f.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('devblueprint_favorites_default', JSON.stringify(next));
      }
      return { favorites: next };
    });
  },

  reorderFavorites: (fromIndex, toIndex) => {
    set((state) => {
      const list = [...state.favorites];
      const [removed] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, removed);
      if (typeof window !== 'undefined') {
        localStorage.setItem('devblueprint_favorites_default', JSON.stringify(list));
      }
      return { favorites: list };
    });
  },

  isFavorite: (href) => {
    return get().favorites.some((f) => f.href === href);
  },

  addRecentItem: (item) => {
    set((state) => {
      const filtered = state.recentItems.filter((r) => r.href !== item.href);
      const next = [{ ...item, visitedAt: Date.now() }, ...filtered].slice(0, 7);
      if (typeof window !== 'undefined') {
        localStorage.setItem('devblueprint_recent_default', JSON.stringify(next));
      }
      return { recentItems: next };
    });
  },

  clearRecentItems: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devblueprint_recent_default');
    }
    set({ recentItems: [] });
  }
}));
