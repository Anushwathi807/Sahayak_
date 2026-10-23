import { LANGUAGES } from '../../lib/constants'
import { Field, Select } from './Field'

export default function LanguageSelect({ label = 'Language', value, onChange, hint }) {
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <Select id={id} aria-describedby={describedBy} value={value} onChange={(e) => onChange(e.target.value)}>
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>
      )}
    </Field>
  )
}
