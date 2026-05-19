import { useState, useContext } from 'react'
import { TrendingDown, Eye, EyeOff, Shield } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

export default function Login() {
  const { login, loading } = useContext(AuthContext)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [errors,   setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!email)    e.email    = 'Email is required'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    await login(email, password)
  }

  const fillDemo = (role) => {
    const creds = {
      admin:   { email: 'admin@nplmonitor.com',   password: 'admin123'   },
      officer: { email: 'officer@nplmonitor.com', password: 'officer123' },
      manager: { email: 'manager@nplmonitor.com', password: 'manager123' },
    }
    setEmail(creds[role].email)
    setPassword(creds[role].password)
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/40">
              <TrendingDown size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">NPL Monitor</h1>
            <p className="text-slate-400 text-sm mt-1">Non-Performing Loan Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@nplmonitor.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={13} className="text-slate-500" />
              <p className="text-xs text-slate-500 font-medium">Demo Accounts</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'admin',   label: 'Admin'   },
                { role: 'officer', label: 'Officer' },
                { role: 'manager', label: 'Manager' },
              ].map(({ role, label }) => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className="py-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-5">
          NPL Monitoring System v1.0 · Business Performance Tool
        </p>
      </div>
    </div>
  )
}
