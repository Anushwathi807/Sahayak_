import { cx } from '../../lib/cx'
import Icon from './Icon'

// A ruled radio list: one hairline per option, the filled radio mark carries the selection.
export default function ChoiceGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      <div className="divide-y divide-rule border-y border-rule">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <label
              key={option.value}
              className={cx(
                'flex cursor-pointer items-start gap-3 px-2 py-2.5 transition-colors sm:items-center',
                selected ? 'bg-brand-tint' : 'hover:bg-ground'
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <Icon
                name={selected ? 'radio_button_checked' : 'radio_button_unchecked'}
                size={20}
                className={cx('shrink-0 max-sm:mt-0.5', selected ? 'text-brand' : 'text-ink-3')}
              />
              <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                <span className={cx('text-base text-ink', selected ? 'font-semibold' : 'font-medium')}>{option.label}</span>
                {option.hint && <span className="text-sm text-ink-2">{option.hint}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
