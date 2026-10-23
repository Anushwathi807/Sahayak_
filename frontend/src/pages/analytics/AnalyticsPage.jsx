import { useMemo, useState } from 'react'
import { BandChip, BandStrip } from '../../components/ui/Band'
import Button, { ButtonLink } from '../../components/ui/Button'
import { EmptyState, Notice, SkeletonRows } from '../../components/ui/Feedback'
import { Field, Select } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import Sheet from '../../components/ui/Sheet'
import SubjectInk from '../../components/ui/SubjectInk'
import { sortWeakestFirst, useClassProgress } from '../../hooks/useClassProgress'
import { ATTENTION_BELOW, averagePercent, bandFor, distribution, percentOf } from '../../lib/grades'

const SORTS = {
  weakest: { label: 'Weakest first', fn: sortWeakestFirst },
  strongest: {
    label: 'Strongest first',
    fn: (rows) =>
      [...rows].sort(
        (a, b) => (a.average == null) - (b.average == null) || (b.average ?? 0) - (a.average ?? 0) || a.student.name.localeCompare(b.student.name)
      ),
  },
  name: { label: 'Name', fn: (rows) => [...rows].sort((a, b) => a.student.name.localeCompare(b.student.name)) },
}

function QuizTable({ rows, quizzes }) {
  const summary = quizzes
    .map((quiz) => {
      const attempts = rows.flatMap((r) => r.attempts.filter((a) => a.quiz_id === quiz.id))
      const average = averagePercent(attempts)
      return { quiz, marked: attempts.length, average, band: bandFor(average) }
    })
    .filter((q) => q.marked > 0)
    .sort((a, b) => a.average - b.average)

  if (summary.length === 0) return <p className="text-sm text-ink-2">No quiz has marks yet.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full sm:min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
            <th className="py-2 pr-3">Quiz</th>
            <th className="py-2 pr-3 max-sm:hidden">Subject</th>
            <th className="py-2 pr-3 max-sm:hidden">Grade</th>
            <th className="py-2 pr-3 text-right max-sm:hidden">Marked</th>
            <th className="py-2 pr-3 text-right">Class average</th>
            <th className="py-2">Band</th>
          </tr>
        </thead>
        <tbody>
          {summary.map(({ quiz, marked, average, band }) => (
            <tr key={quiz.id} className="border-b border-rule">
              <td className="py-2.5 pr-3 font-medium">{quiz.title}</td>
              <td className="py-2.5 pr-3 max-sm:hidden">
                <SubjectInk subject={quiz.subject} />
              </td>
              <td className="py-2.5 pr-3 tabular-nums max-sm:hidden">{quiz.grade}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums max-sm:hidden">{marked}</td>
              <td className="py-2.5 pr-3 text-right font-semibold tabular-nums text-entry">{Math.round(average)}%</td>
              <td className="py-2.5">
                <BandChip band={band} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AnalyticsPage() {
  const progress = useClassProgress()
  const [grade, setGrade] = useState('all')
  const [sort, setSort] = useState('weakest')

  const data = progress.data
  const grades = useMemo(() => [...new Set((data?.rows ?? []).map((r) => r.student.grade))].sort((a, b) => a - b), [data])
  const rows = useMemo(() => {
    const all = data?.rows ?? []
    const filtered = grade === 'all' ? all : all.filter((r) => r.student.grade === Number(grade))
    return SORTS[sort].fn(filtered)
  }, [data, grade, sort])
  const quizzes = useMemo(
    () => (data?.quizzes ?? []).filter((q) => grade === 'all' || q.grade === Number(grade)),
    [data, grade]
  )

  const quizTitles = useMemo(() => Object.fromEntries((data?.quizzes ?? []).map((q) => [q.id, q.title])), [data])
  const assessed = rows.filter((r) => r.average != null)
  const counts = distribution(assessed.map((r) => r.average))
  const classAverage = assessed.length ? assessed.reduce((s, r) => s + r.average, 0) / assessed.length : null
  const needHelp = assessed.filter((r) => Math.round(r.average) < ATTENTION_BELOW)

  return (
    <>
      <PageHeader
        title="Analytics"
        description="How each student is doing, from the marks you entered. Every score is placed in its CBSE grade band."
        actions={
          <Button variant="secondary" size="sm" icon="refresh" onClick={progress.refresh} loading={progress.status === 'loading' && !!data} loadingLabel="Refreshing">
            Refresh
          </Button>
        }
      />
      {progress.status === 'error' && <Notice tone="error" className="mb-6">{progress.error}</Notice>}
      {!data ? (
        progress.status !== 'error' && <SkeletonRows rows={8} />
      ) : data.rows.length === 0 ? (
        <Sheet>
          <EmptyState icon="monitoring" title="No students yet" action={<ButtonLink to="/students">Add students and marks</ButtonLink>}>
            Analytics appear once your roster has students and you have entered quiz marks.
          </EmptyState>
        </Sheet>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap gap-4">
            <div className="w-44">
              <Field label="Grade">
                {({ id }) => (
                  <Select id={id} value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="all">All grades</option>
                    {grades.map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <div className="w-44">
              <Field label="Order">
                {({ id }) => (
                  <Select id={id} value={sort} onChange={(e) => setSort(e.target.value)}>
                    {Object.entries(SORTS).map(([value, s]) => (
                      <option key={value} value={value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          </div>

          <Sheet title="Grade bands">
            {assessed.length === 0 ? (
              <EmptyState title="No marks yet" action={<ButtonLink to="/students" size="sm">Enter marks</ButtonLink>}>
                Enter quiz marks and each student lands in a band from A1 to E.
              </EmptyState>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-base">
                  {assessed.length} of {rows.length} students have marks. Class average{' '}
                  <span className="font-semibold tabular-nums text-entry">{Math.round(classAverage)}%</span>{' '}
                  <BandChip band={bandFor(classAverage)} className="ml-1 align-middle" />
                </p>
                <BandStrip counts={counts} total={assessed.length} tall />
                {needHelp.length > 0 ? (
                  <p className="text-sm font-semibold text-attention">
                    Below {ATTENTION_BELOW}%: {needHelp.map((r) => r.student.name).join(', ')}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-success">No student is below {ATTENTION_BELOW}%.</p>
                )}
              </div>
            )}
          </Sheet>

          <Sheet title="Students" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full sm:min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
                    <th className="px-5 py-2">Student</th>
                    <th className="py-2 pr-3 max-sm:hidden">Grade</th>
                    <th className="py-2 pr-3 text-right">Average</th>
                    <th className="py-2 pr-3">Band</th>
                    <th className="py-2 pr-5 max-sm:hidden">Each quiz</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ student, attempts, average, band }) => {
                    const low = average != null && Math.round(average) < ATTENTION_BELOW
                    return (
                      <tr key={student.id} className="border-b border-rule last:border-b-0">
                        <td className="px-5 py-2.5 font-medium">{student.name}</td>
                        <td className="py-2.5 pr-3 tabular-nums max-sm:hidden">{student.grade}</td>
                        <td className={`py-2.5 pr-3 text-right font-semibold tabular-nums ${low ? 'text-attention underline decoration-2 underline-offset-4' : 'text-entry'}`}>
                          {average == null ? '' : `${Math.round(average)}%`}
                        </td>
                        <td className="py-2.5 pr-3">
                          <BandChip band={band} />
                        </td>
                        <td className="py-2.5 pr-5 max-sm:hidden">
                          <span className="flex flex-wrap gap-1">
                            {attempts.map((a) => (
                              <BandChip
                                key={a.id}
                                band={bandFor(percentOf(a.score, a.max_score))}
                                title={`${quizTitles[a.quiz_id] ?? 'Quiz'}: ${a.score} / ${a.max_score}`}
                              />
                            ))}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Sheet>

          <Sheet title="Quizzes, weakest first">
            <QuizTable rows={rows} quizzes={quizzes} />
          </Sheet>
        </div>
      )}
    </>
  )
}
