import clsx from 'clsx'

export default function Input({ label, error, helper, className = '', prefix, suffix, ...props }) {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
            {prefix}
          </div>
        )}
        <input
          className={clsx(
            'w-full rounded-xl border bg-white text-sm text-gray-900 placeholder-gray-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300',
            prefix ? 'pl-9'  : 'pl-3.5',
            suffix ? 'pr-9'  : 'pr-3.5',
            'py-2.5'
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-sm">
            {suffix}
          </div>
        )}
      </div>
      {error  && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-xs text-gray-400">{helper}</p>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <select
        className={clsx(
          'w-full rounded-xl border bg-white text-sm text-gray-900 px-3.5 py-2.5 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:bg-gray-50 disabled:cursor-not-allowed',
          error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}
