import { useState } from 'react'
import { requestPasswordReset } from '../auth/fakeApi.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ ok: false, msg: '' })
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus({ ok: false, msg: '' })
    try {
      const token = await requestPasswordReset(email.trim())
      const link = `${location.origin}/reset-password?token=${token}`
      setStatus({
        ok: true,
        msg: `Link di reset generato (solo demo): ${link} — valido 15 minuti.`
      })
    } catch (err) {
      setStatus({ ok: false, msg: err.message || 'Errore' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h1>Recupera Password</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <button disabled={loading}>{loading ? 'Invio...' : 'Invia link di reset'}</button>
      </form>
      {status.msg && (
        <p className={status.ok ? 'success' : 'error'} style={{wordBreak: 'break-all'}}>
          {status.msg}
        </p>
      )}
    </div>
  )
}
