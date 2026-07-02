import { motion } from 'framer-motion'
import { Mic, Cpu, Volume2, VolumeX } from 'lucide-react'
import { format } from 'date-fns'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'
import { useVoiceStore } from '../../stores/voiceStore'
import clsx from 'clsx'

export default function ChatMessage({ message, index }) {
  const isUser = message.role === 'user'
  const { toggle } = useTextToSpeech()
  const { isSpeaking } = useVoiceStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={clsx('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1',
          isUser ? 'bg-accent/20' : 'bg-white/5 border border-white/8'
        )}
      >
        {isUser ? (
          <Mic className="w-3.5 h-3.5 text-accent" />
        ) : (
          <Cpu className="w-3.5 h-3.5 text-white/40" />
        )}
      </div>

      {/* Bubble */}
      <div className={clsx('max-w-[75%]', isUser ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
        <div
          className={clsx(
            'group relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-accent/20 border border-accent/20 text-white/90 rounded-tr-sm'
              : 'bg-white/5 border border-white/6 text-white/80 rounded-tl-sm'
          )}
        >
          {message.streaming && !message.content ? (
            <div className="flex gap-1 items-center py-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent/60"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          ) : (
            <>
              {message.content}
              {!isUser && message.content && (
                <button
                  onClick={() => toggle(message.content)}
                  className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 border border-white/8 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                  title="Speak message"
                >
                  <Volume2 className="w-3.5 h-3.5 text-white/40 hover:text-white/80" />
                </button>
              )}
            </>
          )}
        </div>
        <span className="text-xs text-white/20 px-1">
          {format(new Date(message.timestamp), 'HH:mm')}
        </span>
      </div>
    </motion.div>
  )
}
