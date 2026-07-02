import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Settings, Send, X, Volume2 } from 'lucide-react'
import { useVoiceStore } from '../../stores/voiceStore'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'
import { useAudioVisualizer } from '../../hooks/useAudioVisualizer'
import { useChat } from '../../hooks/useChat'
import { playStartSound, playStopSound } from '../../utils/audioBeep'
import MicButton from '../voice/MicButton'
import WaveformVisualizer from '../voice/WaveformVisualizer'
import SpeakingOrb from '../voice/SpeakingOrb'
import VoiceSettings from '../voice/VoiceSettings'
import ChatHistory from '../chat/ChatHistory'
import Sidebar from '../layout/Sidebar'

export default function VoiceInterface() {
  const {
    isListening, isSpeaking, isProcessing,
    transcript, interimTranscript,
    setSidebarOpen, sidebarOpen,
    setTranscript,
    messages,
  } = useVoiceStore()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState('')
  const [statusMsg, setStatusMsg] = useState('Tap to speak')

  const { startListening, stopListening, isSupported } = useSpeechRecognition()
  const { speak, stop: stopSpeaking, toggle } = useTextToSpeech()
  const { startVisualizer, stopVisualizer } = useAudioVisualizer()
  const { sendMessage } = useChat()

  // Use ref to avoid stale closure in useEffect
  const sendMessageRef = useRef(sendMessage)
  const speakRef = useRef(speak)
  useEffect(() => { sendMessageRef.current = sendMessage }, [sendMessage])
  useEffect(() => { speakRef.current = speak }, [speak])

  const handleSend = useCallback(async (text) => {
    if (!text?.trim()) return
    setError('')
    try {
      const response = await sendMessageRef.current(text)
      if (response) {
        speakRef.current(response)
      }
    } catch (err) {
      setError('Failed to get response. Check your connection.')
      console.error(err)
    }
  }, [])

  // Update status message
  useEffect(() => {
    if (isListening) setStatusMsg('Listening...')
    else if (isProcessing) setStatusMsg('Processing...')
    else if (isSpeaking) setStatusMsg('Speaking — tap to interrupt')
    else setStatusMsg('Tap to speak')
  }, [isListening, isProcessing, isSpeaking])

  // When transcript finalizes, send message
  // Using ref to track if we already sent this transcript
  const lastSentTranscript = useRef('')
  useEffect(() => {
    if (
      transcript &&
      transcript.trim() &&
      !isListening &&
      !isProcessing &&
      transcript !== lastSentTranscript.current
    ) {
      lastSentTranscript.current = transcript
      const textToSend = transcript
      setTranscript('')
      handleSend(textToSend)
    }
  }, [transcript, isListening, isProcessing, handleSend, setTranscript])

  const handleMicClick = useCallback(async () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }
    if (isListening) {
      playStopSound()
      stopListening()
      stopVisualizer()
      return
    }
    setError('')
    try {
      playStartSound()
      await Promise.all([startListening(), startVisualizer()])
    } catch (err) {
      setError(err.message)
    }
  }, [isListening, isSpeaking, startListening, stopListening, startVisualizer, stopVisualizer, stopSpeaking])

  const handleTextSend = useCallback(async () => {
    if (!textInput.trim()) return
    const msg = textInput
    setTextInput('')
    await handleSend(msg)
  }, [textInput, handleSend])

  const displayTranscript = interimTranscript || transcript

  return (
    <div className="relative h-screen w-screen overflow-hidden gradient-mesh flex flex-col">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/6 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-cyan-voice/5 blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-voice/3 blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 glass rounded-xl hover:bg-white/8 transition-all border border-white/6"
        >
          <Menu className="w-4 h-4 text-white/50" />
        </button>

        <motion.div
          className="text-center flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-lg font-bold text-gradient font-display tracking-wide">Aura</h1>
          {messages.filter(m => m.role === 'assistant').length > 0 && (
            <button
              onClick={() => {
                const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
                if (lastAssistantMsg) toggle(lastAssistantMsg.content)
              }}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              title="Replay last response"
            >
              <Volume2 className="w-3.5 h-3.5 text-white/30" />
            </button>
          )}
        </motion.div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2.5 glass rounded-xl hover:bg-white/8 transition-all border border-white/6"
        >
          <Settings className="w-4 h-4 text-white/50" />
        </button>
      </div>

      {/* Chat history */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <ChatHistory />
      </div>

      {/* Center voice area */}
      <div className="relative z-10 flex flex-col items-center py-6 gap-4">
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <SpeakingOrb active={isSpeaking} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(isListening || displayTranscript) && !isSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md mx-auto px-4"
            >
              <div className="glass rounded-2xl px-5 py-3.5 border border-white/8">
                <p className="text-white/80 text-sm text-center leading-relaxed min-h-[20px]">
                  {displayTranscript || (
                    <span className="text-white/25">Listening for your voice...</span>
                  )}
                  {interimTranscript && (
                    <span className="text-white/40 ml-1">...</span>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.5 }}
            >
              <WaveformVisualizer active={isListening} />
            </motion.div>
          )}
        </AnimatePresence>

        {!isSpeaking && (
          <MicButton
            isListening={isListening}
            isSpeaking={isSpeaking}
            isProcessing={isProcessing}
            onClick={handleMicClick}
            disabled={!isSupported && !isListening}
          />
        )}

        <AnimatePresence>
          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={stopSpeaking}
              className="mt-2 px-5 py-2 glass rounded-full border border-white/10 hover:border-accent/30 text-white/50 hover:text-white/80 text-sm flex items-center gap-2 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Stop speaking
            </motion.button>
          )}
        </AnimatePresence>

        <motion.p
          key={statusMsg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/30 text-xs tracking-wider font-mono"
        >
          {statusMsg}
        </motion.p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-4 max-w-md w-full"
            >
              <div className="bg-rose-voice/10 border border-rose-voice/20 rounded-xl px-4 py-2.5 text-rose-voice/80 text-sm text-center flex items-center gap-2 justify-center">
                <span>{error}</span>
                <button onClick={() => setError('')} className="ml-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text input */}
      <div className="relative z-10 px-4 pb-6">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSend()}
              placeholder="Or type a message..."
              className="w-full glass border border-white/8 focus:border-accent/30 rounded-2xl px-4 py-3 text-sm text-white/70 placeholder-white/20 transition-colors"
            />
          </div>
          <motion.button
            onClick={handleTextSend}
            disabled={!textInput.trim() || isProcessing}
            className="p-3 rounded-2xl bg-accent/20 hover:bg-accent/30 border border-accent/20 hover:border-accent/40 transition-all disabled:opacity-40"
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4 text-accent" />
          </motion.button>
        </div>
        {!isSupported && (
          <p className="text-center text-white/25 text-xs mt-2">
            Speech recognition not supported — using text input
          </p>
        )}
      </div>

      <Sidebar />
      <VoiceSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
