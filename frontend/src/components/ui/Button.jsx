import { Link } from 'react-router-dom'
import { cx } from '../../lib/cx'
import Icon from './Icon'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-sm font-semibold whitespace-nowrap select-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50'

const SIZES = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-12 px-6 text-lg',
}

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-deep',
  secondary: 'border border-ink bg-sheet text-ink hover:bg-ground',
  danger: 'border border-attention bg-sheet text-attention hover:bg-attention-tint',
  onBrand: 'bg-sheet text-brand hover:bg-brand-tint',
  outlineOnBrand: 'border border-white text-white hover:bg-brand-deep',
  quiet: 'text-entry underline-offset-4 hover:underline',
}

export function buttonClass({ variant = 'primary', size = 'md', className } = {}) {
  return cx(BASE, variant === 'quiet' ? 'h-auto px-0' : SIZES[size], VARIANTS[variant], className)
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  loadingLabel,
  children,
  className,
  type = 'button',
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, className })}
      {...rest}
    >
      {loading ? (
        <Icon name="progress_activity" size={18} className="animate-spin" />
      ) : (
        icon && <Icon name={icon} size={size === 'sm' ? 18 : 20} />
      )}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  )
}

export function ButtonLink({ to, variant = 'primary', size = 'md', icon, children, className, ...rest }) {
  return (
    <Link to={to} className={buttonClass({ variant, size, className })} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 18 : 20} />}
      {children}
    </Link>
  )
}
