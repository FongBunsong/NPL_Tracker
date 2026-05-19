import { NavLink, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import {
  LayoutDashboard, CreditCard, Users, Bell,
  FileText, BarChart3, Settings, TrendingDown, LogOut,
} from 'lucide-react'
import clsx from 'clsx'
import { AuthContext } from '../../context/AuthContext'
import { LoanContext } from '../../context/LoanContext'
import { formatPercent } from '../../utils/formatCurrency'

const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard',  icon: LayoutDashboard, exact: true  },
  { path: '/loans',     label: 'Loans',      icon: CreditCard,      exact: false },
  { path: '/customers', label: 'Customers',  icon: Users,           exact: false },
  { path: '/alerts',    label: 'Alerts',     icon: Bell,            exact: false, badge: true },
  { path: '/reports',   label: 'Reports',    icon: FileText,        exact: false },
  { path: '/analytics', label: 'Analytics',  icon: BarChart3,       exact: false },
  { path: '/settings',  label: 'Settings',   icon: Settings,        exact: false },
]

export default function Sidebar() {
  const { user, logout }  = useContext(AuthContext)
  const { kpis }          = useContext(LoanContext)
  const location          = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 flex flex-col z-40 overflow-hidden">

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
            <TrendingDown size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">NPL Monitor</p>
            <p className="text-slate-500 text-[11px]">Loan Risk System</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-3 pb-2.5">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ path, label, icon: Icon, badge, exact }) => {
          const active = exact
            ? location.pathname === path
            : location.pathname.startsWith(path)

          return (
            <NavLink
              key={path}
              to={path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && kpis.activeAlerts > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white min-w-[20px] text-center">
                  {kpis.activeAlerts > 9 ? '9+' : kpis.activeAlerts}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Portfolio Health Widget ── */}
      <div className="mx-3 mb-3 p-3.5 bg-slate-800 rounded-xl border border-slate-700/50 flex-shrink-0">
        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mb-2">
          Portfolio Health
        </p>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className={clsx('text-2xl font-bold leading-none', kpis.nplRatio > 5 ? 'text-red-400' : 'text-green-400')}>
              {formatPercent(kpis.nplRatio, 1)}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">NPL Ratio</p>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-bold">{kpis.nplCount}</p>
            <p className="text-slate-500 text-[11px]">NPL Loans</p>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500', kpis.nplRatio > 5 ? 'bg-red-500' : 'bg-green-500')}
            style={{ width: `${Math.min((kpis.nplRatio ?? 0) * 5, 100)}%` }}
          />
        </div>
        {kpis.nplRatio > 5 && (
          <p className="text-red-400 text-[10px] mt-1.5 font-medium">⚠ Exceeds 5% threshold</p>
        )}
      </div>

      {/* ── User Profile ── */}
      <div className="px-3 pb-4 border-t border-slate-700/50 pt-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.avatar ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-slate-500 text-[11px] capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-700/50"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

    </aside>
  )
}
