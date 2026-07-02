import { motion } from 'framer-motion'
import { useVoiceStore } from '../../stores/voiceStore'

export default function SpeakingOrb({ active }) {
  const { audioLevel } = useVoiceStore()

  if (!active) return null

  const scale = 1 + audioLevel * 0.3

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Outer glow rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(124,106,247,${0.08 / i}) 0%, transparent 70%)`,
            border: `1px solid rgba(124,106,247,${0.15 / i})`,
          }}
          animate={{
            scale: [1, 1.1 + i * 0.08, 1],
            opacity: [0.8, 0.3, 0.8],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Main orb */}
      <motion.div
        className="speaking-orb absolute w-28 h-28"
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(168,158,249,0.9) 0%, rgba(124,106,247,0.7) 40%, rgba(90,77,230,0.5) 70%, rgba(0,212,255,0.3) 100%)',
          boxShadow: `0 0 ${40 + audioLevel * 40}px rgba(124,106,247,0.6), 0 0 ${80 + audioLevel * 60}px rgba(124,106,247,0.3), inset 0 0 30px rgba(255,255,255,0.1)`,
        }}
        animate={{ scale }}
        transition={{ duration: 0.1 }}
      />

      {/* Inner shimmer */}
      <motion.div
        className="absolute w-20 h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)',
        }}
        animate={{
          rotate: 360,
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  )
}
