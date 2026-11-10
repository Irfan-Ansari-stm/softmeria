import { create } from 'zustand';

export type ViewMode = 'split' | 'edit' | 'preview';
export type MobileTab = 'editor' | 'preview';

interface LayoutState {
  // Global drag state to disable CSS transitions during active resizing
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;

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
  setSidebarWidth: (width: number, persist?: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  resetSidebarWidth: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  setInspectorWidth: (width: number, persist?: boolean) => void;
  setInspectorCollapsed: (collapsed: boolean) => void;
  toggleInspectorCollapsed: () => void;
  resetInspectorWidth: () => void;
  setMobileInspectorOpen: (open: boolean) => void;
  toggleMobileInspector: () => void;

  setEditorSplitRatio: (ratio: number, persist?: boolean) => void;
  resetEditorSplitRatio: () => void;
  setViewMode: (mode: ViewMode) => void;
  setMobileTab: (tab: MobileTab) => void;

  commitLayout: () => void;
  initLayout: () => void;
}

const STORAGE_KEY = 'devblueprint_layout_prefs';

// Panel A: Project Sidebar
const DEFAULT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 250;
const MAX_SIDEBAR_WIDTH = 420;

// Panel D: Right Inspector
const DEFAULT_INSPECTOR_WIDTH = 340;
const MIN_INSPECTOR_WIDTH = 280;
const MAX_INSPECTOR_WIDTH = 440;

// Panels B & C: Markdown Editor and Preview
const MIN_PANE_PIXEL_WIDTH = 320;
const DEFAULT_SPLIT_RATIO = 50;
const MIN_SPLIT_RATIO = 20;
const MAX_SPLIT_RATIO = 80;

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function getSavedLayout(): Record<string, any> | null {
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

function debouncedSaveLayout(data: Record<string, any>, delay = 200) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveLayout(data);
    saveTimeout = null;
  }, delay);
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  isResizing: false,
  setIsResizing: (isResizing: boolean) => set({ isResizing }),

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

    let initialSidebarWidth = DEFAULT_SIDEBAR_WIDTH;
    if (typeof saved.sidebarWidth === 'number' && !Number.isNaN(saved.sidebarWidth)) {
      initialSidebarWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, saved.sidebarWidth));
    }

    let initialInspectorWidth = DEFAULT_INSPECTOR_WIDTH;
    if (typeof saved.inspectorWidth === 'number' && !Number.isNaN(saved.inspectorWidth)) {
      initialInspectorWidth = Math.max(MIN_INSPECTOR_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, saved.inspectorWidth));
    }

    let initialSplitRatio = DEFAULT_SPLIT_RATIO;
    if (typeof saved.editorSplitRatio === 'number' && !Number.isNaN(saved.editorSplitRatio)) {
      initialSplitRatio = Math.max(MIN_SPLIT_RATIO, Math.min(MAX_SPLIT_RATIO, saved.editorSplitRatio));
    }

    set({
      sidebarWidth: initialSidebarWidth,
      isSidebarCollapsed: !!saved.isSidebarCollapsed,
      inspectorWidth: initialInspectorWidth,
      isInspectorCollapsed: !!saved.isInspectorCollapsed,
      editorSplitRatio: initialSplitRatio,
      viewMode:
        saved.viewMode === 'edit' || saved.viewMode === 'preview' || saved.viewMode === 'split'
          ? saved.viewMode
          : 'split'
    });
  },

  commitLayout: () => {
    const state = get();
    saveLayout({
      sidebarWidth: state.sidebarWidth,
      isSidebarCollapsed: state.isSidebarCollapsed,
      inspectorWidth: state.inspectorWidth,
      isInspectorCollapsed: state.isInspectorCollapsed,
      editorSplitRatio: state.editorSplitRatio,
      viewMode: state.viewMode
    });
  },

  setSidebarWidth: (width: number, persist = true) => {
    const clamped = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, Math.round(width)));
    set({ sidebarWidth: clamped });
    if (persist) {
      debouncedSaveLayout({ sidebarWidth: clamped });
    }
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

  setInspectorWidth: (width: number, persist = true) => {
    const clamped = Math.max(MIN_INSPECTOR_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, Math.round(width)));
    set({ inspectorWidth: clamped });
    if (persist) {
      debouncedSaveLayout({ inspectorWidth: clamped });
    }
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

  setEditorSplitRatio: (ratio: number, persist = true) => {
    const clamped = Math.max(MIN_SPLIT_RATIO, Math.min(MAX_SPLIT_RATIO, Number(ratio.toFixed(2))));
    set({ editorSplitRatio: clamped });
    if (persist) {
      debouncedSaveLayout({ editorSplitRatio: clamped });
    }
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
  MIN_PANE_PIXEL_WIDTH,
  DEFAULT_SPLIT_RATIO,
  MIN_SPLIT_RATIO,
  MAX_SPLIT_RATIO
};

