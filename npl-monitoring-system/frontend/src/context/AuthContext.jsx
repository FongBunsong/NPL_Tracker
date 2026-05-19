import { createContext, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { sheetRegister, sheetLogin, getScriptUrl } from '../services/authSheetService'

export const AuthContext = createContext(null)

const USERS_KEY   = 'npl_users'
const SESSION_KEY = 'npl_user'

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') } catch { return [] }
}
function saveLocalUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
function initials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('').slice(0, 2) || '?'
}
function persistSession(safeUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setLoading(true)
    try {
      const scriptUrl = getScriptUrl()

      if (scriptUrl) {
        // ── Google Sheets path ──
        const res = await sheetRegister(name, email, password)
        if (!res.success) {
          toast.error(res.error ?? 'Registration failed')
          return false
        }
        const safeUser = { ...res.user, avatar: initials(res.user.name) }
        setUser(safeUser)
        persistSession(safeUser)
        toast.success(`Welcome, ${safeUser.name}! Account saved to Google Sheets.`)
        return true
      }

      // ── localStorage fallback ──
      await new Promise(r => setTimeout(r, 400))
      const users = getLocalUsers()
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        toast.error('An account with this email already exists')
        return false
      }
      const newUser = { id: Date.now(), name, email, password, avatar: initials(name) }
      saveLocalUsers([...users, newUser])
      const { password: _pw, ...safeUser } = newUser
      setUser(safeUser)
      persistSession(safeUser)
      toast.success(`Welcome, ${name}! (Stored locally — connect Google Sheets in Settings to sync across devices)`)
      return true
    } catch (err) {
      // If the sheet call errored for any reason, try localStorage
      if (err.message !== 'NO_SCRIPT_URL') {
        toast.error('Could not reach Google Sheets. Saving locally instead.')
      }
      await new Promise(r => setTimeout(r, 300))
      const users = getLocalUsers()
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        toast.error('An account with this email already exists')
        return false
      }
      const newUser = { id: Date.now(), name, email, password, avatar: initials(name) }
      saveLocalUsers([...users, newUser])
      const { password: _pw, ...safeUser } = newUser
      setUser(safeUser)
      persistSession(safeUser)
      toast.success(`Welcome, ${name}!`)
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const scriptUrl = getScriptUrl()

      if (scriptUrl) {
        // ── Google Sheets path ──
        const res = await sheetLogin(email, password)
        if (!res.success) {
          toast.error(res.error ?? 'Invalid email or password')
          return false
        }
        const safeUser = { ...res.user, avatar: initials(res.user.name) }
        setUser(safeUser)
        persistSession(safeUser)
        toast.success(`Welcome back, ${safeUser.name}!`)
        return true
      }

      // ── localStorage fallback ──
      await new Promise(r => setTimeout(r, 400))
      const users = getLocalUsers()
      const match = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      if (match) {
        const { password: _pw, ...safeUser } = match
        setUser(safeUser)
        persistSession(safeUser)
        toast.success(`Welcome back, ${safeUser.name}!`)
        return true
      }
      toast.error('Invalid email or password')
      return false
    } catch (err) {
      // Sheet unreachable — try local fallback
      if (err.message !== 'NO_SCRIPT_URL') {
        toast.error('Could not reach Google Sheets — trying local accounts.')
      }
      const users = getLocalUsers()
      const match = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      if (match) {
        const { password: _pw, ...safeUser } = match
        setUser(safeUser)
        persistSession(safeUser)
        toast.success(`Welcome back, ${safeUser.name}! (offline mode)`)
        return true
      }
      toast.error('Invalid email or password')
      return false
    } finally {
      setLoading(false)
    }
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
