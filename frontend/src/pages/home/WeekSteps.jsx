import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Sheet from '../../components/ui/Sheet'
import { useContent } from '../../contexts/ContentContext'
import { useTeacher } from '../../contexts/TeacherContext'
import { useClassProgress } from '../../hooks/useClassProgress'
import { cx } from '../../lib/cx'

// The week in order: plan, prepare, assess, record. Done steps carry a filled check.
export default function WeekSteps() {
  const { lessonPlan } = useTeacher()
  const { history } = useContent()
  const progress = useClassProgress()

  const students = progress.data?.rows.length ?? 0
  const assessed = progress.data?.assessedCount ?? 0

  const steps = [
    {
      title: 'Plan the week',
      to: '/lesson-planner',
      done: Boolean(lessonPlan),
      status: lessonPlan
        ? `Plan saved for ${lessonPlan.result.days.map((d) => d.day.slice(0, 3)).join(', ')}`
        : 'No plan yet',
    },
    {
      title: 'Prepare material',
      to: '/library',
      done: history.length > 0,
      status: history.length > 0 ? `${history.length} ${history.length === 1 ? 'item' : 'items'} in your library` : 'Ask Sahayak or scan a textbook page',
    },
    {
      title: 'Make worksheets',
      to: '/worksheets',
      done: false,
      status: 'Questions for each grade, ready to print',
    },
    {
      title: 'Enter marks',
      to: '/students',
      done: assessed > 0,
      status:
        progress.status === 'ready'
          ? students === 0
            ? 'No students yet'
            : `${assessed} of ${students} students have marks`
          : 'Roster, quizzes and marks',
    },
  ]

  return (
    <Sheet title="This week" bodyClassName="p-0">
      <ol>
        {steps.map((step, i) => (
          <li key={step.title} className="border-b border-rule last:border-b-0">
            <Link to={step.to} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ground">
              <span
                className={cx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-display text-sm font-bold',
                  step.done ? 'border-brand bg-brand text-white' : 'border-ink text-ink'
                )}
              >
                {step.done ? <Icon name="check" size={18} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-ink">{step.title}</span>
                <span className="block text-sm text-ink-2">{step.status}</span>
              </span>
              <Icon name="chevron_right" size={20} className="text-ink-3" />
            </Link>
          </li>
        ))}
      </ol>
    </Sheet>
  )
}
