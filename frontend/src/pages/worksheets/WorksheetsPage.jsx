import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Notice } from '../../components/ui/Feedback'
import PageHeader from '../../components/ui/PageHeader'
import StepTracker from '../../components/ui/StepTracker'
import { useAuth } from '../../contexts/AuthContext'
import { useTeacher } from '../../contexts/TeacherContext'
import GradesStep from './GradesStep'
import QuestionMixStep from './QuestionMixStep'
import TopicStep from './TopicStep'
import WorksheetPreview from './WorksheetPreview'

const STEPS = [
  { id: 'topic', label: 'Topic' },
  { id: 'grades', label: 'Grades and language' },
  { id: 'mix', label: 'Question mix' },
  { id: 'preview', label: 'Preview and print' },
]

const DEFAULT_SPEC = [
  { type: 'mcq', marks: 1, count: 5 },
  { type: 'short_answer', marks: 2, count: 3 },
]

function initialForm(preferences, prefill) {
  return {
    subject: prefill?.subject ?? '',
    topics: prefill?.topics ?? [],
    summary: prefill?.summary ?? '',
    grades: preferences.grades?.length ? preferences.grades : [],
    language: prefill?.language ?? preferences.language,
    spec: DEFAULT_SPEC,
  }
}

export default function WorksheetsPage() {
  const { api } = useAuth()
  const { preferences } = useTeacher()
  const location = useLocation()
  const prefill = location.state?.prefill
  const [notice] = useState(location.state?.notice ?? '')

  const [step, setStep] = useState('topic')
  const [completed, setCompleted] = useState([])
  const [form, setForm] = useState(() => initialForm(preferences, prefill))
  const [result, setResult] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Preferences arrive from the account after first render; fill grades if still untouched.
  useEffect(() => {
    setForm((f) => (f.grades.length === 0 && preferences.grades?.length ? { ...f, grades: preferences.grades } : f))
  }, [preferences.grades])

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))
  const goTo = (id) => setStep(id)
  const advance = (from, to) => {
    setCompleted((c) => (c.includes(from) ? c : [...c, from]))
    setStep(to)
  }

  const generate = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await api.post('/generate/worksheets', {
        subject: form.subject.trim(),
        topics: form.topics,
        summary: form.summary.trim(),
        grades: form.grades,
        language: form.language,
        spec: form.spec.map((r) => ({ type: r.type, marks: Number(r.marks), count: Number(r.count) })),
      })
      setResult(res.worksheets)
      advance('mix', 'preview')
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const startOver = () => {
    setForm(initialForm(preferences, null))
    setResult(null)
    setCompleted([])
    setStep('topic')
  }

  return (
    <>
      <PageHeader
        title="Worksheets"
        description="Differentiated worksheets for each grade in your room, with answer keys, ready for the school printer."
      />
      {notice && step === 'topic' && <Notice className="mb-6">{notice}</Notice>}
      <StepTracker steps={STEPS} current={step} completed={completed} onSelect={goTo} />
      {step === 'topic' && <TopicStep form={form} update={update} onNext={() => advance('topic', 'grades')} />}
      {step === 'grades' && (
        <GradesStep form={form} update={update} onBack={() => goTo('topic')} onNext={() => advance('grades', 'mix')} />
      )}
      {step === 'mix' && (
        <QuestionMixStep
          form={form}
          update={update}
          onBack={() => goTo('grades')}
          onGenerate={generate}
          generating={generating}
          error={error}
        />
      )}
      {step === 'preview' && result && (
        <WorksheetPreview worksheets={result} subject={form.subject} onEditMix={() => goTo('mix')} onStartOver={startOver} />
      )}
    </>
  )
}
