import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import { Notice, SkeletonRows } from '../../components/ui/Feedback'
import { Field, Select } from '../../components/ui/Field'
import Sheet from '../../components/ui/Sheet'
import { useAuth } from '../../contexts/AuthContext'
import { useTeacher } from '../../contexts/TeacherContext'
import { GRADES } from '../../lib/constants'
import { readAloud, stopReading } from '../../lib/speech'

export default function DailyNugget() {
  const { api } = useAuth()
  const { preferences, savePreferences, loaded } = useTeacher()
  const grade = preferences.nuggetGrade
  const language = preferences.language
  const [nugget, setNugget] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [speechError, setSpeechError] = useState('')

  useEffect(() => {
    if (!loaded) return
    let cancelled = false
    setStatus('loading')
    api
      .get(`/daily-nugget?grade=${grade}&language=${language}`)
      .then((data) => {
        if (cancelled) return
        setNugget(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setStatus('error')
      })
    return () => {
      cancelled = true
      stopReading()
      setSpeaking(false)
    }
  }, [api, grade, language, loaded])

  const toggleSpeech = () => {
    if (speaking) {
      stopReading()
      setSpeaking(false)
      return
    }
    setSpeechError('')
    setSpeaking(true)
    readAloud(nugget.fact, language, {
      onError: (msg) => {
        setSpeechError(msg)
        setSpeaking(false)
      },
      onEnd: () => setSpeaking(false),
    })
  }

  return (
    <Sheet title="Fact of the day" description={`A new one each day, in ${language}. Use it to open a lesson.`}>
      <div className="flex flex-col gap-4">
        <Field label="For">
          {({ id }) => (
            <Select id={id} value={grade} onChange={(e) => savePreferences({ nuggetGrade: Number(e.target.value) }).catch(() => {})}>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {status === 'loading' && <SkeletonRows rows={3} />}
        {status === 'error' && <Notice tone="error">{error}</Notice>}
        {status === 'ready' && nugget && (
          <>
            <p className="text-lg leading-relaxed text-ink">{nugget.fact}</p>
            <div>
              <Button variant="secondary" size="sm" icon={speaking ? 'stop_circle' : 'volume_up'} onClick={toggleSpeech}>
                {speaking ? 'Stop reading' : 'Read aloud'}
              </Button>
            </div>
            {speechError && <Notice tone="caution">{speechError}</Notice>}
          </>
        )}
      </div>
    </Sheet>
  )
}
