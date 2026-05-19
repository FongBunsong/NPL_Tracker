import { createContext, useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

const USERS_KEY   = 'npl_users'
const SESSION_KEY = 'npl_user'

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') } catch { return [] }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
function initials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('').slice(0, 2) || '?'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const register = useCallback(async (name, email, password) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const users = getUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setLoading(false)
      toast.error('An account with this email already exists')
      return false
    }
    const newUser = { id: Date.now(), name, email, password, avatar: initials(name) }
    saveUsers([...users, newUser])
    const { password: _pw, ...safeUser } = newUser
    setUser(safeUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
    setLoading(false)
    toast.success(`Welcome, ${name}!`)
    return true
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const users = getUsers()
    const match = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    setLoading(false)
    if (match) {
      const { password: _pw, ...safeUser } = match
      setUser(safeUser)
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
      toast.success(`Welcome back, ${safeUser.name}!`)
      return true
    }
    toast.error('Invalid email or password')
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
    toast.success('Logged out')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
