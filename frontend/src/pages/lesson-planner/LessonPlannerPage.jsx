import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Notice, SkeletonRows } from '../../components/ui/Feedback'
import PageHeader from '../../components/ui/PageHeader'
import StepTracker from '../../components/ui/StepTracker'
import { useAuth } from '../../contexts/AuthContext'
import { useTeacher } from '../../contexts/TeacherContext'
import { WEEKDAYS } from '../../lib/constants'
import PlanView from './PlanView'
import WeekBuilder from './WeekBuilder'

const STEPS = [
  { id: 'week', label: 'Build the week' },
  { id: 'plan', label: 'Read and print the plan' },
]

function weekFromInput(input) {
  const week = {}
  for (const d of input || []) week[d.day] = d.subjects
  return week
}

export default function LessonPlannerPage() {
  const { api } = useAuth()
  const { loaded, lessonPlan, saveLessonPlan, preferences } = useTeacher()
  const location = useLocation()
  const [notice] = useState(location.state?.notice ?? '')

  const [step, setStep] = useState(null)
  const [week, setWeek] = useState({})
  const [language, setLanguage] = useState(preferences.language)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [saveWarning, setSaveWarning] = useState('')
  const initialised = useRef(false)

  // Once the account has loaded, open on the saved plan if there is one.
  useEffect(() => {
    if (!loaded || initialised.current) return
    initialised.current = true
    if (lessonPlan) {
      setWeek(weekFromInput(lessonPlan.input))
      setLanguage(lessonPlan.language || preferences.language)
      setStep('plan')
    } else {
      setLanguage(preferences.language)
      setStep('week')
    }
  }, [loaded, lessonPlan, preferences.language])

  const generate = async () => {
    const dayPlan = WEEKDAYS.filter((d) => week[d]?.length).map((d) => ({ day: d, subjects: week[d] }))
    setGenerating(true)
    setError('')
    setSaveWarning('')
    try {
      const result = await api.post('/generate/lesson-plan', { day_plan: dayPlan, language })
      try {
        await saveLessonPlan({ language, input: dayPlan, result })
      } catch {
        setSaveWarning('The plan was written but could not be saved to your account, so it will be gone after you sign out. Print it to keep a copy.')
      }
      setStep('plan')
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const shownPlan = lessonPlan

  return (
    <>
      <PageHeader
        title="Lesson planner"
        description="Plan a multi-grade week. Sahayak rotates teaching, worksheets, group work and peer reading fairly across grades."
      />
      {notice && step === 'week' && <Notice className="mb-6">{notice}</Notice>}
      {step === null ? (
        <SkeletonRows rows={6} />
      ) : (
        <>
          <StepTracker
            steps={STEPS}
            current={step}
            completed={shownPlan ? ['week', 'plan'] : []}
            onSelect={(id) => (id === 'plan' && !shownPlan ? null : setStep(id))}
          />
          {step === 'week' && (
            <WeekBuilder
              week={week}
              setWeek={setWeek}
              language={language}
              setLanguage={setLanguage}
              defaultGrades={preferences.grades || []}
              onGenerate={generate}
              generating={generating}
              error={error}
            />
          )}
          {step === 'plan' && shownPlan && (
            <PlanView
              plan={shownPlan}
              saveWarning={saveWarning}
              onEdit={() => setStep('week')}
              onNew={() => {
                setWeek({})
                setStep('week')
              }}
            />
          )}
        </>
      )}
    </>
  )
}
