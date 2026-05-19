import { AlertTriangle, AlertCircle, Info, CheckCircle2, Clock, Download, Filter } from 'lucide-react'
import { useAlerts } from '../hooks/useAlerts'
import { getAlertStyles, getAlertTypeLabel } from '../services/alertService'
import { exportAlertsToExcel } from '../utils/exportExcel'
import { formatCurrency, timeAgo, formatDate } from '../utils/formatCurrency'
import { PriorityBadge } from '../components/dashboard/RiskBadge'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import clsx from 'clsx'

const PRIORITY_ICONS = {
  critical: { Icon: AlertTriangle, color: 'text-red-500'    },
  high:     { Icon: AlertCircle,   color: 'text-orange-500' },
  medium:   { Icon: Info,          color: 'text-amber-500'  },
  low:      { Icon: Info,          color: 'text-blue-400'   },
}

const STATUS_TABS = [
  { value: 'all',          label: 'All Alerts'  },
  { value: 'active',       label: 'Active'      },
  { value: 'acknowledged', label: 'Acknowledged'},
  { value: 'resolved',     label: 'Resolved'    },
]

export default function Alerts() {
  const {
    alerts, allAlerts, stats,
    statusFilter,   setStatusFilter,
    priorityFilter, setPriorityFilter,
    acknowledgeAlert, resolveAlert,
  } = useAlerts()

  return (
    <div className="space-y-5">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',    value: stats.total,        color: 'text-gray-900',   bg: 'bg-gray-100',   icon: Filter      },
          { label: 'Active',   value: stats.active,       color: 'text-red-600',    bg: 'bg-red-100',    icon: AlertTriangle },
          { label: 'Acknowledged', value: stats.acknowledged, color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertCircle },
          { label: 'Resolved', value: stats.resolved,     color: 'text-green-600',  bg: 'bg-green-100',  icon: CheckCircle2 },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={clsx('text-3xl font-extrabold mt-0.5', color)}>{value}</p>
              </div>
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                <Icon size={18} className={color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Filters + Export ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Status tabs */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={clsx(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                statusFilter === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({stats[tab.value] ?? 0})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          <Button
            variant="secondary" size="sm" icon={Download}
            onClick={() => exportAlertsToExcel(allAlerts)}
          >
            Export
          </Button>
        </div>
      </div>

      {/* ── Alert List ── */}
      <div className="space-y-2.5">
        {alerts.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle2 size={40} className="text-green-300 mb-3" />
              <p className="text-gray-500 font-semibold">No alerts in this view</p>
              <p className="text-sm text-gray-400 mt-1">
                {statusFilter !== 'all' ? 'Try switching to "All Alerts"' : 'All quiet!'}
              </p>
            </div>
          </Card>
        ) : alerts.map(alert => {
          const styles = getAlertStyles(alert.priority)
          const { Icon, color } = PRIORITY_ICONS[alert.priority] ?? PRIORITY_ICONS.low
          const isActive = alert.status === 'active'

          return (
            <div
              key={alert.id}
              className={clsx(
                'bg-white rounded-2xl border p-4 transition-all',
                isActive ? `${styles.border} border` : 'border-gray-100',
                alert.status === 'resolved' && 'opacity-70'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Priority icon */}
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', styles.bg)}>
                  <Icon size={17} className={color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <PriorityBadge priority={alert.priority} />
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', styles.badge)}>
                      {getAlertTypeLabel(alert.type)}
                    </span>
                    {alert.loanId && (
                      <span className="font-mono text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {alert.loanId}
                      </span>
                    )}
                    {alert.customerName && (
                      <span className="text-xs text-gray-600 font-medium">{alert.customerName}</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">{alert.message}</p>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock size={11} />
                      <span>{timeAgo(alert.createdAt)} · {formatDate(alert.createdAt)}</span>
                    </div>
                    {alert.amount && (
                      <span className="text-[11px] font-semibold text-gray-500">
                        {formatCurrency(alert.amount)}
                      </span>
                    )}
                    {alert.resolvedAt && (
                      <span className="text-[11px] text-green-600">
                        Resolved {timeAgo(alert.resolvedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {alert.status === 'active' && (
                    <>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  {alert.status === 'resolved' && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                      <CheckCircle2 size={13} /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
