import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('demo@acme.com')
  const [password, setPassword] = useState('demo123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Errore di login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? 'Accesso...' : 'Entra'}</button>
      </form>
      <p className="muted">
        Dimenticata? <Link to="/forgot-password">Resetta la password</Link>
      </p>
      <p className="muted">
        Utente demo: <code>demo@acme.com</code> / <code>demo123</code>
      </p>
    </div>
  )
}
