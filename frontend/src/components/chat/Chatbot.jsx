import { useState, useRef, useEffect } from 'react'
import { PLAN_ID } from '../../api/apiClient'
import ChatMessage from './ChatMessage'

const SUGGESTIONS = [
  'Hva betyr utnyttelsesgrad?',
  'Vil dette skygge for meg?',
  'Kan jeg stoppe dette?',
  'Hva skjer etter høringen?',
  'Hvor mange boliger planlegges?',
  'Hva er parkeringsnormen?',
]

export default function Chatbot({ plannavn }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    if (!text.trim() || streaming) return
    const userMsg = { role: 'user', content: text.trim() }
    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }])
    setInput('')
    setStreaming(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: PLAN_ID,
          message: text.trim(),
          sessionId,
          history,
        }),
      })

      if (!response.ok) throw new Error('Nettverksfeil')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
            if (data === '') continue
            // Check for "done" event - the line before would be "event:done"
            setMessages((prev) => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last?.role === 'assistant') {
                updated[updated.length - 1] = { ...last, content: last.content + data }
              }
              return updated
            })
          } else if (line.startsWith('event:done')) {
            // stream finished
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant' && last.content === '') {
          updated[updated.length - 1] = {
            ...last,
            content: 'Beklager, noe gikk galt. Prøv igjen.',
          }
        }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
        <h2 className="font-semibold text-blue-800 text-sm">Spør om denne planen</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Jeg kan forklare hva <strong>{plannavn || 'denne planen'}</strong> betyr for deg.
              Hva lurer du på?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {streaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-500 flex items-center gap-1">
                  <span className="animate-bounce delay-0 inline-block">.</span>
                  <span className="animate-bounce delay-100 inline-block">.</span>
                  <span className="animate-bounce delay-200 inline-block">.</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Still et spørsmål om planen..."
          disabled={streaming}
          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
          aria-label="Skriv spørsmål"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send spørsmål"
        >
          Send
        </button>
      </form>
    </div>
  )
}
