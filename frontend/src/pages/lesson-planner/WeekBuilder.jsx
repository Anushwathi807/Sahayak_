import { useState } from 'react'
import Button from '../../components/ui/Button'
import { Notice, Working } from '../../components/ui/Feedback'
import { Field, Input } from '../../components/ui/Field'
import GradePicker from '../../components/ui/GradePicker'
import Icon from '../../components/ui/Icon'
import LanguageSelect from '../../components/ui/LanguageSelect'
import Sheet from '../../components/ui/Sheet'
import SubjectInk from '../../components/ui/SubjectInk'
import TopicInput from '../../components/ui/TopicInput'
import { WEEKDAYS, formatGrades } from '../../lib/constants'
import { cx } from '../../lib/cx'

const EMPTY_DRAFT = { subject: '', topics: [], grades: [] }

export default function WeekBuilder({ week, setWeek, language, setLanguage, defaultGrades, onGenerate, generating, error }) {
  const [day, setDay] = useState('Monday')
  const [draft, setDraft] = useState({ ...EMPTY_DRAFT, grades: defaultGrades })
  const [errors, setErrors] = useState({})
  const [problem, setProblem] = useState('')

  const addSubject = (e) => {
    e.preventDefault()
    const found = {}
    if (!draft.subject.trim()) found.subject = 'Enter a subject.'
    if (draft.topics.length === 0) found.topics = 'Add at least one topic.'
    if (draft.grades.length === 0) found.grades = 'Choose the grades that take this subject.'
    setErrors(found)
    if (Object.keys(found).length) return
    setWeek({ ...week, [day]: [...(week[day] || []), { subject: draft.subject.trim(), topics: draft.topics, grades: draft.grades }] })
    setDraft({ ...EMPTY_DRAFT, grades: draft.grades })
  }

  const remove = (d, index) => setWeek({ ...week, [d]: week[d].filter((_, i) => i !== index) })

  const plannedDays = WEEKDAYS.filter((d) => week[d]?.length)

  const generate = () => {
    if (plannedDays.length === 0) {
      setProblem('Add at least one subject to at least one day.')
      return
    }
    setProblem('')
    onGenerate()
  }

  return (
    <div className="flex flex-col gap-8">
      <Sheet title="Build your week" description="For each day, add the subjects you teach, their topics and which grades take them.">
        <div role="tablist" aria-label="Day" className="mb-5 flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => {
            const count = week[d]?.length || 0
            return (
              <button
                key={d}
                role="tab"
                type="button"
                aria-selected={d === day}
                onClick={() => setDay(d)}
                className={cx(
                  'flex h-10 items-center gap-2 rounded-sm border px-4 text-sm font-semibold',
                  d === day ? 'border-ink bg-ink text-white' : 'border-field bg-sheet text-ink hover:border-ink'
                )}
              >
                {d}
                {count > 0 && <span className="tabular-nums">({count})</span>}
              </button>
            )
          })}
        </div>

        {week[day]?.length > 0 && (
          <ul className="mb-5 flex flex-col border-y border-rule">
            {week[day].map((s, i) => (
              <li key={i} className="flex items-center gap-3 border-b border-rule px-1 py-2.5 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <SubjectInk subject={s.subject} className="font-semibold" />
                  <p className="text-sm text-ink-2">
                    {s.topics.join(', ')} · {formatGrades(s.grades)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${s.subject} from ${day}`}
                  onClick={() => remove(day, i)}
                  className="flex h-9 w-9 items-center justify-center rounded-sm text-ink-2 hover:bg-attention-tint hover:text-attention"
                >
                  <Icon name="delete" size={20} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-ink pt-5">
        <form onSubmit={addSubject} className="flex max-w-2xl flex-col gap-5">
          <p className="font-display text-base font-semibold">Add a subject to {day}</p>
          <Field label="Subject" error={errors.subject}>
            {({ id, invalid }) => (
              <Input id={id} invalid={invalid} value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} placeholder="For example: Science" />
            )}
          </Field>
          <TopicInput label="Topics" value={draft.topics} onChange={(topics) => setDraft({ ...draft, topics })} error={errors.topics} />
          <GradePicker label="Grades taking it" value={draft.grades} onChange={(grades) => setDraft({ ...draft, grades })} error={errors.grades} />
          <div>
            <Button type="submit" variant="secondary" icon="add">
              Add to {day}
            </Button>
          </div>
        </form>
        </div>
      </Sheet>

      <Sheet title="Your week so far">
        {plannedDays.length === 0 ? (
          <p className="text-sm text-ink-2">No subjects added yet. Days you leave empty get no plan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
                  <th className="py-2 pr-3">Day</th>
                  <th className="py-2 pr-3">Subject</th>
                  <th className="py-2 pr-3">Topics</th>
                  <th className="py-2">Grades</th>
                </tr>
              </thead>
              <tbody>
                {plannedDays.flatMap((d) =>
                  week[d].map((s, i) => (
                    <tr key={`${d}-${i}`} className="border-b border-rule">
                      <td className="py-2.5 pr-3 font-semibold">{i === 0 ? d : ''}</td>
                      <td className="py-2.5 pr-3">
                        <SubjectInk subject={s.subject} />
                      </td>
                      <td className="py-2.5 pr-3 text-sm">{s.topics.join(', ')}</td>
                      <td className="py-2.5 text-sm tabular-nums">{s.grades.join(', ')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 grid grid-cols-1 items-end gap-4 border-t border-rule pt-5 sm:grid-cols-[minmax(0,240px)_auto]">
          <LanguageSelect label="Plan language" value={language} onChange={setLanguage} />
          <Button icon="edit_calendar" onClick={generate} loading={generating} loadingLabel="Writing the plan">
            Write the weekly plan
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3 empty:hidden">
          {generating && <Working>Planning activities for every grade. This takes 15 to 40 seconds.</Working>}
          {problem && <Notice tone="error">{problem}</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
        </div>
      </Sheet>
    </div>
  )
}
