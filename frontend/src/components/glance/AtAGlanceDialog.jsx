import { Link } from 'react-router-dom'
import { useTeacher } from '../../contexts/TeacherContext'
import { sortWeakestFirst, useClassProgress } from '../../hooks/useClassProgress'
import { ACTIVITY_LABELS, formatGrades, longDate, todayWeekday } from '../../lib/constants'
import { ATTENTION_BELOW } from '../../lib/grades'
import { periodsForDay } from '../../lib/schedule'
import { BandChip, BandStrip } from '../ui/Band'
import Button, { ButtonLink } from '../ui/Button'
import Dialog from '../ui/Dialog'
import { EmptyState, Notice, SkeletonRows } from '../ui/Feedback'
import Icon from '../ui/Icon'
import SubjectInk from '../ui/SubjectInk'

const TABLE_LIMIT = 6

function ClassProgress({ progress, onNavigate }) {
  if (progress.status === 'loading' || progress.status === 'idle') return <SkeletonRows rows={6} />
  if (progress.status === 'error') {
    return (
      <Notice tone="error" action={<Button size="sm" variant="secondary" onClick={progress.refresh}>Try again</Button>}>
        {progress.error}
      </Notice>
    )
  }
  const { rows, distribution, assessedCount } = progress.data
  if (rows.length === 0) {
    return (
      <EmptyState
        icon="group_add"
        title="No students on your roster yet"
        action={<ButtonLink to="/students" size="sm" onClick={onNavigate}>Add students</ButtonLink>}
      >
        Add your students and enter quiz marks. Their grade bands will appear here every time you open Sahayak.
      </EmptyState>
    )
  }
  const sorted = sortWeakestFirst(rows)
  const needHelp = sorted.filter((r) => r.average != null && Math.round(r.average) < ATTENTION_BELOW)
  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto">
        <table className="w-full sm:min-w-[460px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide text-ink uppercase">
              <th className="py-2 pr-3">Student</th>
              <th className="py-2 pr-3 max-sm:hidden">Grade</th>
              <th className="py-2 pr-3 text-right max-sm:hidden">Quizzes</th>
              <th className="py-2 pr-3 text-right">Average</th>
              <th className="py-2">Band</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, TABLE_LIMIT).map(({ student, attempts, average, band }) => {
              const low = average != null && Math.round(average) < ATTENTION_BELOW
              return (
                <tr key={student.id} className="border-b border-rule">
                  <td className="py-2.5 pr-3 font-medium">{student.name}</td>
                  <td className="py-2.5 pr-3 tabular-nums max-sm:hidden">{student.grade}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums max-sm:hidden">{attempts.length}</td>
                  <td
                    className={`py-2.5 pr-3 text-right font-semibold tabular-nums ${
                      low ? 'text-attention underline decoration-2 underline-offset-4' : 'text-entry'
                    }`}
                  >
                    {average == null ? '' : `${Math.round(average)}%`}
                  </td>
                  <td className="py-2.5">
                    <BandChip band={band} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length > TABLE_LIMIT && (
          <p className="mt-2 text-sm text-ink-2">
            Showing the {TABLE_LIMIT} weakest of {rows.length} students.
          </p>
        )}
      </div>
      {assessedCount > 0 ? (
        <>
          <BandStrip counts={distribution} total={assessedCount} />
          {needHelp.length > 0 ? (
            <p className="text-sm font-semibold text-attention">
              {needHelp.length} below {ATTENTION_BELOW}%: {needHelp.map((r) => r.student.name).join(', ')}
            </p>
          ) : (
            <p className="text-sm font-medium text-success">No student is below {ATTENTION_BELOW}%.</p>
          )}
        </>
      ) : (
        <Notice tone="info">No marks entered yet. Record a quiz on the Students page to see grade bands.</Notice>
      )}
    </div>
  )
}

function TodayPeriods({ onNavigate }) {
  const { lessonPlan, loaded } = useTeacher()
  const day = todayWeekday()
  if (!loaded) return <SkeletonRows rows={4} />
  if (!lessonPlan) {
    return (
      <EmptyState
        icon="calendar_add_on"
        title="No lesson plan saved"
        action={<ButtonLink to="/lesson-planner" size="sm" onClick={onNavigate}>Plan the week</ButtonLink>}
      >
        Plan your week once and today's periods will show here.
      </EmptyState>
    )
  }
  const periods = periodsForDay(lessonPlan, day)
  if (periods.length === 0) {
    return (
      <EmptyState
        icon="event_busy"
        title={`Nothing planned for ${day}`}
        action={<ButtonLink to="/lesson-planner" size="sm" variant="secondary" onClick={onNavigate}>Open lesson planner</ButtonLink>}
      >
        Your saved plan covers {lessonPlan.result.days.map((d) => d.day).join(', ')}.
      </EmptyState>
    )
  }
  return (
    <div>
      <ul className="flex flex-col">
        {periods.map((p) => (
          <li key={`${p.subject}-${p.topics.join()}`} className="border-b border-rule py-3 first:pt-0">
            <SubjectInk subject={p.subject} className="font-display text-base font-semibold">
              {p.subject} · {formatGrades(p.grades)}
            </SubjectInk>
            <p className="mt-0.5 text-sm text-ink-2">{p.topics.join(', ')}</p>
            <ul className="mt-1.5 flex flex-col gap-0.5 text-sm">
              {p.entries.map((e) => (
                <li key={e.grade}>
                  <span className="font-semibold">Grade {e.grade}:</span> {ACTIVITY_LABELS[e.activity_type]}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-2">
        From the plan saved on {new Date(lessonPlan.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.
      </p>
    </div>
  )
}

export default function AtAGlanceDialog({ open, onClose }) {
  const progress = useClassProgress({ enabled: open })
  const rows = progress.data?.rows ?? []
  const grades = rows.map((r) => r.student.grade)
  const low = Math.min(...grades)
  const high = Math.max(...grades)
  const classLine = rows.length
    ? ` · ${rows.length} ${rows.length === 1 ? 'student' : 'students'} in ${low === high ? `grade ${low}` : `grades ${low} to ${high}`}`
    : ''

  return (
    <Dialog open={open} onClose={onClose} labelledBy="glance-title">
      <div className="flex items-start justify-between gap-3 border-b border-ink px-6 pt-5 pb-4">
        <div>
          <h2 id="glance-title" className="text-3xl font-bold">
            At a glance
          </h2>
          <p className="text-sm text-ink-2">
            {longDate()}
            {classLine}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-ink-2 hover:bg-ground hover:text-ink"
        >
          <Icon name="close" size={24} />
        </button>
      </div>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)] overflow-y-auto lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section aria-labelledby="glance-progress" className="px-6 py-5">
          <h3 id="glance-progress" className="mb-3 font-display text-lg font-semibold">
            Class progress, weakest first
          </h3>
          <ClassProgress progress={progress} onNavigate={onClose} />
        </section>
        <section aria-labelledby="glance-today" className="border-t border-rule px-6 py-5 lg:border-t-0 lg:border-l">
          <h3 id="glance-today" className="mb-3 font-display text-lg font-semibold">
            Today's periods
          </h3>
          <TodayPeriods onNavigate={onClose} />
        </section>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink px-6 py-3.5">
        <Link to="/analytics" onClick={onClose} className="text-sm font-semibold text-entry hover:underline">
          Open full analytics
        </Link>
        <Button onClick={onClose}>Close and continue</Button>
      </div>
    </Dialog>
  )
}
