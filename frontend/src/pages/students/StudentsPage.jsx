import Button from '../../components/ui/Button'
import { Notice, SkeletonRows } from '../../components/ui/Feedback'
import PageHeader from '../../components/ui/PageHeader'
import { useClassProgress } from '../../hooks/useClassProgress'
import MarksEntry from './MarksEntry'
import QuizzesSheet from './QuizzesSheet'
import RosterSheet from './RosterSheet'

export default function StudentsPage() {
  const progress = useClassProgress()
  const rows = progress.data?.rows ?? []
  const quizzes = progress.data?.quizzes ?? []

  return (
    <>
      <PageHeader
        title="Students and marks"
        description="Keep your roster and quizzes, then enter a whole quiz's marks at once. Grade bands update At a glance and Analytics."
      />
      {progress.status === 'error' && (
        <Notice tone="error" className="mb-6" action={<Button size="sm" variant="secondary" onClick={progress.refresh}>Try again</Button>}>
          {progress.error}
        </Notice>
      )}
      {!progress.data ? (
        progress.status !== 'error' && <SkeletonRows rows={8} />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <RosterSheet rows={rows} quizzes={quizzes} />
            <QuizzesSheet quizzes={quizzes} />
          </div>
          <MarksEntry rows={rows} quizzes={quizzes} />
        </div>
      )}
    </>
  )
}
