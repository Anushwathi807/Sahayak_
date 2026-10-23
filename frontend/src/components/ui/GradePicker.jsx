import { GRADES } from '../../lib/constants'
import { cx } from '../../lib/cx'
import Icon from './Icon'

export default function GradePicker({ label = 'Grades', value, onChange, multiple = true, error }) {
  const toggle = (grade) => {
    if (!multiple) {
      onChange([grade])
      return
    }
    onChange(value.includes(grade) ? value.filter((g) => g !== grade) : [...value, grade].sort((a, b) => a - b))
  }
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {GRADES.map((grade) => {
          const selected = value.includes(grade)
          return (
            <button
              key={grade}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(grade)}
              className={cx(
                'inline-flex h-10 items-center gap-1.5 rounded-sm border px-3 text-sm font-semibold transition-colors',
                selected ? 'border-brand bg-brand text-white' : 'border-field bg-sheet text-ink hover:border-ink'
              )}
            >
              {selected && <Icon name="check" size={16} />}
              Grade {grade}
            </button>
          )
        })}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-attention">
          <Icon name="error" size={16} />
          {error}
        </p>
      )}
    </fieldset>
  )
}
