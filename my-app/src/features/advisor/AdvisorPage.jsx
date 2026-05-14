import { useState, useRef, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import styles from './AdvisorPage.module.css'

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL
const OLLAMA_API_KEY = import.meta.env.VITE_OLLAMA_API_KEY
const MODEL = 'gemma3:4b-cloud'

const SEASON_INFO = {
  Spring: { emoji: '🌸', undertone: 'Warm Tone', palette: 'coral, peach, golden yellow, warm orange, tomato red, warm brown, olive green' },
  Summer: { emoji: '☁️', undertone: 'Cool Tone', palette: 'dusty rose, lavender, powder blue, soft mauve, slate grey, cool pink, berry' },
  Autumn: { emoji: '🍂', undertone: 'Warm Tone', palette: 'burnt orange, terracotta, deep gold, olive, rust, chocolate brown, camel' },
  Winter: { emoji: '❄️', undertone: 'Cool Tone', palette: 'navy, burgundy, royal blue, emerald, hot pink, pure white, charcoal black' },
}

const SUGGESTED = [
  'What lipstick shades suit my season?',
  'What colors should I avoid?',
  'Best blush for my undertone?',
  'Eye shadow recommendations?',
  'Outfit ideas for my season?',
  'What nail polish colors work?',
]

function buildSystemPrompt(season) {
  const info = SEASON_INFO[season]
  if (info) {
    return `You are AuraColor, a friendly AI beauty and fashion advisor. The user's color season is ${season} (${info.undertone}). Their palette: ${info.palette}. Give specific, practical advice tailored to their ${season} season. Name actual shades. Keep responses concise (3–5 sentences), warm, and encouraging. Use bullet points when listing multiple items.`
  }
  return `You are AuraColor, a friendly AI beauty and fashion advisor specializing in personal color theory (Spring, Summer, Autumn, Winter). The user has not determined their season yet. Encourage them to take the Color Quiz, but still give helpful general color and beauty tips. Keep responses concise, warm, and practical.`
}

function buildWelcome(season) {
  const info = SEASON_INFO[season]
  if (!info) {
    return "Hi! ✦ I'm your AuraColor Advisor. For fully personalized recommendations, take the **Color Quiz** first. But feel free to ask me anything about colors, makeup, or fashion!"
  }
  return `Hi! ✦ I'm your AuraColor Advisor. Your season is **${season}** — I'm ready to help you make the most of your ${info.undertone.toLowerCase()} palette. What would you like to know?`
}

async function callOllamaWithRetry(messages) {
  const url = `/ollama-api/v1/chat/completions`
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OLLAMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
    }),
  }
  const res = await fetch(url, options)
  if (res.status === 429) {
    await new Promise(r => setTimeout(r, 3000))
    return fetch(url, options)
  }
  return res
}

function formatBold(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function MessageText({ text }) {
  const lines = text.split('\n')
  return (
    <div className={styles.msgBody}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className={styles.msgSpacer} />
        if (/^[*\-•] /.test(line)) {
          return (
            <div key={i} className={styles.bulletLine}>
              <span className={styles.bullet}>•</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(line.slice(2)) }} />
            </div>
          )
        }
        return (
          <p key={i} className={styles.msgLine} dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
        )
      })}
    </div>
  )
}

export default function AdvisorPage() {
  const analyzerSeason = useSelector((s) => s.analysis.season)
  const quizSeason     = useSelector((s) => s.quiz.result?.season)
  const season         = analyzerSeason ?? quizSeason ?? null
  const info           = season ? SEASON_INFO[season] : null

  const [messages, setMessages]   = useState(() => [
    { role: 'assistant', text: buildWelcome(season) },
  ])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Conversation history in OpenAI format: [{role, content}]
  // Starts with a system message for context
  const historyRef        = useRef([{ role: 'system', content: buildSystemPrompt(season) }])
  const bottomRef         = useRef(null)
  const inputRef          = useRef(null)
  const isRequestInFlight = useRef(false)

  const noConfig = !OLLAMA_URL || OLLAMA_URL === 'https://your-ollama-host-url-here'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading || isRequestInFlight.current) return

    isRequestInFlight.current = true
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setIsLoading(true)

    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: trimmed },
    ]

    try {
      const res = await callOllamaWithRetry(historyRef.current)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const err = new Error(body.error?.message ?? res.statusText)
        err.status = res.status
        throw err
      }

      const data  = await res.json()
      const reply = data.choices?.[0]?.message?.content ?? ''

      historyRef.current = [
        ...historyRef.current,
        { role: 'assistant', content: reply },
      ]

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch (err) {
      const is429 = err?.status === 429 || err?.message?.includes('429')
      const errText = noConfig
        ? 'Set VITE_OLLAMA_URL and VITE_OLLAMA_API_KEY in your .env file and restart the dev server.'
        : is429
          ? 'Sorry, the AI is busy right now. Please wait a moment and try again.'
          : `Sorry, something went wrong. Please try again. (${err?.message ?? 'unknown error'})`
      historyRef.current = historyRef.current.slice(0, -1)
      setMessages((prev) => [...prev, { role: 'assistant', text: errText, isError: true }])
    } finally {
      setIsLoading(false)
      isRequestInFlight.current = false
      inputRef.current?.focus()
    }
  }, [isLoading, noConfig])

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <main className={styles.main}>
      <div className={styles.pageWrap}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>✦ AI POWERED</span>
            <h1 className={styles.title}>Color Advisor</h1>
          </div>
          {info ? (
            <span className={styles.seasonBadge}>
              {info.emoji} {season}
            </span>
          ) : (
            <Link to="/tryon" className={styles.quizPrompt}>
              Take Quiz to Personalize →
            </Link>
          )}
        </div>

        {noConfig && (
          <div className={styles.keyWarning}>
            <strong>⚠ Ollama not configured:</strong> Set <code>VITE_OLLAMA_URL</code> and <code>VITE_OLLAMA_API_KEY</code> in your <code>.env</code> file and restart the dev server.
          </div>
        )}

        {/* ── Chat area ── */}
        <div className={styles.chatArea}>
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? styles.userRow : styles.aiRow}>
              {msg.role === 'assistant' && (
                <div className={styles.avatar}>✦</div>
              )}
              <div className={[
                styles.bubble,
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI,
                msg.isError ? styles.bubbleError : '',
              ].filter(Boolean).join(' ')}>
                <MessageText text={msg.text} />
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={styles.aiRow}>
              <div className={styles.avatar}>✦</div>
              <div className={[styles.bubble, styles.bubbleAI].join(' ')}>
                <div className={styles.typingWrap}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Suggested prompts ── */}
        <div className={styles.chips}>
          {SUGGESTED.map((p) => (
            <button
              key={p}
              type="button"
              className={styles.chip}
              onClick={() => sendMessage(p)}
              disabled={isLoading}
            >
              {p}
            </button>
          ))}
        </div>

        {/* ── Input bar ── */}
        <form className={styles.inputBar} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={season ? `Ask about ${season} season colors…` : 'Ask about colors, makeup, outfits…'}
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!input.trim() || isLoading}
            aria-label="Send"
          >
            {isLoading ? '···' : '↑'}
          </button>
        </form>

      </div>
    </main>
  )
}
