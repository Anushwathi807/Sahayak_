import { useState } from 'react'
import Button from '../../components/ui/Button'
import { EmptyState, Notice } from '../../components/ui/Feedback'
import { Field, Input, Select } from '../../components/ui/Field'
import Sheet from '../../components/ui/Sheet'
import SubjectInk from '../../components/ui/SubjectInk'
import { useAuth } from '../../contexts/AuthContext'
import { invalidateClassProgress } from '../../hooks/useClassProgress'
import { GRADES } from '../../lib/constants'

export default function QuizzesSheet({ quizzes }) {
  const { api } = useAuth()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const add = async (e) => {
    e.preventDefault()
    if (!title.trim() || !subject.trim()) {
      setError('Enter both a quiz title and a subject.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/quizzes', { title: title.trim(), subject: subject.trim(), grade: Number(grade) })
      setTitle('')
      invalidateClassProgress()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const sorted = [...quizzes].sort((a, b) => a.grade - b.grade || a.title.localeCompare(b.title))

  return (
    <Sheet title="2. Quizzes" description="Each quiz belongs to one grade.">
      <form onSubmit={add} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
        <Field label="Quiz title">
          {({ id }) => <Input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="For example: Water cycle check" />}
        </Field>
        <Field label="Subject">
          {({ id }) => <Input id={id} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="For example: Science" />}
        </Field>
        <Field label="Grade">
          {({ id }) => (
            <Select id={id} value={grade} onChange={(e) => setGrade(e.target.value)}>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Button type="submit" icon="add" loading={saving} loadingLabel="Adding">
          Add quiz
        </Button>
      </form>
      {error && <Notice tone="error" className="mt-3">{error}</Notice>}
      {quizzes.length === 0 ? (
        <EmptyState title="No quizzes yet">Add a quiz for each test you give. You will enter its marks in step 3.</EmptyState>
      ) : (
        <div className="mt-5">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
                <th className="py-2 pr-3">Quiz</th>
                <th className="py-2 pr-3">Subject</th>
                <th className="py-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((q) => (
                <tr key={q.id} className="border-b border-rule">
                  <td className="py-2.5 pr-3 font-medium">{q.title}</td>
                  <td className="py-2.5 pr-3">
                    <SubjectInk subject={q.subject} />
                  </td>
                  <td className="py-2.5 tabular-nums">{q.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Sheet>
  )
}
