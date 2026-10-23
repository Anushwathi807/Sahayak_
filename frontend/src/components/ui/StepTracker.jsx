import { cx } from '../../lib/cx'
import Icon from './Icon'

// State is carried by the mark as well as colour: done = filled check, current = filled number,
// upcoming = outlined number.
export default function StepTracker({ steps, current, completed = [], onSelect }) {
  return (
    <nav aria-label="Steps" className="mb-8 print:hidden">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-3">
        {steps.map((step, index) => {
          const isCurrent = step.id === current
          const isDone = completed.includes(step.id) && !isCurrent
          const reachable = isDone || isCurrent
          const mark = (
            <span
              className={cx(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-display text-sm font-bold',
                isDone && 'border-brand bg-brand text-white',
                isCurrent && 'border-ink bg-ink text-white',
                !isDone && !isCurrent && 'border-rule bg-sheet text-ink-3'
              )}
            >
              {isDone ? <Icon name="check" size={18} /> : index + 1}
            </span>
          )
          const label = (
            <span className={cx('text-base', isCurrent ? 'font-semibold text-ink' : isDone ? 'text-ink' : 'text-ink-3')}>
              {step.label}
            </span>
          )
          return (
            <li key={step.id} className="flex items-center gap-3">
              {index > 0 && <span aria-hidden="true" className="h-px w-6 bg-rule max-sm:hidden" />}
              {reachable && onSelect && !isCurrent ? (
                <button
                  type="button"
                  onClick={() => onSelect(step.id)}
                  className="flex items-center gap-2.5 rounded-sm hover:underline"
                >
                  {mark}
                  {label}
                </button>
              ) : (
                <span className="flex items-center gap-2.5" aria-current={isCurrent ? 'step' : undefined}>
                  {mark}
                  {label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
