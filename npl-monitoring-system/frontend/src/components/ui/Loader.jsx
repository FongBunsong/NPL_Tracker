import clsx from 'clsx'

export default function Loader({ size = 'md', text = 'Loading...', fullPage = false }) {
  const ring = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' }
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3',
        fullPage && 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50'
      )}
    >
      <div
        className={clsx(
          'border-gray-200 border-t-blue-600 rounded-full animate-spin',
          ring[size] ?? ring.md
        )}
      />
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 7 }) {
  return (
    <div className="animate-pulse space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3.5 border-b border-gray-50 px-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-3.5 bg-gray-100 rounded-full flex-1"
              style={{ maxWidth: j === 0 ? 90 : j === 1 ? 140 : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function KPISkeleton() {
  return (
    <div className="kpi-card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 bg-gray-100 rounded-full w-28 mb-3" />
          <div className="h-7 bg-gray-200 rounded-full w-24 mb-2" />
          <div className="h-2.5 bg-gray-100 rounded-full w-20" />
        </div>
        <div className="w-11 h-11 bg-gray-100 rounded-xl ml-3" />
      </div>
    </div>
  )
}
