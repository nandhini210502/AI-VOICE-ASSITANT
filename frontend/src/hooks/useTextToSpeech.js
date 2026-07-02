import { useCallback, useRef, useEffect } from 'react'
import { useVoiceStore } from '../stores/voiceStore'

export const useTextToSpeech = () => {
  const utteranceRef = useRef(null)
  const { setSpeaking, voiceSettings } = useVoiceStore()

  const voiceSettingsRef = useRef(voiceSettings)
  useEffect(() => {
    voiceSettingsRef.current = voiceSettings
  }, [voiceSettings])

  const getVoice = useCallback((lang) => {
    const voices = speechSynthesis.getVoices()
    if (!voices.length) return null

    const settings = voiceSettingsRef.current

    // Try preferred voice URI first
    if (settings.voiceURI) {
      const preferred = voices.find((v) => v.voiceURI === settings.voiceURI)
      if (preferred) return preferred
    }

    // Try to find a voice matching the requested language
    if (lang) {
      const langPrefix = lang.split('-')[0]
      const langVoice = voices.find((v) => v.lang.startsWith(langPrefix))
      if (langVoice) return langVoice
    }

    // Prefer high-quality English voices
    const preferredNames = [
      'Samantha', 'Daniel', 'Karen', 'Moira', // macOS/iOS
      'Google US English', 'Google UK English Female',
      'Microsoft Aria Online', 'Microsoft Jenny Online',
    ]

    for (const name of preferredNames) {
      const voice = voices.find((v) => v.name.includes(name))
      if (voice) return voice
    }

    // Fallback to first English voice
    return voices.find((v) => v.lang.startsWith('en')) || voices[0]
  }, [])

  const speak = useCallback(
    (text, onEnd) => {
      if (!text || !window.speechSynthesis) return

      window.speechSynthesis.cancel()

      setTimeout(() => {
        const settings = voiceSettingsRef.current
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = settings.rate || 0.9
        utterance.volume = settings.volume || 1.0
        utterance.pitch = settings.pitch || 1.0

        const voices = window.speechSynthesis.getVoices()
        console.log('[TTS] Available voices:', voices.length, '| voiceURI:', settings.voiceURI)

        // 1. Try the exact voice selected in settings
        let selectedVoice = null
        if (settings.voiceURI) {
          selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI)
        }

        // 2. Fallback to preferredLang match
        if (!selectedVoice && settings.preferredLang) {
          const lang = settings.preferredLang
          selectedVoice = voices.find(v => v.lang === lang) ||
                          voices.find(v => v.lang.startsWith(lang.split('-')[0]))
        }

        // 3. Fallback to Zira / Jenny / first voice
        if (!selectedVoice) {
          selectedVoice = voices.find(v =>
            v.name.includes('Zira') || v.name.includes('Jenny')
          ) || voices[0]
        }

        if (selectedVoice) utterance.voice = selectedVoice

        // Auto-detect lang for non-Latin scripts
        const detectedLang = (() => {
          if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'
          if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'
          return null
        })()
        utterance.lang = settings.preferredLang || detectedLang || selectedVoice?.lang || navigator.language

        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => { setSpeaking(false); onEnd?.() }
        utterance.onerror = (e) => { if (e.error !== 'interrupted') console.error('TTS error:', e); setSpeaking(false) }

        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)

        // Chrome fix: resume if synthesis pauses unexpectedly
        const resumeTimer = setInterval(() => {
          if (!window.speechSynthesis.speaking) clearInterval(resumeTimer)
          else if (window.speechSynthesis.paused) window.speechSynthesis.resume()
        }, 5000)
      }, 100)
    },
    [setSpeaking]
  )

  const toggle = useCallback((text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    } else {
      speak(text)
    }
  }, [speak, setSpeaking])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [setSpeaking])

  const getAvailableVoices = useCallback(() => {
    return window.speechSynthesis.getVoices()
  }, [])

  return { speak, stop, toggle, getAvailableVoices }
}
