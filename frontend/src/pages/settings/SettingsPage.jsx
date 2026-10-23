import { useEffect, useState } from 'react'
import Button, { ButtonLink } from '../../components/ui/Button'
import { Notice } from '../../components/ui/Feedback'
import { Field, Select } from '../../components/ui/Field'
import GradePicker from '../../components/ui/GradePicker'
import LanguageSelect from '../../components/ui/LanguageSelect'
import PageHeader from '../../components/ui/PageHeader'
import Sheet from '../../components/ui/Sheet'
import { useAuth } from '../../contexts/AuthContext'
import { useContent } from '../../contexts/ContentContext'
import { useTeacher } from '../../contexts/TeacherContext'
import { API_BASE, checkHealth } from '../../lib/api'
import { GRADES } from '../../lib/constants'

function ConfirmButton({ label, confirmLabel, onConfirm }) {
  const [asking, setAsking] = useState(false)
  if (!asking) {
    return (
      <Button variant="danger" size="sm" onClick={() => setAsking(true)}>
        {label}
      </Button>
    )
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          setAsking(false)
          onConfirm()
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="quiet" size="sm" onClick={() => setAsking(false)}>
        Keep it
      </Button>
    </span>
  )
}

function Preferences() {
  const { loaded, preferences, savePreferences } = useTeacher()
  const [draft, setDraft] = useState(preferences)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loaded) setDraft(preferences)
  }, [loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setSaving(true)
    setStatus('')
    try {
      await savePreferences(draft)
      setStatus('saved')
    } catch {
      setStatus('failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet title="Teaching preferences" description="Used to fill in forms across Sahayak. Saved to your account.">
      <div className="flex max-w-2xl flex-col gap-6">
        <div className="max-w-xs">
          <LanguageSelect label="Default language" value={draft.language} onChange={(language) => setDraft({ ...draft, language })} />
        </div>
        <GradePicker label="Grades you teach" value={draft.grades} onChange={(grades) => setDraft({ ...draft, grades })} />
        <div className="max-w-xs">
          <Field label="Fact of the day for">
            {({ id }) => (
              <Select id={id} value={draft.nuggetGrade} onChange={(e) => setDraft({ ...draft, nuggetGrade: Number(e.target.value) })}>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon="save" onClick={save} loading={saving} loadingLabel="Saving">
            Save preferences
          </Button>
          {status === 'saved' && <Notice tone="success">Saved to your account.</Notice>}
          {status === 'failed' && <Notice tone="error">Could not save. Check your connection and try again.</Notice>}
        </div>
      </div>
    </Sheet>
  )
}

function SavedPlan() {
  const { lessonPlan, saveLessonPlan } = useTeacher()
  const [error, setError] = useState('')
  return (
    <Sheet title="Saved lesson plan">
      {lessonPlan ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-base">
            Planned on {new Date(lessonPlan.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} for{' '}
            {lessonPlan.result.days.map((d) => d.day).join(', ')}.
          </p>
          <ConfirmButton
            label="Remove the saved plan"
            confirmLabel="Yes, remove it"
            onConfirm={() => saveLessonPlan(null).catch(() => setError('Could not remove the plan. Try again.'))}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-base text-ink-2">No plan saved. At a glance shows today's periods once you plan a week.</p>
          <ButtonLink to="/lesson-planner" variant="secondary" size="sm">
            Plan the week
          </ButtonLink>
        </div>
      )}
      {error && <Notice tone="error" className="mt-3">{error}</Notice>}
    </Sheet>
  )
}

function BrowserData() {
  const { history, clearHistory } = useContent()
  return (
    <Sheet title="Kept in this browser">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-base">
          {history.length} {history.length === 1 ? 'item' : 'items'} in Made recently. They are not stored on the server.
        </p>
        {history.length > 0 && <ConfirmButton label="Clear the list" confirmLabel="Yes, clear it" onConfirm={clearHistory} />}
      </div>
    </Sheet>
  )
}

function Account() {
  const { user, signOut } = useAuth()
  const [online, setOnline] = useState(null)
  useEffect(() => {
    checkHealth().then(setOnline)
  }, [])
  return (
    <Sheet title="Account and server">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-base sm:grid-cols-[160px_1fr]">
        <dt className="font-semibold">Name</dt>
        <dd>{user?.displayName}</dd>
        <dt className="font-semibold">Email</dt>
        <dd>{user?.email}</dd>
        <dt className="font-semibold">Server</dt>
        <dd>
          <span className="font-mono text-sm">{API_BASE}</span>
          {online !== null && (
            <span className={`ml-3 text-sm font-semibold ${online ? 'text-success' : 'text-attention'}`}>
              {online ? 'Online' : 'Not reachable'}
            </span>
          )}
        </dd>
      </dl>
      <div className="mt-5 border-t border-rule pt-5">
        <Button variant="secondary" icon="logout" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </Sheet>
  )
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Your preferences, saved data and account." />
      <div className="flex flex-col gap-8">
        <Preferences />
        <SavedPlan />
        <BrowserData />
        <Account />
      </div>
    </>
  )
}
