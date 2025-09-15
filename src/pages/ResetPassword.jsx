import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../auth/fakeApi.js'

export default function ResetPassword() {
  const [sp] = useSearchParams()
  const token = sp.get('token')
  const navigate = useNavigate()

  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) setMsg('Token mancante. Richiedi un nuovo reset.')
  }, [token])

  async function onSubmit(e) {
    e.preventDefault()
    if (pwd.length < 6) return setMsg('La password deve avere almeno 6 caratteri.')
    if (pwd !== confirm) return setMsg('Le password non coincidono.')
    setLoading(true)
    setMsg('')
    try {
      await resetPassword(token, pwd)
      setMsg('Password aggiornata! Ora puoi effettuare il login.')
      setTimeout(() => navigate('/login', { replace: true }), 1000)
    } catch (err) {
      setMsg(err.message || 'Errore')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h1>Reset Password</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Nuova password
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required />
        </label>
        <label>
          Conferma password
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </label>
        <button disabled={!token || loading}>{loading ? 'Aggiorno...' : 'Aggiorna password'}</button>
      </form>
      {msg && <p className="muted">{msg}</p>}
    </div>
  )
}
