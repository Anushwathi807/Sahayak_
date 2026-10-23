import { Fragment, useState } from 'react'
import { BandChip } from '../../components/ui/Band'
import Button from '../../components/ui/Button'
import { EmptyState, Notice } from '../../components/ui/Feedback'
import { Field, Input, Select } from '../../components/ui/Field'
import Sheet from '../../components/ui/Sheet'
import { useAuth } from '../../contexts/AuthContext'
import { invalidateClassProgress } from '../../hooks/useClassProgress'
import { GRADES } from '../../lib/constants'
import { ATTENTION_BELOW } from '../../lib/grades'
import StudentHistory from './StudentHistory'

export default function RosterSheet({ rows, quizzes }) {
  const { api } = useAuth()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState(1)
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)

  const add = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Enter the student's name.")
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/students', { name: name.trim(), grade: Number(grade) })
      setName('')
      invalidateClassProgress()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const shown = (filter === 'all' ? [...rows] : rows.filter((r) => r.student.grade === Number(filter))).sort(
    (a, b) => a.student.grade - b.student.grade || a.student.name.localeCompare(b.student.name)
  )

  return (
    <Sheet title="1. Roster" description="Everyone you teach, across all grades.">
      <form onSubmit={add} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_140px_auto]">
        <Field label="Student name">
          {({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder="For example: Priya Desai" />}
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
        <Button type="submit" icon="person_add" loading={saving} loadingLabel="Adding">
          Add
        </Button>
      </form>
      {error && <Notice tone="error" className="mt-3">{error}</Notice>}

      {rows.length === 0 ? (
        <EmptyState title="No students yet">Add each student once. You will enter their quiz marks in step 3.</EmptyState>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-2">
              {shown.length} of {rows.length} {rows.length === 1 ? 'student' : 'students'}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Show</span>
              <div className="w-36">
                <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 text-sm">
                  <option value="all">All grades</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </Select>
              </div>
            </label>
          </div>
          <table className="mt-3 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Grade</th>
                <th className="py-2 pr-3 text-right max-sm:hidden">Average</th>
                <th className="py-2 pr-3">Band</th>
                <th className="py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => {
                const { student, average, band } = row
                const open = openId === student.id
                const low = average != null && Math.round(average) < ATTENTION_BELOW
                return (
                  <Fragment key={student.id}>
                    <tr className={`border-b border-rule ${open ? 'bg-brand-tint' : ''}`}>
                      <td className="py-2.5 pr-3 font-medium">{student.name}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{student.grade}</td>
                      <td
                        className={`py-2.5 pr-3 text-right font-semibold tabular-nums max-sm:hidden ${
                          low ? 'text-attention underline decoration-2 underline-offset-4' : 'text-entry'
                        }`}
                      >
                        {average == null ? '' : `${Math.round(average)}%`}
                      </td>
                      <td className="py-2.5 pr-3">
                        <BandChip band={band} />
                      </td>
                      <td className="py-2.5 text-right">
                        <Button variant="quiet" size="sm" aria-expanded={open} onClick={() => setOpenId(open ? null : student.id)}>
                          {open ? 'Hide' : 'Marks'}
                        </Button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-b border-rule">
                        <td colSpan={5} className="py-2">
                          <StudentHistory row={row} quizzes={quizzes} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </>
      )}
    </Sheet>
  )
}
