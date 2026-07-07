import { useCallback, useRef } from 'react'
import api from '../api/client'
import { useVoiceStore } from '../stores/voiceStore'
import { useAuthStore } from '../stores/authStore'

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

export const useChat = () => {
  const {
    currentConversationId,
    setCurrentConversation,
    messages,
    setMessages,
    addMessage,
    updateLastMessage,
    setProcessing,
    voiceSettings,
  } = useVoiceStore()
  const { token } = useAuthStore()

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim()) return
      setProcessing(true)

      let convId = currentConversationId
      if (!convId) {
        try {
          const { data } = await api.post('/chat/conversations', { title: content.slice(0, 50) })
          convId = data.id
          setCurrentConversation(convId)
        } catch (err) {
          setProcessing(false)
          throw err
        }
      }

      addMessage({ id: generateId(), role: 'user', content, timestamp: new Date().toISOString() })
      addMessage({ id: generateId(), role: 'assistant', content: '', timestamp: new Date().toISOString(), streaming: true })

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/chat/conversations/${convId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content, preferredLang: voiceSettings?.preferredLang }),
        })

        if (!response.ok) throw new Error('Failed to send message')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'delta') {
                accumulated += data.content
                updateLastMessage(accumulated)
              }
            } catch {}
          }
        }

        setProcessing(false)
        return accumulated
      } catch (err) {
        setProcessing(false)
        updateLastMessage('Sorry, I encountered an error. Please try again.')
        throw err
      }
    },
    [currentConversationId, token, voiceSettings?.preferredLang]
  )

  return {
    conversations: [],
    messages,
    currentConversationId,
    createConversation: () => {},
    deleteConversation: () => {},
    sendMessage,
    refetchConversations: () => {},
  }
}