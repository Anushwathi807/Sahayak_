import { useMemo, useState } from 'react'
import { BandChip } from '../../components/ui/Band'
import Button from '../../components/ui/Button'
import { EmptyState, Notice } from '../../components/ui/Feedback'
import { Field, Input, Select } from '../../components/ui/Field'
import Sheet from '../../components/ui/Sheet'
import { useAuth } from '../../contexts/AuthContext'
import { invalidateClassProgress } from '../../hooks/useClassProgress'
import { bandFor, percentOf } from '../../lib/grades'

export default function MarksEntry({ rows, quizzes }) {
  const { api } = useAuth()
  const [quizId, setQuizId] = useState('')
  const [outOf, setOutOf] = useState(10)
  const [marks, setMarks] = useState({})
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null) // { saved, failed }
  const [error, setError] = useState('')

  const quiz = quizzes.find((q) => q.id === quizId)
  const students = useMemo(
    () => (quiz ? rows.filter((r) => r.student.grade === quiz.grade).sort((a, b) => a.student.name.localeCompare(b.student.name)) : []),
    [rows, quiz]
  )

  const recordedFor = (row) => row.attempts.find((a) => a.quiz_id === quizId)

  const save = async () => {
    const max = Number(outOf)
    if (!(max > 0)) {
      setError('Enter the total marks for this quiz.')
      return
    }
    const entries = students
      .filter((r) => !recordedFor(r) && marks[r.student.id] !== undefined && marks[r.student.id] !== '')
      .map((r) => ({ row: r, score: Number(marks[r.student.id]) }))
    if (entries.length === 0) {
      setError('Enter at least one mark.')
      return
    }
    const bad = entries.find((e) => Number.isNaN(e.score) || e.score < 0 || e.score > max)
    if (bad) {
      setError(`${bad.row.student.name}'s mark must be between 0 and ${max}.`)
      return
    }
    setSaving(true)
    setError('')
    const outcomes = await Promise.allSettled(
      entries.map((e) => api.post('/attempts', { quiz_id: quizId, student_id: e.row.student.id, score: e.score, max_score: max }))
    )
    const failed = entries.filter((_, i) => outcomes[i].status === 'rejected').map((e) => e.row.student.name)
    setResult({ saved: entries.length - failed.length, failed })
    setMarks({})
    setSaving(false)
    invalidateClassProgress()
  }

  return (
    <Sheet title="3. Enter marks" description="Pick a quiz, then type each student's marks in one go.">
      {quizzes.length === 0 || rows.length === 0 ? (
        <EmptyState title="Add students and a quiz first">Marks are entered against a quiz for the students in its grade.</EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
            <Field label="Quiz">
              {({ id }) => (
                <Select
                  id={id}
                  value={quizId}
                  onChange={(e) => {
                    setQuizId(e.target.value)
                    setMarks({})
                    setResult(null)
                    setError('')
                  }}
                >
                  <option value="">Choose a quiz</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title} · {q.subject} · Grade {q.grade}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Total marks">
              {({ id }) => (
                <Input id={id} type="number" min={1} value={outOf} onChange={(e) => setOutOf(e.target.value)} className="tabular-nums" disabled={!quiz} />
              )}
            </Field>
          </div>

          {quiz && students.length === 0 && (
            <Notice tone="info">No students in Grade {quiz.grade} yet. Add them to the roster first.</Notice>
          )}

          {quiz && students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full sm:min-w-[480px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
                    <th className="py-2 pr-3">Student</th>
                    <th className="w-40 py-2 pr-3">Marks out of {outOf || '?'}</th>
                    <th className="py-2">Band</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((r) => {
                    const recorded = recordedFor(r)
                    const typed = marks[r.student.id]
                    const previewBand =
                      typed !== undefined && typed !== '' && Number(outOf) > 0 ? bandFor(percentOf(Number(typed), Number(outOf))) : null
                    return (
                      <tr key={r.student.id} className="border-b border-rule">
                        <td className="py-2.5 pr-3 font-medium">{r.student.name}</td>
                        <td className="py-2.5 pr-3">
                          {recorded ? (
                            <span className="text-sm text-ink-2">
                              Recorded: <span className="font-semibold tabular-nums text-entry">{recorded.score} / {recorded.max_score}</span>
                            </span>
                          ) : (
                            <Input
                              type="number"
                              min={0}
                              max={outOf}
                              aria-label={`Marks for ${r.student.name}`}
                              value={typed ?? ''}
                              onChange={(e) => setMarks({ ...marks, [r.student.id]: e.target.value })}
                              className="h-9 tabular-nums"
                            />
                          )}
                        </td>
                        <td className="py-2.5">
                          {recorded ? <BandChip band={bandFor(percentOf(recorded.score, recorded.max_score))} /> : previewBand && <BandChip band={previewBand} />}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {error && <Notice tone="error">{error}</Notice>}
          {result && result.saved > 0 && (
            <Notice tone="success">
              Saved marks for {result.saved} {result.saved === 1 ? 'student' : 'students'}. At a glance and Analytics are updated.
            </Notice>
          )}
          {result && result.failed.length > 0 && (
            <Notice tone="error">Could not save marks for {result.failed.join(', ')}. Enter them again.</Notice>
          )}
          {quiz && students.length > 0 && (
            <div>
              <Button icon="save" onClick={save} loading={saving} loadingLabel="Saving marks">
                Save marks
              </Button>
            </div>
          )}
        </div>
      )}
    </Sheet>
  )
}
