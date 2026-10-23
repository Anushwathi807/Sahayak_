import { useId, useState } from 'react'
import Button from './Button'
import Icon from './Icon'
import { Input } from './Field'

export default function TopicInput({ label = 'Topics', value, onChange, placeholder = 'Type a topic, then press Enter', hint, error }) {
  const id = useId()
  const [draft, setDraft] = useState('')

  const add = () => {
    const parts = draft
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .filter((t) => !value.includes(t))
    if (parts.length) onChange([...value, ...parts])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          invalid={!!error}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add()
            }
          }}
        />
        <Button variant="secondary" onClick={add} disabled={!draft.trim()}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1">
          {value.map((topic) => (
            <li key={topic} className="inline-flex items-center gap-1 rounded-sm border border-rule bg-ground py-1 pr-1 pl-2.5 text-sm">
              {topic}
              <button
                type="button"
                aria-label={`Remove ${topic}`}
                onClick={() => onChange(value.filter((t) => t !== topic))}
                className="flex h-6 w-6 items-center justify-center rounded-sm text-ink-2 hover:bg-rule hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {hint && !error && <p className="text-sm text-ink-2">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-attention">
          <Icon name="error" size={16} />
          {error}
        </p>
      )}
    </div>
  )
}
