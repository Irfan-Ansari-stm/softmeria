import { create } from 'zustand';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict';
export type ViewMode = 'split' | 'edit' | 'preview';

interface EditorState {
  documentId: string | null;
  projectId: string | null;
  categoryId: string | null;
  title: string;
  content: string;
  savedContent: string;
  versionNumber: number;
  status: string;
  isOptional: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;
  viewMode: ViewMode;
  isFullScreen: boolean;
  activeRightTab: 'metadata' | 'versions' | 'comments' | 'review';
  isRightPanelOpen: boolean;

  setDocument: (doc: any) => void;
  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  setStatus: (status: string) => void;
  setIsOptional: (isOptional: boolean) => void;
  setSaveStatus: (status: SaveStatus, error?: string | null) => void;
  setSavedSuccessfully: (versionNumber: number) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFullScreen: () => void;
  setActiveRightTab: (tab: 'metadata' | 'versions' | 'comments' | 'review') => void;
  toggleRightPanel: () => void;
  resetEditor: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  documentId: null,
  projectId: null,
  categoryId: null,
  title: '',
  content: '',
  savedContent: '',
  versionNumber: 1,
  status: 'NOT_STARTED',
  isOptional: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  errorMessage: null,
  viewMode: 'split',
  isFullScreen: false,
  activeRightTab: 'metadata',
  isRightPanelOpen: true,

  setDocument: (doc) => {
    set({
      documentId: doc.id,
      projectId: doc.projectId,
      categoryId: doc.categoryId,
      title: doc.title,
      content: doc.content || '',
      savedContent: doc.content || '',
      versionNumber: doc.versionNumber || 1,
      status: doc.status || 'NOT_STARTED',
      isOptional: doc.isOptional || false,
      saveStatus: 'idle',
      lastSavedAt: new Date(doc.updatedAt || Date.now()),
      errorMessage: null
    });
  },

  setContent: (content) => {
    const isDirty = content !== get().savedContent;
    set({
      content,
      saveStatus: isDirty ? 'dirty' : 'saved'
    });
  },

  setTitle: (title) => set({ title, saveStatus: 'dirty' }),
  setStatus: (status) => set({ status, saveStatus: 'dirty' }),
  setIsOptional: (isOptional) => set({ isOptional, saveStatus: 'dirty' }),

  setSaveStatus: (saveStatus, errorMessage = null) =>
    set({ saveStatus, errorMessage }),

  setSavedSuccessfully: (newVersionNumber) => {
    set((state) => ({
      savedContent: state.content,
      versionNumber: newVersionNumber,
      saveStatus: 'saved',
      lastSavedAt: new Date(),
      errorMessage: null
    }));
  },

  setViewMode: (viewMode) => set({ viewMode }),
  toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
  setActiveRightTab: (activeRightTab) => set({ activeRightTab, isRightPanelOpen: true }),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  resetEditor: () =>
    set({
      documentId: null,
      projectId: null,
      categoryId: null,
      title: '',
      content: '',
      savedContent: '',
      versionNumber: 1,
      status: 'NOT_STARTED',
      isOptional: false,
      saveStatus: 'idle',
      lastSavedAt: null,
      errorMessage: null
    })
}));

