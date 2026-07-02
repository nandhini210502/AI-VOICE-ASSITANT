import { motion } from 'framer-motion'
import { useVoiceStore } from '../../stores/voiceStore'

const BAR_COUNT = 32

export default function WaveformVisualizer({ active }) {
  const { audioLevel } = useVoiceStore()

  if (!active) return null

  return (
    <div className="flex items-center justify-center gap-0.5 h-12">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const center = BAR_COUNT / 2
        const distFromCenter = Math.abs(i - center) / center
        const baseHeight = 4
        const maxExtra = 36 * audioLevel * (1 - distFromCenter * 0.7)
        const randomFactor = 0.6 + Math.random() * 0.8
        const height = baseHeight + maxExtra * randomFactor

        return (
          <motion.div
            key={i}
            className="rounded-full bg-gradient-to-t from-accent to-cyan-voice"
            style={{ width: 3 }}
            animate={{ height: `${height}px` }}
            transition={{
              duration: 0.08,
              ease: 'easeOut',
            }}
          />
        )
      })}
    </div>
  )
}
