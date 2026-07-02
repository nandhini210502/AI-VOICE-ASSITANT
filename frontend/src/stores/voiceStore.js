import { create } from 'zustand'

export const useVoiceStore = create((set, get) => ({
  // Voice state
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  transcript: '',
  interimTranscript: '',
  audioLevel: 0,
  voiceSettings: {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voiceURI: '',
    preferredLang: 'en-US',
  },

  // Chat state
  currentConversationId: null,
  conversations: [],
  messages: [],
  searchQuery: '',

  // UI state
  sidebarOpen: false,
  settingsOpen: false,

  setListening: (val) => set({ isListening: val }),
  setSpeaking: (val) => set({ isSpeaking: val }),
  setProcessing: (val) => set({ isProcessing: val }),
  setTranscript: (val) => set((s) => ({ transcript: typeof val === 'function' ? val(s.transcript) : val })),
  setInterimTranscript: (val) => set((s) => ({ interimTranscript: typeof val === 'function' ? val(s.interimTranscript) : val })),
  setAudioLevel: (val) => set({ audioLevel: val }),
  setVoiceSettings: (settings) => set((s) => ({ voiceSettings: { ...s.voiceSettings, ...settings } })),

  setCurrentConversation: (id) => set({ currentConversationId: id }),
  setConversations: (convos) => set({ conversations: convos }),
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages]
      if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
      return { messages: msgs }
    }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  setSettingsOpen: (val) => set({ settingsOpen: val }),

  reset: () => set({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    transcript: '',
    interimTranscript: '',
  }),
}))
