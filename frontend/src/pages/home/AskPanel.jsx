import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import ChoiceGroup from '../../components/ui/ChoiceGroup'
import { Notice, Working } from '../../components/ui/Feedback'
import { Field, TextArea } from '../../components/ui/Field'
import LanguageSelect from '../../components/ui/LanguageSelect'
import Sheet from '../../components/ui/Sheet'
import { useAuth } from '../../contexts/AuthContext'
import { useContent } from '../../contexts/ContentContext'
import { useTeacher } from '../../contexts/TeacherContext'
import { startListening } from '../../lib/speech'

const MODES = [
  { value: 'auto', label: 'Let Sahayak decide', hint: 'Story, explanation, diagram, worksheet or plan' },
  { value: 'hyperlocal', label: 'Story or lesson', hint: 'Content set in your local context' },
  { value: 'knowledge_base', label: 'Explain a concept', hint: 'A simple answer with an analogy' },
  { value: 'visual_aid', label: 'Blackboard diagram', hint: 'A cycle or step-by-step drawing' },
]

const PLACEHOLDERS = {
  auto: 'For example: Tell a story about saving water in our village for grades 3 and 4',
  hyperlocal: 'For example: A short story about a farmer measuring his field, to teach area',
  knowledge_base: 'For example: Why does the moon change its shape?',
  visual_aid: 'For example: Show how a seed grows into a tree',
}

const EXAMPLES = [
  { mode: 'hyperlocal', text: 'Write a story about two children saving water in their village during summer' },
  { mode: 'knowledge_base', text: 'Why do we see lightning before we hear thunder?' },
  { mode: 'visual_aid', text: 'Show the water cycle from the village pond to the clouds and back' },
  { mode: 'auto', text: 'Make a worksheet on fractions for grades 3, 4 and 5' },
]

const INTENT_TO_MODE = {
  hyperlocal_content: 'hyperlocal',
  knowledge_base: 'knowledge_base',
  visual_aid: 'visual_aid',
}

export default function AskPanel() {
  const { api } = useAuth()
  const { addContent } = useContent()
  const { preferences, loaded } = useTeacher()
  const navigate = useNavigate()

  const [mode, setMode] = useState('auto')
  const [text, setText] = useState('')
  const [language, setLanguage] = useState(preferences.language)
  const initialised = useRef(false)
  const [stage, setStage] = useState('')
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)

  // Start from the saved default once the account loads; after that the
  // masthead language only drives the fact of the day, not this answer.
  useEffect(() => {
    if (!loaded || initialised.current) return
    initialised.current = true
    setLanguage(preferences.language)
  }, [loaded, preferences.language])

  const listen = () => {
    setError('')
    setListening(true)
    startListening(
      language,
      (transcript) => {
        setListening(false)
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
      },
      (message) => {
        setListening(false)
        setError(message)
      }
    )
  }

  const generate = async (target, request) => {
    if (target === 'visual_aid') {
      setStage('Drawing the diagram')
      const result = await api.post('/generate/visual-aid', request)
      addContent('visual_aid', request, result)
      navigate('/visual-aid')
      return
    }
    setStage(`Writing in ${request.language}`)
    const path = target === 'hyperlocal' ? '/generate/hyperlocal' : '/generate/knowledge-base'
    const result = await api.post(path, { ...request, is_regenerate: false })
    addContent(target, request, result)
    navigate('/content')
  }

  const submit = async (e) => {
    e.preventDefault()
    const request = { text: text.trim(), language }
    if (!request.text) {
      setError('Type or speak your request first.')
      return
    }
    setError('')
    try {
      if (mode !== 'auto') {
        await generate(mode, request)
        return
      }
      setStage('Reading your request')
      const intent = await api.post('/route', { text: request.text })
      if (INTENT_TO_MODE[intent.category]) {
        await generate(INTENT_TO_MODE[intent.category], request)
      } else if (intent.category === 'worksheet') {
        navigate('/worksheets', {
          state: {
            prefill: { summary: request.text, language },
            notice: 'Sahayak read this as a worksheet request. Add the subject and topics, then continue.',
          },
        })
      } else if (intent.category === 'lesson_plan') {
        navigate('/lesson-planner', {
          state: { notice: "Sahayak read this as a weekly plan request. Add each day's subjects below." },
        })
      } else {
        setStage('')
        setError(
          `Sahayak could not tell what to make${intent.summary ? ` ("${intent.summary}")` : ''}. Choose one of the options above and try again.`
        )
      }
    } catch (err) {
      setStage('')
      setError(err.message)
    }
  }

  const busy = Boolean(stage)

  return (
    <Sheet title="Ask Sahayak" description="Ask in any of your four languages. Sahayak answers in the language you choose.">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <ChoiceGroup legend="What do you need?" name="mode" options={MODES} value={mode} onChange={setMode} />
        <Field label="Your request">
          {({ id }) => (
            <TextArea
              id={id}
              rows={4}
              value={text}
              disabled={busy}
              placeholder={PLACEHOLDERS[mode]}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </Field>
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,240px)_auto_1fr]">
          <LanguageSelect
            label="Answer in"
            value={language}
            onChange={(v) => {
              initialised.current = true
              setLanguage(v)
            }}
          />
          <Button variant="secondary" icon="mic" onClick={listen} loading={listening} loadingLabel="Listening" disabled={busy}>
            Speak
          </Button>
          <div className="flex sm:justify-end">
            <Button type="submit" size="lg" icon="send" loading={busy} loadingLabel="Working" className="w-full sm:w-auto">
              Ask Sahayak
            </Button>
          </div>
        </div>
        {busy && <Working>{stage}. This usually takes 5 to 15 seconds.</Working>}
        {error && <Notice tone="error">{error}</Notice>}
        <div className="border-t border-rule pt-4">
          <p className="mb-2 text-sm font-semibold text-ink">Try one of these</p>
          <ul className="flex flex-col gap-1.5">
            {EXAMPLES.map((ex) => (
              <li key={ex.text}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setMode(ex.mode)
                    setText(ex.text)
                    setError('')
                  }}
                  className="text-left text-sm text-entry hover:underline disabled:opacity-50"
                >
                  {ex.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </Sheet>
  )
}
