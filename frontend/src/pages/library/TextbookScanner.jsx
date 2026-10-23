import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { Notice, Working } from '../../components/ui/Feedback'
import Icon from '../../components/ui/Icon'
import LanguageSelect from '../../components/ui/LanguageSelect'
import Sheet from '../../components/ui/Sheet'
import { useAuth } from '../../contexts/AuthContext'
import { useTeacher } from '../../contexts/TeacherContext'

const ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx'
const MAX_BYTES = 10 * 1024 * 1024

export default function TextbookScanner() {
  const { api } = useAuth()
  const { preferences } = useTeacher()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [fileName, setFileName] = useState('')
  const [page, setPage] = useState(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState(preferences.language)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)

  const reset = () => {
    setPage(null)
    setFileName('')
    setSaved(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const read = async (file) => {
    if (!file) return
    reset()
    setFileName(file.name)
    if (file.size > MAX_BYTES) {
      setError('That file is larger than 10 MB. Use a smaller photo or a single page.')
      return
    }
    setReading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      setPage(await api.upload('/read-textbook-page', form))
    } catch (err) {
      setError(err.message)
    } finally {
      setReading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await api.post('/curriculum/ingest', { subject: page.subject, language, full_text: page.full_text })
      setSaved(res.chunks_stored)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      title="Scan a textbook page"
      description="Saved pages ground Sahayak's explanations in your own book."
      action={page && <Button variant="secondary" size="sm" icon="restart_alt" onClick={reset}>Scan another page</Button>}
    >
      {!page && (
        <div className="flex flex-col gap-4">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              read(e.dataTransfer.files?.[0])
            }}
            className="flex cursor-pointer flex-col items-start gap-2 rounded-md border border-dashed border-field bg-ground px-5 py-6 hover:border-ink"
          >
            <span className="flex items-center gap-2 text-base font-semibold text-ink">
              <Icon name="upload_file" size={22} className="text-brand" />
              Choose a photo or file of the page
            </span>
            <span className="text-sm text-ink-2">JPG, PNG, WEBP, PDF, Word (.docx) or Excel (.xlsx), up to 10 MB. You can also drop it here.</span>
            {fileName && <span className="text-sm font-medium text-entry">{fileName}</span>}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              disabled={reading}
              onChange={(e) => read(e.target.files?.[0])}
            />
          </label>
          {reading && <Working>Reading the page. Photos and PDFs take about 10 seconds.</Working>}
          {error && <Notice tone="error">{error}</Notice>}
        </div>
      )}

      {page && (
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="font-display text-xl font-semibold">{page.subject}</h3>
            <p className="text-sm text-ink-2">Read from {fileName}</p>
          </div>
          {page.topics.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Topics on this page">
              {page.topics.map((t) => (
                <li key={t} className="rounded-sm border border-rule bg-ground px-2.5 py-1 text-sm">
                  {t}
                </li>
              ))}
            </ul>
          )}
          <p className="max-w-[70ch] text-base leading-relaxed">{page.summary}</p>
          <details className="rounded-sm border border-rule">
            <summary className="cursor-pointer px-3.5 py-2.5 text-sm font-semibold text-entry">Show the text Sahayak read</summary>
            <p className="max-h-72 overflow-y-auto border-t border-rule px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap">
              {page.full_text}
            </p>
          </details>

          <div className="grid grid-cols-1 items-end gap-4 border-t border-rule pt-5 sm:grid-cols-[minmax(0,240px)_auto]">
            <LanguageSelect label="Language of this page" value={language} onChange={setLanguage} />
            <Button icon="bookmark_add" onClick={save} loading={saving} loadingLabel="Saving" disabled={saved != null}>
              {saved != null ? 'Saved to curriculum' : 'Save to my curriculum'}
            </Button>
          </div>
          {saved != null && (
            <Notice tone="success">
              Saved as {saved} {saved === 1 ? 'passage' : 'passages'}. Explanations from Ask Sahayak will now draw on this page.
            </Notice>
          )}
          {error && <Notice tone="error">{error}</Notice>}

          <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-5">
            <p className="flex-1 text-sm text-ink">Make a worksheet from this page with its subject, topics and summary filled in.</p>
            <Button
              variant="secondary"
              icon="assignment"
              onClick={() =>
                navigate('/worksheets', {
                  state: { prefill: { subject: page.subject, topics: page.topics, summary: page.summary, language } },
                })
              }
            >
              Make a worksheet
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
