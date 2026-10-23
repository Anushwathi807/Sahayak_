import { useEffect, useState } from 'react'
import { ButtonLink } from '../../components/ui/Button'
import { EmptyState, Notice, Working } from '../../components/ui/Feedback'
import PageHeader from '../../components/ui/PageHeader'
import Sheet from '../../components/ui/Sheet'
import { useAuth } from '../../contexts/AuthContext'
import { useContent } from '../../contexts/ContentContext'
import { readAloud, stopReading } from '../../lib/speech'
import ReviewToolbar from './ReviewToolbar'

const BUSY_LABELS = {
  simplify: 'Simplifying',
  translate: 'Translating',
  edit: 'Applying your change',
  regenerate: 'Writing a new version',
}

function bodyText(kind, result) {
  if (kind === 'hyperlocal') return result.content
  return result.analogy ? `${result.explanation}\n\n${result.analogy}` : result.explanation
}

function Paragraphs({ text }) {
  return text
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((p, i) => (
      <p key={i} className="whitespace-pre-line">
        {p.trim()}
      </p>
    ))
}

export default function ContentPage() {
  const { api } = useAuth()
  const { current, reviseCurrent } = useContent()
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => () => stopReading(), [])

  if (!current || current.kind === 'visual_aid') {
    return (
      <>
        <PageHeader title="Nothing open" />
        <EmptyState
          icon="article"
          title="Ask Sahayak for a story or an explanation"
          action={<ButtonLink to="/home">Go to Ask Sahayak</ButtonLink>}
        >
          What you make opens here, ready to simplify, translate, edit, read aloud or print. Earlier items are in your Library.
        </EmptyState>
      </>
    )
  }

  const { kind, request, result } = current
  const contentType = kind === 'hyperlocal' ? 'hyperlocal_content' : 'knowledge_base'
  const text = bodyText(kind, result)

  const applyText = (newText, language = result.language) => {
    if (kind === 'hyperlocal') reviseCurrent({ ...result, content: newText, language })
    else reviseCurrent({ ...result, explanation: newText, analogy: '', revised: true, language })
  }

  const run = async (action, fn, doneMessage) => {
    setBusy(action)
    setError('')
    setNotice('')
    stopReading()
    setSpeaking(false)
    try {
      await fn()
      setNotice(doneMessage)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setBusy('')
    }
  }

  const simplify = () =>
    run(
      'simplify',
      async () => {
        const res = await api.post('/review/simplify', { text, language: result.language, content_type: contentType })
        applyText(res.text)
      },
      'Simplified for younger readers.'
    )

  const translate = (target) =>
    run(
      'translate',
      async () => {
        const res = await api.post('/review/translate', { text, target_language: target, content_type: contentType })
        applyText(res.text, target)
      },
      `Translated to ${target}.`
    )

  const edit = (instruction) =>
    run(
      'edit',
      async () => {
        const res = await api.post('/review/edit', { text, instruction, language: result.language, content_type: contentType })
        applyText(res.text)
      },
      'Your change was applied.'
    )

  const regenerate = () =>
    run(
      'regenerate',
      async () => {
        const path = kind === 'hyperlocal' ? '/generate/hyperlocal' : '/generate/knowledge-base'
        const res = await api.post(path, { text: request.text, language: result.language, is_regenerate: true })
        reviseCurrent(res)
      },
      'A new version replaced the old one.'
    )

  const speak = () => {
    if (speaking) {
      stopReading()
      setSpeaking(false)
      return
    }
    setError('')
    setSpeaking(true)
    readAloud(text, result.language, {
      onError: (msg) => {
        setError(msg)
        setSpeaking(false)
      },
      onEnd: () => setSpeaking(false),
    })
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copying is blocked in this browser. Select the text and copy it instead.')
    }
  }

  const isStory = kind === 'hyperlocal'

  return (
    <>
      <PageHeader
        title={isStory ? result.title : request.text}
        description={isStory ? `Story in ${result.language}, from your request: "${request.text}"` : `Explanation in ${result.language}`}
        actions={<ButtonLink to="/home" variant="secondary" icon="add">Ask something else</ButtonLink>}
      />
      <ReviewToolbar
        busy={busy}
        language={result.language}
        speaking={speaking}
        copied={copied}
        onSimplify={simplify}
        onTranslate={translate}
        onEdit={edit}
        onRegenerate={regenerate}
        onSpeak={speak}
        onCopy={copy}
      />
      <div className="mb-6 flex flex-col gap-3 empty:hidden print:hidden">
        {busy && <Working>{BUSY_LABELS[busy]}. This usually takes 5 to 15 seconds.</Working>}
        {error && <Notice tone="error">{error}</Notice>}
        {notice && !busy && !error && <Notice tone="success">{notice}</Notice>}
      </div>
      <Sheet className={busy ? 'opacity-60' : undefined} bodyClassName="px-6 py-8 sm:px-10">
        <article className="flex max-w-[68ch] flex-col gap-5 text-lg leading-relaxed text-ink">
          {isStory ? (
            <Paragraphs text={result.content} />
          ) : (
            <>
              <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">{result.revised ? 'Revised explanation' : 'Explanation'}</h2>
                <Paragraphs text={result.explanation} />
              </section>
              {result.analogy && (
                <section className="flex flex-col gap-4 border-t border-rule pt-6">
                  <h2 className="text-xl font-semibold">A local analogy</h2>
                  <Paragraphs text={result.analogy} />
                </section>
              )}
            </>
          )}
        </article>
      </Sheet>
    </>
  )
}
