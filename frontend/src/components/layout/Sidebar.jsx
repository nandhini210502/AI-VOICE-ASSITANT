import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Trash2, Download, MessageSquare, X, LogOut, Mic } from 'lucide-react'
import { format } from 'date-fns'
import { useVoiceStore } from '../../stores/voiceStore'
import { useAuthStore } from '../../stores/authStore'
import { useChat } from '../../hooks/useChat'
import clsx from 'clsx'

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery, currentConversationId, setCurrentConversation, setMessages } = useVoiceStore()
  const { conversations, createConversation, deleteConversation, exportConversation, refetchConversations } = useChat()
  const { user, logout } = useAuthStore()

  const filtered = useMemo(() => {
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  const handleSelect = async (id) => {
    setCurrentConversation(id)
    setSidebarOpen(false)
    // Messages will be fetched by useChat hook
  }

  const handleNew = () => {
    setCurrentConversation(null)
    setMessages([])
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-72 glass-strong z-50 flex flex-col border-r border-white/5"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Mic className="w-5 h-5 text-accent" />
            <span className="font-semibold text-white/90 text-gradient">Aura</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-white/8 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-3 border-b border-white/5">
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-accent/20 hover:border-accent/40 hover:bg-accent/8 transition-all duration-200 text-accent/80 hover:text-accent text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New conversation
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/8 focus:border-accent/30 rounded-lg pl-8 pr-3 py-2 text-sm text-white/70 placeholder-white/25 transition-colors"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-white/25 text-sm">
              {searchQuery ? 'No results found' : 'No conversations yet'}
            </div>
          ) : (
            filtered.map((convo) => (
              <motion.div
                key={convo.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={clsx(
                  'group flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200',
                  currentConversationId === convo.id
                    ? 'bg-accent/15 border border-accent/20'
                    : 'hover:bg-white/5 border border-transparent'
                )}
                onClick={() => handleSelect(convo.id)}
              >
                <MessageSquare className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{convo.title}</p>
                  <p className="text-xs text-white/25 mt-0.5">
                    {convo.messageCount} msg · {format(new Date(convo.updatedAt), 'MMM d')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); exportConversation() }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Export"
                  >
                    <Download className="w-3 h-3 text-white/40" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteConversation(convo.id) }}
                    className="p-1 hover:bg-rose-voice/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 text-white/40 hover:text-rose-voice" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 truncate">{user?.username || 'Guest'}</p>
              <p className="text-xs text-white/30 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 hover:bg-white/8 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-white/35" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
