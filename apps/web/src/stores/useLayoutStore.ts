import { create } from 'zustand';

export type ViewMode = 'split' | 'edit' | 'preview';
export type MobileTab = 'editor' | 'preview';

interface LayoutState {
  // Sidebar (Desktop / Tablet)
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;

  // Inspector (Right Panel)
  inspectorWidth: number;
  isInspectorCollapsed: boolean;
  isMobileInspectorOpen: boolean;

  // Workspace Split
  editorSplitRatio: number; // percentage (e.g. 50 = 50% editor, 50% preview)
  viewMode: ViewMode;
  mobileTab: MobileTab;

  // Actions
  setSidebarWidth: (width: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  resetSidebarWidth: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  setInspectorWidth: (width: number) => void;
  setInspectorCollapsed: (collapsed: boolean) => void;
  toggleInspectorCollapsed: () => void;
  resetInspectorWidth: () => void;
  setMobileInspectorOpen: (open: boolean) => void;
  toggleMobileInspector: () => void;

  setEditorSplitRatio: (ratio: number) => void;
  resetEditorSplitRatio: () => void;
  setViewMode: (mode: ViewMode) => void;
  setMobileTab: (tab: MobileTab) => void;

  initLayout: () => void;
}

const STORAGE_KEY = 'devblueprint_layout_prefs';

const DEFAULT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 420;

const DEFAULT_INSPECTOR_WIDTH = 340;
const MIN_INSPECTOR_WIDTH = 280;
const MAX_INSPECTOR_WIDTH = 440;

const DEFAULT_SPLIT_RATIO = 50;
const MIN_SPLIT_RATIO = 20;
const MAX_SPLIT_RATIO = 80;

function getSavedLayout() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLayout(data: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedLayout() || {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {
    // Ignore storage quota errors
  }
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,

  inspectorWidth: DEFAULT_INSPECTOR_WIDTH,
  isInspectorCollapsed: false,
  isMobileInspectorOpen: false,

  editorSplitRatio: DEFAULT_SPLIT_RATIO,
  viewMode: 'split',
  mobileTab: 'editor',

  initLayout: () => {
    const saved = getSavedLayout();
    if (!saved) return;

    set({
      sidebarWidth:
        typeof saved.sidebarWidth === 'number'
          ? Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, saved.sidebarWidth))
          : DEFAULT_SIDEBAR_WIDTH,
      isSidebarCollapsed: !!saved.isSidebarCollapsed,
      inspectorWidth:
        typeof saved.inspectorWidth === 'number'
          ? Math.max(MIN_INSPECTOR_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, saved.inspectorWidth))
          : DEFAULT_INSPECTOR_WIDTH,
      isInspectorCollapsed: !!saved.isInspectorCollapsed,
      editorSplitRatio:
        typeof saved.editorSplitRatio === 'number'
          ? Math.max(MIN_SPLIT_RATIO, Math.min(MAX_SPLIT_RATIO, saved.editorSplitRatio))
          : DEFAULT_SPLIT_RATIO,
      viewMode:
        saved.viewMode === 'edit' || saved.viewMode === 'preview' || saved.viewMode === 'split'
          ? saved.viewMode
          : 'split'
    });
  },

  setSidebarWidth: (width: number) => {
    const clamped = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width));
    set({ sidebarWidth: clamped });
    saveLayout({ sidebarWidth: clamped });
  },

  setSidebarCollapsed: (isSidebarCollapsed: boolean) => {
    set({ isSidebarCollapsed });
    saveLayout({ isSidebarCollapsed });
  },

  toggleSidebarCollapsed: () => {
    const next = !get().isSidebarCollapsed;
    set({ isSidebarCollapsed: next });
    saveLayout({ isSidebarCollapsed: next });
  },

  resetSidebarWidth: () => {
    set({ sidebarWidth: DEFAULT_SIDEBAR_WIDTH, isSidebarCollapsed: false });
    saveLayout({ sidebarWidth: DEFAULT_SIDEBAR_WIDTH, isSidebarCollapsed: false });
  },

  setMobileSidebarOpen: (isMobileSidebarOpen: boolean) => set({ isMobileSidebarOpen }),
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),

  setInspectorWidth: (width: number) => {
    const clamped = Math.max(MIN_INSPECTOR_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, width));
    set({ inspectorWidth: clamped });
    saveLayout({ inspectorWidth: clamped });
  },

  setInspectorCollapsed: (isInspectorCollapsed: boolean) => {
    set({ isInspectorCollapsed });
    saveLayout({ isInspectorCollapsed });
  },

  toggleInspectorCollapsed: () => {
    const next = !get().isInspectorCollapsed;
    set({ isInspectorCollapsed: next });
    saveLayout({ isInspectorCollapsed: next });
  },

  resetInspectorWidth: () => {
    set({ inspectorWidth: DEFAULT_INSPECTOR_WIDTH, isInspectorCollapsed: false });
    saveLayout({ inspectorWidth: DEFAULT_INSPECTOR_WIDTH, isInspectorCollapsed: false });
  },

  setMobileInspectorOpen: (isMobileInspectorOpen: boolean) => set({ isMobileInspectorOpen }),
  toggleMobileInspector: () =>
    set((state) => ({ isMobileInspectorOpen: !state.isMobileInspectorOpen })),

  setEditorSplitRatio: (ratio: number) => {
    const clamped = Math.max(MIN_SPLIT_RATIO, Math.min(MAX_SPLIT_RATIO, ratio));
    set({ editorSplitRatio: clamped });
    saveLayout({ editorSplitRatio: clamped });
  },

  resetEditorSplitRatio: () => {
    set({ editorSplitRatio: DEFAULT_SPLIT_RATIO });
    saveLayout({ editorSplitRatio: DEFAULT_SPLIT_RATIO });
  },

  setViewMode: (viewMode: ViewMode) => {
    set({ viewMode });
    saveLayout({ viewMode });
  },

  setMobileTab: (mobileTab: MobileTab) => set({ mobileTab })
}));

export {
  DEFAULT_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  DEFAULT_INSPECTOR_WIDTH,
  MIN_INSPECTOR_WIDTH,
  MAX_INSPECTOR_WIDTH,
  DEFAULT_SPLIT_RATIO,
  MIN_SPLIT_RATIO,
  MAX_SPLIT_RATIO
};

