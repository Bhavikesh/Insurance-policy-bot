import { create } from 'zustand';
import type { ChatMessage, Citation, ConversationSummary, DocumentItem } from '../types/chat';

interface UIState {
  theme: 'light' | 'dark';
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  activeDocumentId: string | null;
  focusedCitation: Citation | null;
  viewerPage: number;
  viewerZoom: number;
  documentSearch: string;
  inputDraft: string;
}

interface ChatState {
  messages: ChatMessage[];
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  isAssistantTyping: boolean;
}

interface DocState {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  suggestions: string[];
}

interface Actions {
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setMobileSidebar: (open: boolean) => void;
  setDocuments: (docs: DocumentItem[]) => void;
  setSelectedDocument: (doc: DocumentItem | null) => void;
  setActiveDocumentId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  setTyping: (typing: boolean) => void;
  setFocusedCitation: (citation: Citation | null) => void;
  setViewerPage: (page: number) => void;
  setViewerZoom: (zoom: number) => void;
  setDocumentSearch: (term: string) => void;
  setInputDraft: (draft: string) => void;
  setSuggestions: (suggestions: string[]) => void;
}

export const useAppStore = create<UIState & ChatState & DocState & Actions>((set) => ({
  theme: 'light',
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  activeDocumentId: null,
  focusedCitation: null,
  viewerPage: 1,
  viewerZoom: 1,
  documentSearch: '',
  inputDraft: '',

  messages: [],
  conversations: [],
  activeConversationId: null,
  isAssistantTyping: false,

  documents: [],
  selectedDocument: null,
  suggestions: [
    'What is the waiting period for knee surgery?',
    'List all exclusions related to pre-existing diseases.',
    'Show clauses related to claim filing deadlines.',
    'Summarize this policy in 5 bullet points.'
  ],

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setMobileSidebar: (open) => set({ isMobileSidebarOpen: open }),

  setDocuments: (docs) => set({ documents: docs }),
  setSelectedDocument: (doc) => set({ selectedDocument: doc, activeDocumentId: doc?.id ?? null }),
  setActiveDocumentId: (id) => set({ activeDocumentId: id }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m))
    })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
  setTyping: (typing) => set({ isAssistantTyping: typing }),

  setFocusedCitation: (citation) => set({ focusedCitation: citation, viewerPage: citation?.page_number ?? 1 }),
  setViewerPage: (page) => set({ viewerPage: page }),
  setViewerZoom: (zoom) => set({ viewerZoom: Math.max(0.5, Math.min(3, zoom)) }),
  setDocumentSearch: (term) => set({ documentSearch: term }),
  setInputDraft: (draft) => set({ inputDraft: draft }),
  setSuggestions: (suggestions) => set({ suggestions })
}));
