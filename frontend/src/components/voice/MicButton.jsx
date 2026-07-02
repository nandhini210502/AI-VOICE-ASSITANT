import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Square } from 'lucide-react'
import clsx from 'clsx'

export default function MicButton({ isListening, isSpeaking, isProcessing, onClick, disabled }) {
  const getState = () => {
    if (isSpeaking) return 'speaking'
    if (isListening) return 'listening'
    if (isProcessing) return 'processing'
    return 'idle'
  }

  const state = getState()

  const stateStyles = {
    idle: {
      bg: 'bg-accent hover:bg-accent-glow',
      glow: '0 0 30px rgba(124,106,247,0.4), 0 0 60px rgba(124,106,247,0.15)',
      ringColor: 'rgba(124,106,247,0.3)',
    },
    listening: {
      bg: 'bg-cyan-voice/80 hover:bg-cyan-voice',
      glow: '0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(0,212,255,0.2)',
      ringColor: 'rgba(0,212,255,0.4)',
    },
    processing: {
      bg: 'bg-emerald-voice/60',
      glow: '0 0 30px rgba(0,255,157,0.4), 0 0 60px rgba(0,255,157,0.15)',
      ringColor: 'rgba(0,255,157,0.3)',
    },
    speaking: {
      bg: 'bg-accent/60',
      glow: '0 0 30px rgba(124,106,247,0.3)',
      ringColor: 'rgba(124,106,247,0.25)',
    },
  }

  const current = stateStyles[state]

  return (
    <div className="relative flex items-center justify-center">
      {/* Ripple rings for listening */}
      <AnimatePresence>
        {isListening && (
          <>
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-cyan-voice/30"
                initial={{ width: 80, height: 80, opacity: 0.6 }}
                animate={{ width: 160 + i * 40, height: 160 + i * 40, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Processing ring */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="absolute w-24 h-24 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: 'rgba(0,255,157,0.6)',
              borderRightColor: 'rgba(0,255,157,0.2)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      {/* Outer ring */}
      <motion.div
        className="absolute w-20 h-20 rounded-full"
        style={{ border: `1px solid ${current.ringColor}` }}
        animate={isListening ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: isListening ? Infinity : 0 }}
      />

      {/* Main button */}
      <motion.button
        onClick={onClick}
        disabled={disabled || isProcessing}
        className={clsx(
          'relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
          current.bg,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ boxShadow: current.glow }}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        animate={
          state === 'idle' ? {
            boxShadow: [
              '0 0 20px rgba(124,106,247,0.3)',
              '0 0 40px rgba(124,106,247,0.5)',
              '0 0 20px rgba(124,106,247,0.3)',
            ],
          } : {}
        }
        transition={state === 'idle' ? { duration: 3, repeat: Infinity } : {}}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div key="stop" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Square className="w-6 h-6 text-white fill-white" />
            </motion.div>
          ) : isSpeaking ? (
            <motion.div key="speaking" initial={{ scale: 0 }} animate={{ scale: [1, 1.1, 1] }} exit={{ scale: 0 }}
              transition={{ duration: 1, repeat: Infinity }}>
              <Mic className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Mic className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
