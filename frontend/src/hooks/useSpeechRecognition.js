import { useEffect, useRef, useCallback } from 'react'
import { useVoiceStore } from '../stores/voiceStore'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export const useSpeechRecognition = () => {
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const {
    setListening,
    setTranscript,
    setInterimTranscript,
    transcript,
    voiceSettings,
  } = useVoiceStore()

  const preferredLang = voiceSettings.preferredLang
  const preferredLangRef = useRef(preferredLang)

  useEffect(() => {
    preferredLangRef.current = preferredLang
  }, [preferredLang])

  const isSupported = !!SpeechRecognition

  const initRecognition = useCallback(() => {
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = preferredLangRef.current || 'en-US';
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      let interim = ''
      let finalSegment = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalSegment += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (finalSegment) {
        setTranscript((prev) => (prev + ' ' + finalSegment).trim())
        setInterimTranscript('')
      } else {
        setInterimTranscript(interim)
      }

      // Reset auto-stop timer on ANY speech input (interim or final)
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(() => {
        console.log('Silence detected, stopping...')
        recognition.stop()
      }, 800)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech') {
        setListening(false)
      }
    }

    recognition.onend = () => {
      console.log('Recognition ended')
      setListening(false)
      setInterimTranscript('')
    }

    return recognition
  }, [setListening, setTranscript, setInterimTranscript])

  const startListening = useCallback(async () => {
    try {
      setTranscript('')
      setInterimTranscript('')

      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      recognitionRef.current = initRecognition()
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    } catch (err) {
      console.error('STT Start Error:', err)
      throw new Error('Could not start speech recognition.')
    }
  }, [initRecognition, setTranscript, setInterimTranscript])

  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setListening(false)
    setInterimTranscript('')
  }, [setListening, setInterimTranscript])

  useEffect(() => {
    return () => {
      clearTimeout(silenceTimerRef.current)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return { startListening, stopListening, isSupported }
}
