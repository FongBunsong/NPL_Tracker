import clsx from 'clsx'

const BADGE_MAP = {
  'Pass':            'bg-green-100  text-green-700  border border-green-200',
  'Special Mention': 'bg-amber-100  text-amber-700  border border-amber-200',
  'Substandard':     'bg-orange-100 text-orange-700 border border-orange-200',
  'Doubtful':        'bg-red-100    text-red-700    border border-red-200',
  'Loss':            'bg-red-950/10 text-red-900    border border-red-300 font-bold',
}

const DOT_MAP = {
  'Pass':            'bg-green-500',
  'Special Mention': 'bg-amber-500',
  'Substandard':     'bg-orange-500',
  'Doubtful':        'bg-red-500',
  'Loss':            'bg-red-900',
}

export default function RiskBadge({ classification, showDot = false, size = 'sm' }) {
  const style   = BADGE_MAP[classification] ?? 'bg-gray-100 text-gray-600 border border-gray-200'
  const dotClr  = DOT_MAP[classification]   ?? 'bg-gray-400'

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
        style
      )}
    >
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotClr)} />}
      {classification}
    </span>
  )
}

export function NPLBadge({ isNPL }) {
  return isNPL ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-red-200 animate-pulse" />
      NPL
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700 border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Performing
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const styles = {
    critical: 'bg-red-100    text-red-700    border border-red-200',
    high:     'bg-orange-100 text-orange-700 border border-orange-200',
    medium:   'bg-amber-100  text-amber-700  border border-amber-200',
    low:      'bg-blue-100   text-blue-700   border border-blue-200',
  }
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide', styles[priority] ?? styles.low)}>
      {priority}
    </span>
  )
}
