import { useOutletContext } from 'react-router-dom'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import { useAuth } from '../../contexts/AuthContext'
import AskPanel from './AskPanel'
import DailyNugget from './DailyNugget'
import WeekSteps from './WeekSteps'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { user } = useAuth()
  const { openGlance } = useOutletContext()
  const firstName = user?.displayName?.split(' ')[0]

  return (
    <>
      <PageHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ''}`}
        description="Ask for what you need, or work through the week from planning to marks."
        actions={
          <Button variant="secondary" icon="fact_check" onClick={openGlance} className="sm:hidden">
            At a glance
          </Button>
        }
      />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <AskPanel />
        <div className="flex flex-col gap-8">
          <WeekSteps />
          <DailyNugget />
        </div>
      </div>
    </>
  )
}
