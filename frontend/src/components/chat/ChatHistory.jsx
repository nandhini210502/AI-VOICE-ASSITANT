import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import ChatMessage from './ChatMessage'
import { useVoiceStore } from '../../stores/voiceStore'

export default function ChatHistory() {
  const { messages } = useVoiceStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar"
      style={{ maxHeight: 'calc(100vh - 280px)' }}
    >
      {messages.map((msg, i) => (
        <ChatMessage key={msg.id || i} message={msg} index={i} />
      ))}
      <div ref={bottomRef} />
    </motion.div>
  )
}
