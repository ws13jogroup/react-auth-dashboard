import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin } from './fakeApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    else localStorage.removeItem('auth_user')
  }, [user])

  const value = useMemo(() => ({
    user,
    async login(email, password) {
      const u = await apiLogin(email, password)
      setUser(u)
      return u
    },
    logout() {
      setUser(null)
    }
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
