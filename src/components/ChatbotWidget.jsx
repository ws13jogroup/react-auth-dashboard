import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'

const FAB_SIZE = 56
const BOUNCE = 0.6
const FRICTION = 0.985
const THROW_THRESHOLD = 1   // px/ms
const SAMPLE_MS = 120
const CLICK_TOLERANCE = 5   // px: sotto → click; sopra → drag

export default function ChatbotWidget() {
  const { user } = useAuth()
  if (!user) return null

  const [pos, setPos] = useState(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    return { x: vw - FAB_SIZE - 24, y: vh - FAB_SIZE - 24 }
  })
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const bodyRef = useRef(null)
  const greetedRef = useRef(false)

  // --- Drag / fisica refs ---
  const draggingRef = useRef(false)
  const pointerIdRef = useRef(null)
  const startRef = useRef({ x: 0, y: 0 })
  const offsetRef = useRef({ dx: 0, dy: 0 })
  const velocityRef = useRef({ vx: 0, vy: 0 })
  const samplesRef = useRef([])
  const movedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const suppressTimeoutRef = useRef(null)
  const rafRef = useRef(null)

  // saluto iniziale
  useEffect(() => {
    if (open && !greetedRef.current) {
      setMessages([{ from: 'bot', text: `Ciao ${user.email}! Sono il tuo assistente 🤖. Chiedimi ciò che vuoi!` }])
      greetedRef.current = true
    }
  }, [open, user?.email])

  // autoscroll chat
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // bounds su resize
  useEffect(() => {
    function onResize() {
      const { x, y } = pos
      const maxX = Math.max(8, window.innerWidth - FAB_SIZE - 8)
      const maxY = Math.max(8, window.innerHeight - FAB_SIZE - 8)
      setPos({ x: clamp(x, 8, maxX), y: clamp(y, 8, maxY) })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [pos])

  // --- Handlers drag/click ---
  function onPointerDown(e) {
    e.stopPropagation()
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    draggingRef.current = true
    pointerIdRef.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)

    offsetRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
    startRef.current = { x: e.clientX, y: e.clientY }
    movedRef.current = false
    samplesRef.current = [{ t: performance.now(), x: pos.x, y: pos.y }]
    cancelInertia()
  }

  function onPointerMove(e) {
    if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return
    const nx = e.clientX - offsetRef.current.dx
    const ny = e.clientY - offsetRef.current.dy
    const bounded = boundToViewport(nx, ny)
    setPos(bounded)

    // segna se abbiamo superato la soglia "click"
    if (!movedRef.current) {
      const dx = e.clientX - startRef.current.x
      const dy = e.clientY - startRef.current.y
      if (Math.hypot(dx, dy) > CLICK_TOLERANCE) movedRef.current = true
    }

    const now = performance.now()
    samplesRef.current.push({ t: now, x: bounded.x, y: bounded.y })
    const cutoff = now - SAMPLE_MS
    while (samplesRef.current.length && samplesRef.current[0].t < cutoff) {
      samplesRef.current.shift()
    }
  }

  function onPointerUp(e) {
    if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return
    draggingRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)

    // se abbiamo trascinato oltre la soglia → sopprimi il prossimo click
    if (movedRef.current) {
      suppressNextClick()
    }

    // calcola velocità media
    const arr = samplesRef.current
    if (arr.length >= 2) {
      const first = arr[0]
      const last = arr[arr.length - 1]
      const dt = Math.max(1, last.t - first.t)
      const vx = (last.x - first.x) / dt
      const vy = (last.y - first.y) / dt
      velocityRef.current = { vx, vy }
      const speed = Math.hypot(vx, vy)

      if (speed > THROW_THRESHOLD) {
        // parte l'inerzia → sopprimi comunque il click che segue
        suppressNextClick()
        startInertia()
      }
    }
  }

  function suppressNextClick() {
    suppressClickRef.current = true
    clearTimeout(suppressTimeoutRef.current)
    suppressTimeoutRef.current = setTimeout(() => {
      suppressClickRef.current = false
    }, 200) // sufficiente a “mangiare” il click sintetico post-drag
  }

  // click “vero” (senza drag): apre/chiude
  function onFabClick() {
    if (draggingRef.current) return
    if (suppressClickRef.current) return
    setOpen(v => !v)
  }

  // inerzia + rimbalzi
  function startInertia() {
    cancelInertia()
    const step = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxX = vw - FAB_SIZE - 8
      const maxY = vh - FAB_SIZE - 8
      const minX = 8
      const minY = 8

      setPos(prev => {
        let { vx, vy } = velocityRef.current
        let nx = prev.x + vx * 16
        let ny = prev.y + vy * 16

        if (nx <= minX) { nx = minX; vx = -vx * BOUNCE }
        if (nx >= maxX) { nx = maxX; vx = -vx * BOUNCE }
        if (ny <= minY) { ny = minY; vy = -vy * BOUNCE }
        if (ny >= maxY) { ny = maxY; vy = -vy * BOUNCE }

        vx *= FRICTION
        vy *= FRICTION
        velocityRef.current = { vx, vy }
        return { x: nx, y: ny }
      })

      const { vx, vy } = velocityRef.current
      if (Math.hypot(vx, vy) < 0.02) {
        cancelInertia()
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function cancelInertia() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(prev => [...prev, { from: 'user', text }])
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: 'ehi! vacci piano. sto imparando solo adesso!' }])
    }, 400)
  }

  return (
    <div
      className="chatbot-wrapper"
      style={{ left: `${pos.x}px`, top: `${pos.y}px`, width: FAB_SIZE, height: FAB_SIZE }}
    >
      <button
        className="chatbot-fab"
        onClick={onFabClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label={open ? 'Chiudi chatbot' : 'Apri chatbot'}
        title={open ? 'Chiudi chatbot' : 'Apri chatbot'}
      >
        <svg data-name="ChatBot" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 426.5 362.6">
            <path d="M199.9,4.6c5.8-5,14.4-5.7,21.5-3.1,8,3.3,13.3,11.8,13.1,20.4,0,21.1,0,42.1,0,63.2,34.9,0,69.8,0,104.6,0,18.6-.9,36.9,11.6,42.4,29.5,2.3,6.5,2.3,13.4,2.3,20.2,0,19,0,38,0,57,6.9.2,14.1-.8,20.7,1.7,8.9,3.2,16.7,9.9,19.8,18.9,6.1,14.9-1.4,33.8-16.2,40.2-7.6,3.5-16.1,3.2-24.3,3.1,0,21.6.1,43.2-.1,64.8-.4,17.2-11.8,33.8-28.3,39.3-6.4,2.5-13.4,2.7-20.3,2.6-83,0-166.1,0-249.1,0-12.4,0-24.9-5.1-32.9-14.7-6.9-7.9-10.6-18.5-10.6-29,0-21,0-42,0-63.1-8.6.2-17.7.3-25.6-3.8-9.1-4.6-15.4-14.1-16.7-24.2-1.3-9.5,2.1-19.5,8.7-26.3,4.9-4.5,10.9-8,17.5-9.2,5.3-.7,10.8-.4,16.1-.5,0-21,0-42,0-63.1,0-10.8,3.9-21.5,11.1-29.5,8.1-8.7,19.7-14.2,31.6-14.1,35.5-.1,71.1,0,106.6,0,0-21.1,0-42.1,0-63.2,0-6.6,2.9-13.2,8-17.3ZM79.6,107.5c-9.4,2.2-16.2,11.9-15.7,21.4,0,63.7,0,127.3,0,190.9-.3,11.3,9.9,21.7,21.3,21.3,85.3,0,170.6,0,255.9,0,9.9.4,19.4-7.5,20.9-17.3.8-4.9.3-9.9.4-14.9,0-58.3,0-116.6,0-175,0-4.6.3-9.4-1.5-13.8-2.2-5.1-6.2-9.5-11.3-11.7-5.2-2.1-11-1.7-16.5-1.7-82,0-164,0-246,0-2.6,0-5.1.2-7.6.8Z"/>
            <path  d="M132.5,171.2c10.4-1.9,21.9,1.2,29.1,9.3,9.8,9.9,11.7,26.3,4.5,38.3-5,8.5-14.1,14.4-23.9,15.5-10.8,1.4-21.8-3.5-28.7-11.8-8.9-10.9-9.1-27.7-.7-38.9,4.7-6.4,11.8-11,19.6-12.4Z"/>
            <path d="M280.7,171.4c9.1-1.9,19.1-.2,26.5,5.6,7.1,5.4,11.7,13.9,12.5,22.9.6,7.6-1.6,15.3-6,21.5-5.5,7-13.7,12-22.6,12.8-16.4,2.1-33.1-10.8-34.8-27.3-2.5-15.8,8.7-32.3,24.4-35.5Z"/>
            <path  d="M145.6,267.3c5.9-2,11.7,1.6,17.2,3,31.9,9.8,66.6,9.9,98.7.7,4.9-1.4,9.6-3.6,14.7-4.3,6.9-.9,13.1,6.5,11.3,13.1-1,3.1-3.3,5.8-6.4,7.1-13.2,4.9-26.9,8.7-41,10.3-23.8,4.1-48.3,2-71.8-3.2-6.7-1.3-13-3.8-19.5-5.8-3.5-1-7.1-2.8-8.9-6.1-3.3-5.3,0-12.6,5.6-14.7Z"/>
        </svg>
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Chatbot">
          <div className="chatbot-header">
            <span>Assistente 🤖</span>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Chiudi">✕</button>
          </div>

          <div className="chatbot-body" ref={bodyRef}>
            {messages.length === 0 && <p className="chatbot-hint">Scrivi un messaggio per iniziare…</p>}
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
          </div>

          <form className="chatbot-footer" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Scrivi qui..."
              value={input}
              onChange={e => setInput(e.target.value)}
              aria-label="Messaggio"
            />
            <button type="submit">Invia</button>
          </form>
        </div>
      )}
    </div>
  )
}

// --- helpers ---
function clamp(v, min, max) { return Math.min(Math.max(v, min), max) }
function boundToViewport(x, y) {
  const maxX = Math.max(8, window.innerWidth - FAB_SIZE - 8)
  const maxY = Math.max(8, window.innerHeight - FAB_SIZE - 8)
  return { x: clamp(x, 8, maxX), y: clamp(y, 8, maxY) }
}
