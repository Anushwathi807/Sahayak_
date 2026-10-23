import { useState } from 'react'
import Button from '../../components/ui/Button'
import { Notice } from '../../components/ui/Feedback'
import { useAuth } from '../../contexts/AuthContext'
import { saveBlob } from '../../lib/api'
import { cx } from '../../lib/cx'

function AnswerLines({ count }) {
  return (
    <div className="mt-2 flex flex-col gap-5 pl-6" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="block h-px bg-rule" />
      ))}
    </div>
  )
}

function Question({ q, n, showAnswers }) {
  return (
    <li className="break-inside-avoid border-b border-rule py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="w-6 shrink-0 font-display font-bold tabular-nums">{n}.</span>
        <p className="flex-1 leading-relaxed">{q.question}</p>
        <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-ink-2">[{q.marks}]</span>
      </div>
      {q.options && (
        <ol className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 pl-9 sm:grid-cols-2">
          {q.options.map((opt, i) => (
            <li key={i}>
              ({String.fromCharCode(97 + i)}) {opt}
            </li>
          ))}
        </ol>
      )}
      {q.type === 'true_false' && <p className="mt-2 pl-9 text-ink-2">True / False</p>}
      {q.match_pairs && (
        <div className="mt-2 grid grid-cols-2 gap-6 pl-9">
          <ol className="flex flex-col gap-1">
            {q.match_pairs.map((p, i) => (
              <li key={i}>
                {i + 1}. {p.left}
              </li>
            ))}
          </ol>
          <ol className="flex flex-col gap-1">
            {q.match_pairs.map((p, i) => (
              <li key={i}>
                ({String.fromCharCode(97 + i)}) {p.right}
              </li>
            ))}
          </ol>
        </div>
      )}
      {q.diagram_svg && (
        <div className="diagram-frame mt-3 ml-9 max-w-sm" dangerouslySetInnerHTML={{ __html: q.diagram_svg }} />
      )}
      {q.type === 'short_answer' && <AnswerLines count={2} />}
      {q.type === 'long_answer' && <AnswerLines count={5} />}
      {showAnswers && (
        <p className="mt-2 pl-9 text-sm font-semibold text-entry">
          Answer: <span className="font-normal">{q.answer}</span>
        </p>
      )}
    </li>
  )
}

export default function WorksheetPreview({ worksheets, subject, onEditMix, onStartOver }) {
  const { api } = useAuth()
  const [active, setActive] = useState(worksheets[0]?.grade)
  const [showAnswers, setShowAnswers] = useState(false)
  const [downloading, setDownloading] = useState('')
  const [error, setError] = useState('')
  const sheet = worksheets.find((w) => w.grade === active) ?? worksheets[0]

  const download = async (format, answers) => {
    const key = `${format}-${answers}`
    setDownloading(key)
    setError('')
    try {
      const blob = await api.download(`/export/worksheet/${format}?answers=${answers}`, sheet)
      saveBlob(blob, `grade-${sheet.grade}-${answers ? 'answer-key' : 'worksheet'}.${format}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setDownloading('')
    }
  }

  if (!sheet) {
    return <Notice tone="error">No worksheets came back. Go back and try again.</Notice>
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div role="tablist" aria-label="Worksheet by grade" className="flex flex-wrap gap-2">
          {worksheets.map((w) => (
            <button
              key={w.grade}
              role="tab"
              type="button"
              aria-selected={w.grade === sheet.grade}
              onClick={() => setActive(w.grade)}
              className={cx(
                'h-10 rounded-sm border px-4 text-sm font-semibold',
                w.grade === sheet.grade ? 'border-ink bg-ink text-white' : 'border-field bg-sheet text-ink hover:border-ink'
              )}
            >
              Grade {w.grade}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon="tune" onClick={onEditMix}>
            Change the question mix
          </Button>
          <Button variant="quiet" size="sm" onClick={onStartOver}>
            Start a new worksheet
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-rule bg-sheet px-4 py-3 print:hidden">
        <span className="mr-2 text-sm font-semibold">Grade {sheet.grade}:</span>
        <Button size="sm" icon="picture_as_pdf" onClick={() => download('pdf', false)} loading={downloading === 'pdf-false'}>
          Worksheet PDF
        </Button>
        <Button variant="secondary" size="sm" icon="description" onClick={() => download('docx', false)} loading={downloading === 'docx-false'}>
          Worksheet Word
        </Button>
        <Button variant="secondary" size="sm" icon="key" onClick={() => download('pdf', true)} loading={downloading === 'pdf-true'}>
          Answer key PDF
        </Button>
        <Button variant="secondary" size="sm" icon="key" onClick={() => download('docx', true)} loading={downloading === 'docx-true'}>
          Answer key Word
        </Button>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={showAnswers} onChange={(e) => setShowAnswers(e.target.checked)} className="h-4 w-4 accent-brand" />
          Show answers here
        </label>
      </div>
      {error && <Notice tone="error">{error}</Notice>}

      <div className="rounded-md bg-tray p-4 sm:p-8 print:bg-white print:p-0">
        <article
          aria-label={`Grade ${sheet.grade} worksheet preview`}
          className="mx-auto max-w-[794px] bg-sheet px-6 py-8 text-base text-ink shadow-[0_8px_24px_-12px_rgba(23,35,58,0.35)] sm:px-12 sm:py-12 print:shadow-none"
        >
          <header className="border-b-2 border-ink pb-4 text-center">
            <h2 className="text-2xl font-bold">{sheet.title}</h2>
            <p className="mt-1 text-sm text-ink-2">
              Grade {sheet.grade} · {subject} · Total marks {sheet.total_marks}
            </p>
          </header>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 border-b border-rule py-4 text-sm sm:grid-cols-[2fr_1fr_1fr]">
            <span>Name: ____________________</span>
            <span>Roll no.: _______</span>
            <span>Date: __________</span>
          </div>
          <p className="py-3 text-sm font-semibold">{sheet.instructions}</p>
          <ol>
            {sheet.questions.map((q, i) => (
              <Question key={i} q={q} n={i + 1} showAnswers={showAnswers} />
            ))}
          </ol>
        </article>
      </div>
    </div>
  )
}
