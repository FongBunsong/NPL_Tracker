import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg       = 'bg-blue-100',
  iconColor    = 'text-blue-600',
  trend,        // 'up' | 'down' | 'flat'
  trendValue,
  trendLabel,
  trendGood,   // true if up = good (e.g. collection rate), false if up = bad (e.g. NPL ratio)
  alert        = false,
  className    = '',
}) {
  const TrendIcon  = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendBad   = (trend === 'up' && !trendGood) || (trend === 'down' && trendGood)
  const trendColor = trendBad ? 'text-red-500' : 'text-green-600'

  return (
    <div
      className={clsx(
        'kpi-card',
        alert && 'border-red-200 bg-red-50/40',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium mb-1 truncate">{title}</p>
          <p className={clsx('text-2xl font-extrabold tracking-tight', alert ? 'text-red-600' : 'text-gray-900')}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>
          )}
          {trendValue !== undefined && (
            <div className={clsx('flex items-center gap-1 mt-2 text-xs font-semibold', trendColor)}>
              <TrendIcon size={13} />
              <span>{trendValue}</span>
              {trendLabel && <span className="font-normal text-gray-400">{trendLabel}</span>}
            </div>
          )}
        </div>

        <div className={clsx(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          alert ? 'bg-red-100' : iconBg
        )}>
          <Icon size={20} className={alert ? 'text-red-600' : iconColor} />
        </div>
      </div>
    </div>
  )
}
