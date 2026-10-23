import { cx } from '../../lib/cx'
import Icon from './Icon'

const TONES = {
  error: { box: 'border-attention bg-attention-tint text-attention', icon: 'error' },
  info: { box: 'border-rule bg-ground text-ink-2', icon: 'info' },
  success: { box: 'border-success bg-success-tint text-success', icon: 'check_circle' },
  caution: { box: 'border-caution bg-caution-tint text-caution', icon: 'warning' },
}

export function Notice({ tone = 'info', children, action, className }) {
  const t = TONES[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('flex items-start gap-2.5 rounded-sm border px-3.5 py-2.5 text-sm font-medium', t.box, className)}
    >
      <Icon name={t.icon} size={20} className="mt-px shrink-0" />
      <div className="flex-1">{children}</div>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, children, action }) {
  return (
    <div className="flex flex-col items-start gap-2 py-4">
      {icon && <Icon name={icon} size={28} className="text-ink-3" />}
      <p className="text-base font-semibold text-ink">{title}</p>
      {children && <p className="max-w-prose text-sm text-ink-2">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function SkeletonRows({ rows = 4, className }) {
  return (
    <div className={cx('flex flex-col gap-3', className)} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-5" style={{ width: `${92 - ((i * 13) % 30)}%` }} />
      ))}
    </div>
  )
}

export function Working({ children }) {
  return (
    <p role="status" className="flex items-center gap-2 text-sm font-medium text-ink-2">
      <Icon name="progress_activity" size={18} className="animate-spin text-brand" />
      {children}
    </p>
  )
}
