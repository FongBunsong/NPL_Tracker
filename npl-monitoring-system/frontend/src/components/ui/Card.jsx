import clsx from 'clsx'

export default function Card({ children, className = '', padding = true, hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        padding && 'p-5',
        hover   && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={clsx('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-gray-900 leading-tight">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 ml-3">{action}</div>}
    </div>
  )
}
