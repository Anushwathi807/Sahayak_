import { useEffect, useRef } from 'react'
import { BandChip } from '../../components/ui/Band'
import SubjectInk from '../../components/ui/SubjectInk'
import { bandFor, percentOf } from '../../lib/grades'

// Opens inside the roster, directly under the student's row.
export default function StudentHistory({ row, quizzes }) {
  const { student, attempts, average } = row
  const quizById = Object.fromEntries(quizzes.map((q) => [q.id, q]))
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.focus()
  }, [student.id])

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="region"
      aria-label={`Marks for ${student.name}`}
      className="border-l border-ink bg-ground py-3 pr-2 pl-4 focus:outline-none"
    >
      <p className="mb-2 text-sm font-semibold">
        {average == null
          ? `${student.name} has no marks yet. Enter them in step 3.`
          : `${student.name}: average ${Math.round(average)}% across ${attempts.length} ${attempts.length === 1 ? 'quiz' : 'quizzes'}`}
      </p>
      {attempts.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
              <th className="py-1.5 pr-3">Quiz</th>
              <th className="py-1.5 pr-3 max-sm:hidden">Subject</th>
              <th className="py-1.5 pr-3 text-right">Marks</th>
              <th className="py-1.5">Band</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => {
              const quiz = quizById[a.quiz_id]
              return (
                <tr key={a.id} className="border-b border-rule last:border-b-0">
                  <td className="py-1.5 pr-3">{quiz?.title ?? 'Deleted quiz'}</td>
                  <td className="py-1.5 pr-3 max-sm:hidden">{quiz ? <SubjectInk subject={quiz.subject} /> : ''}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums text-entry">
                    {a.score} / {a.max_score}
                  </td>
                  <td className="py-1.5">
                    <BandChip band={bandFor(percentOf(a.score, a.max_score))} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
