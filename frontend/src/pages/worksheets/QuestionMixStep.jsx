import { useState } from 'react'
import Button from '../../components/ui/Button'
import { Notice, Working } from '../../components/ui/Feedback'
import { Input, Select } from '../../components/ui/Field'
import Icon from '../../components/ui/Icon'
import Sheet from '../../components/ui/Sheet'
import { QUESTION_TYPES, formatGrades } from '../../lib/constants'

const LIMIT = 20

export default function QuestionMixStep({ form, update, onBack, onGenerate, generating, error }) {
  const [problem, setProblem] = useState('')
  const rows = form.spec

  const setRow = (index, patch) => update({ spec: rows.map((r, i) => (i === index ? { ...r, ...patch } : r)) })
  const removeRow = (index) => update({ spec: rows.filter((_, i) => i !== index) })
  const addRow = () => {
    const unused = QUESTION_TYPES.find((t) => !rows.some((r) => r.type === t.value))
    update({ spec: [...rows, { type: unused?.value ?? 'short_answer', marks: 1, count: 5 }] })
  }

  const totalQuestions = rows.reduce((s, r) => s + (Number(r.count) || 0), 0)
  const totalMarks = rows.reduce((s, r) => s + (Number(r.count) || 0) * (Number(r.marks) || 0), 0)

  const generate = () => {
    if (rows.length === 0) {
      setProblem('Add at least one question type.')
      return
    }
    const bad = rows.find((r) => !(r.count >= 1 && r.count <= LIMIT && r.marks >= 1 && r.marks <= LIMIT))
    if (bad) {
      setProblem(`Use between 1 and ${LIMIT} questions and between 1 and ${LIMIT} marks in each row.`)
      return
    }
    setProblem('')
    onGenerate()
  }

  return (
    <Sheet title="Question mix" description={`The same mix is used for every grade: ${formatGrades(form.grades)}, in ${form.language}.`}>
      <div className="flex flex-col gap-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
                <th className="py-2 pr-3">Question type</th>
                <th className="w-28 py-2 pr-3">Marks each</th>
                <th className="w-28 py-2 pr-3">How many</th>
                <th className="w-20 py-2 pr-3 text-right">Marks</th>
                <th className="w-12 py-2" aria-label="Remove" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-rule">
                  <td className="py-2.5 pr-3">
                    <Select aria-label={`Question type, row ${i + 1}`} value={row.type} onChange={(e) => setRow(i, { type: e.target.value })}>
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="py-2.5 pr-3">
                    <Input
                      type="number"
                      min={1}
                      max={LIMIT}
                      aria-label={`Marks each, row ${i + 1}`}
                      value={row.marks}
                      onChange={(e) => setRow(i, { marks: Number(e.target.value) })}
                      className="tabular-nums"
                    />
                  </td>
                  <td className="py-2.5 pr-3">
                    <Input
                      type="number"
                      min={1}
                      max={LIMIT}
                      aria-label={`How many, row ${i + 1}`}
                      value={row.count}
                      onChange={(e) => setRow(i, { count: Number(e.target.value) })}
                      className="tabular-nums"
                    />
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold tabular-nums">
                    {(Number(row.count) || 0) * (Number(row.marks) || 0)}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      aria-label={`Remove row ${i + 1}`}
                      onClick={() => removeRow(i)}
                      className="flex h-9 w-9 items-center justify-center rounded-sm text-ink-2 hover:bg-attention-tint hover:text-attention"
                    >
                      <Icon name="delete" size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="pt-3 pr-3">
                  Total: {totalQuestions} {totalQuestions === 1 ? 'question' : 'questions'}
                </td>
                <td colSpan={2} />
                <td className="pt-3 pr-3 text-right tabular-nums">{totalMarks}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <div>
          <Button variant="secondary" size="sm" icon="add" onClick={addRow} disabled={rows.length >= QUESTION_TYPES.length}>
            Add a question type
          </Button>
        </div>
        {rows.some((r) => r.type === 'diagram_based') && (
          <Notice tone="info">Diagram questions draw a cycle with one stage left blank for students to name.</Notice>
        )}
        {problem && <Notice tone="error">{problem}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
        {generating && (
          <Working>
            Writing questions for {formatGrades(form.grades)}. Each grade takes 10 to 30 seconds.
          </Working>
        )}
        <div className="flex flex-wrap gap-3 border-t border-rule pt-5">
          <Button variant="secondary" icon="arrow_back" onClick={onBack} disabled={generating}>
            Back
          </Button>
          <Button icon="edit_note" onClick={generate} loading={generating} loadingLabel="Writing worksheets">
            Write the worksheets
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
