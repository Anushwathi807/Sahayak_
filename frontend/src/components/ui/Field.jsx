import { useId } from 'react'
import { cx } from '../../lib/cx'
import Icon from './Icon'

const CONTROL =
  'w-full rounded-sm border bg-sheet px-3 text-base text-ink transition-colors focus:border-brand-2 disabled:bg-ground disabled:text-ink-3'

export function Field({ label, hint, error, children, className }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      {children({ id, describedBy: [hintId, errorId].filter(Boolean).join(' ') || undefined, invalid: !!error })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-ink-2">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-sm font-medium text-attention">
          <Icon name="error" size={16} />
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({ invalid, className, ...props }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cx(CONTROL, 'h-11', invalid ? 'border-attention' : 'border-field', className)}
      {...props}
    />
  )
}

export function TextArea({ invalid, className, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cx(CONTROL, 'resize-y py-2.5 leading-relaxed', invalid ? 'border-attention' : 'border-field', className)}
      {...props}
    />
  )
}

export function Select({ invalid, className, children, ...props }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cx(CONTROL, 'h-11 appearance-none pr-9', invalid ? 'border-attention' : 'border-field', className)}
        {...props}
      >
        {children}
      </select>
      <Icon name="expand_more" size={20} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-2" />
    </div>
  )
}
