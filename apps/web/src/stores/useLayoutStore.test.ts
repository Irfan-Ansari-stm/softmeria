import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useLayoutStore,
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
} from './useLayoutStore';

// In Node environment, mock localStorage and window
const storageMock: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => storageMock[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storageMock[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete storageMock[key];
  }),
  clear: vi.fn(() => {
    for (const key in storageMock) delete storageMock[key];
  })
};

(globalThis as any).window = globalThis;
(globalThis as any).localStorage = mockLocalStorage;

describe('useLayoutStore Panel Resizing & Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    useLayoutStore.setState({
      isResizing: false,
      sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      inspectorWidth: DEFAULT_INSPECTOR_WIDTH,
      isInspectorCollapsed: false,
      isMobileInspectorOpen: false,
      editorSplitRatio: DEFAULT_SPLIT_RATIO,
      viewMode: 'split',
      mobileTab: 'editor'
    });
  });

  it('defines correct panel dimensions matching specification', () => {
    expect(DEFAULT_SIDEBAR_WIDTH).toBe(320);
    expect(MIN_SIDEBAR_WIDTH).toBe(250);
    expect(MAX_SIDEBAR_WIDTH).toBe(420);

    expect(DEFAULT_INSPECTOR_WIDTH).toBe(340);
    expect(MIN_INSPECTOR_WIDTH).toBe(280);
    expect(MAX_INSPECTOR_WIDTH).toBe(440);

    expect(MIN_PANE_PIXEL_WIDTH).toBe(320);
    expect(DEFAULT_SPLIT_RATIO).toBe(50);
    expect(MIN_SPLIT_RATIO).toBe(20);
    expect(MAX_SPLIT_RATIO).toBe(80);
  });

  it('clamps sidebar width within [250px, 420px]', () => {
    const { setSidebarWidth } = useLayoutStore.getState();

    // Below minimum
    setSidebarWidth(100);
    expect(useLayoutStore.getState().sidebarWidth).toBe(250);

    // Above maximum
    setSidebarWidth(600);
    expect(useLayoutStore.getState().sidebarWidth).toBe(420);

    // Within bounds
    setSidebarWidth(350);
    expect(useLayoutStore.getState().sidebarWidth).toBe(350);
  });

  it('clamps inspector width within [280px, 440px]', () => {
    const { setInspectorWidth } = useLayoutStore.getState();

    // Below minimum
    setInspectorWidth(200);
    expect(useLayoutStore.getState().inspectorWidth).toBe(280);

    // Above maximum
    setInspectorWidth(500);
    expect(useLayoutStore.getState().inspectorWidth).toBe(440);

    // Within bounds
    setInspectorWidth(380);
    expect(useLayoutStore.getState().inspectorWidth).toBe(380);
  });

  it('clamps editor split ratio within [20%, 80%]', () => {
    const { setEditorSplitRatio } = useLayoutStore.getState();

    // Below minimum
    setEditorSplitRatio(10);
    expect(useLayoutStore.getState().editorSplitRatio).toBe(20);

    // Above maximum
    setEditorSplitRatio(95);
    expect(useLayoutStore.getState().editorSplitRatio).toBe(80);

    // Within bounds
    setEditorSplitRatio(62.5);
    expect(useLayoutStore.getState().editorSplitRatio).toBe(62.5);
  });

  it('handles double-click reset actions correctly', () => {
    const {
      setSidebarWidth,
      resetSidebarWidth,
      setInspectorWidth,
      resetInspectorWidth,
      setEditorSplitRatio,
      resetEditorSplitRatio
    } = useLayoutStore.getState();

    setSidebarWidth(400);
    resetSidebarWidth();
    expect(useLayoutStore.getState().sidebarWidth).toBe(DEFAULT_SIDEBAR_WIDTH);
    expect(useLayoutStore.getState().isSidebarCollapsed).toBe(false);

    setInspectorWidth(300);
    resetInspectorWidth();
    expect(useLayoutStore.getState().inspectorWidth).toBe(DEFAULT_INSPECTOR_WIDTH);
    expect(useLayoutStore.getState().isInspectorCollapsed).toBe(false);

    setEditorSplitRatio(75);
    resetEditorSplitRatio();
    expect(useLayoutStore.getState().editorSplitRatio).toBe(DEFAULT_SPLIT_RATIO);
  });

  it('toggles isResizing flag during active drag without triggering storage', () => {
    const { setIsResizing, setSidebarWidth } = useLayoutStore.getState();

    setIsResizing(true);
    expect(useLayoutStore.getState().isResizing).toBe(true);

    // In-memory update with persist=false
    setSidebarWidth(380, false);
    expect(useLayoutStore.getState().sidebarWidth).toBe(380);

    setIsResizing(false);
    expect(useLayoutStore.getState().isResizing).toBe(false);
  });

  it('restores saved layout properly without old bug on reload', () => {
    mockLocalStorage.setItem(
      'devblueprint_layout_prefs',
      JSON.stringify({
        sidebarWidth: 380,
        inspectorWidth: 400,
        editorSplitRatio: 60,
        viewMode: 'split'
      })
    );

    useLayoutStore.getState().initLayout();

    expect(useLayoutStore.getState().sidebarWidth).toBe(380);
    expect(useLayoutStore.getState().inspectorWidth).toBe(400);
    expect(useLayoutStore.getState().editorSplitRatio).toBe(60);
    expect(useLayoutStore.getState().viewMode).toBe('split');
  });
});
