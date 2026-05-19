import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ArrowRight, Clock, X } from 'lucide-react'
import clsx from 'clsx'
import { LoanContext } from '../../context/LoanContext'
import { getAlertStyles, getAlertTypeLabel } from '../../services/alertService'
import { timeAgo } from '../../utils/formatCurrency'

const PRIORITY_ICONS = {
  critical: AlertTriangle,
  high:     AlertCircle,
  medium:   Info,
  low:      Info,
}

export default function AlertPanel({ maxItems = 6 }) {
  const { alerts, acknowledgeAlert } = useContext(LoanContext)
  const navigate = useNavigate()

  const active = alerts
    .filter(a => a.status === 'active')
    .slice(0, maxItems)

  if (active.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 size={36} className="text-green-400 mb-3" />
        <p className="text-gray-600 font-semibold">All clear!</p>
        <p className="text-sm text-gray-400 mt-1">No active alerts at this time</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {active.map(alert => {
        const styles  = getAlertStyles(alert.priority)
        const Icon    = PRIORITY_ICONS[alert.priority] ?? Info

        return (
          <div
            key={alert.id}
            className={clsx(
              'flex items-start gap-3 p-3 rounded-xl border transition-colors',
              styles.bg,
              styles.border
            )}
          >
            {/* Icon */}
            <Icon size={15} className={clsx('flex-shrink-0 mt-0.5', styles.text)} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', styles.badge)}>
                  {getAlertTypeLabel(alert.type)}
                </span>
                {alert.customerName && (
                  <span className="text-[11px] text-gray-500 font-medium truncate">
                    {alert.customerName}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{alert.message}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock size={10} className="text-gray-400" />
                <span className="text-[10px] text-gray-400">{timeAgo(alert.createdAt)}</span>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => acknowledgeAlert(alert.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-0.5 rounded"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}

      <button
        onClick={() => navigate('/alerts')}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors border border-dashed border-blue-200 mt-1"
      >
        View all alerts <ArrowRight size={13} />
      </button>
    </div>
  )
}
