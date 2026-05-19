import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost:     'hover:bg-gray-100 text-gray-600',
  success:   'bg-green-600 hover:bg-green-700 text-white shadow-sm',
  warning:   'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
  outline:   'border border-blue-600 text-blue-600 hover:bg-blue-50',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs  rounded-md',
  sm: 'px-3   py-1.5 text-sm  rounded-lg',
  md: 'px-4   py-2   text-sm  rounded-lg',
  lg: 'px-5   py-2.5 text-base rounded-xl',
}

export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  className = '',
  icon: Icon,
  iconRight = false,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : (Icon && !iconRight)
          ? <Icon size={16} />
          : null
      }
      {children}
      {Icon && iconRight && !loading && <Icon size={16} />}
    </button>
  )
}
