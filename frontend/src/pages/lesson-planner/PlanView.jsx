import Button from '../../components/ui/Button'
import { Notice } from '../../components/ui/Feedback'
import Sheet from '../../components/ui/Sheet'
import SubjectInk from '../../components/ui/SubjectInk'
import { ACTIVITY_LABELS, todayWeekday } from '../../lib/constants'
import { periodsForDay } from '../../lib/schedule'

export default function PlanView({ plan, saveWarning, onEdit, onNew }) {
  const today = todayWeekday()
  const savedOn = new Date(plan.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-ink-2">
          {saveWarning
            ? `Written on ${savedOn}, in ${plan.language}.`
            : `Saved to your account on ${savedOn}, in ${plan.language}. Today's periods appear in At a glance.`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon="edit" onClick={onEdit}>
            Edit this week
          </Button>
          <Button variant="secondary" size="sm" icon="print" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="quiet" size="sm" onClick={onNew}>
            Plan a new week
          </Button>
        </div>
      </div>
      {saveWarning && <Notice tone="caution">{saveWarning}</Notice>}
      {plan.result.days.map((day) => {
        const periods = periodsForDay(plan, day.day)
        return (
          <Sheet key={day.day} title={day.day === today ? `${day.day} (today)` : day.day} className="break-inside-avoid" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full sm:min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
                    <th className="px-5 py-2 sm:w-56">Subject</th>
                    <th className="w-20 py-2 pr-3">Grade</th>
                    <th className="w-48 py-2 pr-3 max-sm:hidden">Activity</th>
                    <th className="py-2 pr-5">What they do</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.flatMap((p) =>
                    p.entries.map((e, i) => (
                      <tr key={`${p.subject}-${e.grade}-${i}`} className="border-b border-rule align-top last:border-b-0">
                        <td className="px-5 py-3">
                          {i === 0 && (
                            <>
                              <SubjectInk subject={p.subject} className="font-semibold" />
                              <p className="mt-0.5 text-sm text-ink-2">{p.topics.join(', ')}</p>
                            </>
                          )}
                        </td>
                        <td className="py-3 pr-3 font-semibold tabular-nums">{e.grade}</td>
                        <td className="py-3 pr-3 text-sm max-sm:hidden">{ACTIVITY_LABELS[e.activity_type] ?? e.activity_type}</td>
                        <td className="py-3 pr-5 text-base leading-relaxed">
                          <span className="block text-sm font-semibold sm:hidden">{ACTIVITY_LABELS[e.activity_type] ?? e.activity_type}</span>
                          {e.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Sheet>
        )
      })}
    </div>
  )
}
