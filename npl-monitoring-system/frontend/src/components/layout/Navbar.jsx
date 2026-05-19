import { useContext } from 'react'
import { Bell, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { LoanContext } from '../../context/LoanContext'

export default function Navbar({ title }) {
  const { kpis, loading, refreshData, lastUpdated } = useContext(LoanContext)
  const navigate = useNavigate()

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between fixed top-0 right-0 left-64 z-30">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
        {lastUpdated && (
          <p className="text-[11px] text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Active alerts pill */}
        {kpis.activeAlerts > 0 && (
          <button
            onClick={() => navigate('/alerts')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-100 hover:bg-red-100 transition-colors animate-pulse-slow"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {kpis.activeAlerts} Active Alert{kpis.activeAlerts !== 1 ? 's' : ''}
          </button>
        )}

        {/* Refresh */}
        <button
          onClick={refreshData}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw size={17} className={clsx(loading && 'animate-spin')} />
        </button>

        {/* Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Bell size={17} />
          {kpis.activeAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {kpis.activeAlerts > 9 ? '9+' : kpis.activeAlerts}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
