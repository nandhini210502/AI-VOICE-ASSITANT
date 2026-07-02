import { useEffect, useRef, useCallback } from 'react'
import { useVoiceStore } from '../stores/voiceStore'

export const useAudioVisualizer = () => {
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const streamRef = useRef(null)
  const animFrameRef = useRef(null)
  const { setAudioLevel } = useVoiceStore()

  const startVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current.connect(analyserRef.current)

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const tick = () => {
        animFrameRef.current = requestAnimationFrame(tick)
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength
        setAudioLevel(average / 128) // normalize 0-1
      }

      tick()
    } catch (err) {
      console.error('Visualizer error:', err)
    }
  }, [setAudioLevel])

  const stopVisualizer = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    setAudioLevel(0)

    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [setAudioLevel])

  useEffect(() => {
    return () => stopVisualizer()
  }, [stopVisualizer])

  return { startVisualizer, stopVisualizer }
}
