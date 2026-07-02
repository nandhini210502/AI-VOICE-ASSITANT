import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from './stores/authStore'
import AuthScreen from './components/layout/AuthScreen'
import VoiceInterface from './components/voice/VoiceInterface'

export default function App() {
  const { isAuthenticated, initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-screen"
        >
          <VoiceInterface />
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AuthScreen />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
