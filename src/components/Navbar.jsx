import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const onLogout = () => {
    logout()
    if (location.pathname !== '/login') navigate('/login')
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="brand">React Auth Dashboard</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span className="user">👤 {user.email}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  )
}
