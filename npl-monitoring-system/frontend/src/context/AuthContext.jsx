import { createContext, useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

// Demo credentials — replace with real auth API in production
const DEMO_USERS = [
  { id: 1, email: 'admin@nplmonitor.com',   password: 'admin123',   name: 'Admin User',    role: 'admin',   avatar: 'AU', branch: 'Head Office' },
  { id: 2, email: 'officer@nplmonitor.com', password: 'officer123', name: 'Loan Officer',  role: 'officer', avatar: 'LO', branch: 'Head Office' },
  { id: 3, email: 'manager@nplmonitor.com', password: 'manager123', name: 'Branch Manager',role: 'manager', avatar: 'BM', branch: 'Phnom Penh Branch' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('npl_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    // Simulate network latency
    await new Promise(r => setTimeout(r, 700))
    const match = DEMO_USERS.find(u => u.email === email && u.password === password)
    setLoading(false)
    if (match) {
      const { password: _pw, ...safeUser } = match
      setUser(safeUser)
      localStorage.setItem('npl_user', JSON.stringify(safeUser))
      toast.success(`Welcome back, ${safeUser.name}!`)
      return true
    }
    toast.error('Invalid email or password')
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('npl_user')
    toast.success('Logged out successfully')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
