import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import { Mic, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'

export default function AuthScreen() {
  const [mode, setMode] = useState('landing') // landing | login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, guestLogin } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, username)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const [loadingGuest, setLoadingGuest] = useState(false)

  const handleGuest = async () => {
    setLoadingGuest(true)
    setError('')
    try {
      await guestLogin()
      // Navigation happens automatically via App.jsx watching isAuthenticated
    } catch (err) {
      setError('Failed to continue as guest. Please try again.')
      console.error(err)
    } finally {
      setLoadingGuest(false)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-voice/4 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4"
            animate={{ boxShadow: ['0 0 20px rgba(124,106,247,0.2)', '0 0 40px rgba(124,106,247,0.4)', '0 0 20px rgba(124,106,247,0.2)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Mic className="w-7 h-7 text-accent" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient font-display">Aura</h1>
          <p className="text-white/40 text-sm mt-1 font-mono tracking-wider">AI VOICE ASSISTANT</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-2xl p-8 space-y-4"
            >
              <h2 className="text-xl font-semibold text-white/90 text-center mb-6">
                Talk to your AI assistant
              </h2>

              <button
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-accent hover:bg-accent-glow transition-all duration-200 text-white font-medium group"
              >
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setMode('register')}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-white/10 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200 text-white/80 font-medium group"
              >
                <span>Create account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-white/30 text-xs">or</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              {error && mode === 'landing' && (
                <p className="text-rose-voice/80 text-xs text-center">
                  {error}
                </p>
              )}

              <button
                onClick={handleGuest}
                disabled={loadingGuest}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-white/8 hover:border-white/20 hover:bg-white/5 transition-all duration-200 text-white/60 hover:text-white/80 text-sm"
              >
                {loadingGuest ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loadingGuest ? 'Starting session...' : 'Continue as guest'}
              </button>
            </motion.div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold text-white/90 mb-6">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-accent/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-accent/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-accent/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-rose-voice/80 text-sm bg-rose-voice/10 border border-rose-voice/20 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-glow disabled:opacity-50 transition-all rounded-xl py-3 font-medium text-white"
                >
                  {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button onClick={() => setMode('landing')} className="text-white/30 hover:text-white/60 transition-colors">
                  ← Back
                </button>
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-accent/70 hover:text-accent transition-colors"
                >
                  {mode === 'login' ? 'Create account' : 'Sign in instead'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
