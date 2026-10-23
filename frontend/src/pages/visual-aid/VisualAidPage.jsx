import { useEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import { EmptyState, Notice, Working } from '../../components/ui/Feedback'
import { Field, TextArea } from '../../components/ui/Field'
import LanguageSelect from '../../components/ui/LanguageSelect'
import PageHeader from '../../components/ui/PageHeader'
import Sheet from '../../components/ui/Sheet'
import { useAuth } from '../../contexts/AuthContext'
import { useContent } from '../../contexts/ContentContext'
import { useTeacher } from '../../contexts/TeacherContext'
import { saveBlob } from '../../lib/api'
import { labelAnchor, labelledPictureBlob } from './labelledPicture'

const LAYOUT_TITLES = { cycle: 'Cycle diagram', sequence: 'Step-by-step diagram', block: 'Block diagram' }

function fileName(text, fallback) {
  return text.slice(0, 40).replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || fallback
}

// Why a visual aid has no picture. Items saved before pictures existed carry neither field and say nothing.
function missingPictureNote(result) {
  if (result.image) return ''
  if (result.imageDropped) return 'The picture was not kept, to save space in your Library. Draw again for a new one.'
  return result.image_note ? `No picture this time. ${result.image_note}` : ''
}

export default function VisualAidPage() {
  const { api } = useAuth()
  const { current, addContent } = useContent()
  const { preferences, loaded } = useTeacher()
  const shown = current?.kind === 'visual_aid' ? current : null

  const [text, setText] = useState(shown?.request.text ?? '')
  const [language, setLanguage] = useState(shown?.request.language ?? preferences.language)
  const initialised = useRef(Boolean(shown))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showLabels, setShowLabels] = useState(true)

  // Take the saved default once the account loads, then leave it to this picker.
  useEffect(() => {
    if (!loaded || initialised.current) return
    initialised.current = true
    setLanguage(preferences.language)
  }, [loaded, preferences.language])

  const run = async (request) => {
    setBusy(true)
    setError('')
    try {
      const result = await api.post('/generate/visual-aid', request)
      addContent('visual_aid', request, result)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const generate = (e) => {
    e.preventDefault()
    if (!text.trim()) {
      setError('Describe what the visual aid should show.')
      return
    }
    run({ text: text.trim(), language })
  }

  const downloadDiagram = () => {
    const blob = new Blob([shown.result.svg], { type: 'image/svg+xml' })
    saveBlob(blob, `${fileName(shown.request.text, 'diagram')}-diagram.svg`)
  }

  const downloadPicture = async () => {
    const { image, stages, label_positions: positions } = shown.result
    const labelled = showLabels && positions
    const blob = labelled ? await labelledPictureBlob(image, stages, positions) : await (await fetch(image)).blob()
    saveBlob(blob, `${fileName(shown.request.text, 'picture')}-picture${labelled ? '-labelled' : ''}.jpg`)
  }

  const result = shown?.result
  const note = result ? missingPictureNote(result) : ''

  return (
    <>
      <PageHeader
        title="Visual aids"
        description="Describe a process, a cycle or a workflow. Sahayak draws a picture to show the class, a labelled diagram to copy onto the blackboard, and explains each stage."
      />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Sheet title="Describe the visual aid" className="print:hidden">
          <form onSubmit={generate} className="flex flex-col gap-4">
            <Field label="What should it show?" hint="Ask for a block diagram or flowchart to get boxes instead of circles.">
              {({ id }) => (
                <TextArea
                  id={id}
                  rows={4}
                  value={text}
                  disabled={busy}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="For example: The water cycle"
                />
              )}
            </Field>
            <LanguageSelect
              label="Labels and explanation in"
              value={language}
              onChange={(v) => {
                initialised.current = true
                setLanguage(v)
              }}
            />
            <Button type="submit" icon="draw" loading={busy} loadingLabel="Drawing">
              Draw the visual aid
            </Button>
            {busy && <Working>Writing the stages and drawing the picture. This usually takes 15 to 40 seconds.</Working>}
            {error && <Notice tone="error">{error}</Notice>}
          </form>
        </Sheet>

        {result ? (
          <Sheet
            title={result.title || LAYOUT_TITLES[result.layout]}
            description={shown.request.text}
            action={
              <div className="flex gap-2 print:hidden">
                <Button
                  variant="secondary"
                  size="sm"
                  icon="refresh"
                  loading={busy}
                  loadingLabel="Drawing"
                  onClick={() => run(shown.request)}
                >
                  Draw again
                </Button>
                <Button variant="secondary" size="sm" icon="print" onClick={() => window.print()}>
                  Print
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-8">
              {note && <Notice tone="caution" className="print:hidden">{note}</Notice>}

              <div className={result.image ? 'grid grid-cols-1 gap-6 md:grid-cols-2' : ''}>
                {result.image && (
                  <figure className="flex flex-col gap-2">
                    <div className="relative">
                      <img
                        src={result.image}
                        alt={`Picture showing ${result.stages.map((s) => s.label).join(', ')}`}
                        className="w-full rounded-sm border border-rule"
                      />
                      {showLabels &&
                        result.label_positions?.map((p) => (
                          <span
                            key={p.stage}
                            className="absolute flex max-w-[60%] items-baseline gap-1 rounded-sm border border-ink bg-sheet px-1.5 py-px text-xs leading-snug font-semibold text-ink sm:text-sm"
                            style={{
                              left: `${p.x / 10}%`,
                              top: `${p.y / 10}%`,
                              transform: `translate(-${labelAnchor(p.x) * 100}%, -50%)`,
                            }}
                          >
                            <span className="font-bold tabular-nums text-ink-2 max-sm:text-ink">{p.stage}</span>
                            {/* Phones show the number only; it matches the numbered list below. */}
                            <span className="max-sm:sr-only">{result.stages[p.stage - 1]?.label}</span>
                          </span>
                        ))}
                    </div>
                    <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-ink-2">
                      Show this to the class while you explain each stage.
                      <span className="flex items-center gap-4 print:hidden">
                        {result.label_positions && (
                          <label className="flex cursor-pointer items-center gap-2 font-medium text-ink">
                            <input
                              type="checkbox"
                              checked={showLabels}
                              onChange={(e) => setShowLabels(e.target.checked)}
                              className="h-4 w-4 accent-brand"
                            />
                            Labels
                          </label>
                        )}
                        <Button variant="quiet" icon="download" onClick={downloadPicture} className="text-sm">
                          Download picture
                        </Button>
                      </span>
                    </figcaption>
                  </figure>
                )}

                <section>
                  <h3 className="mb-1 font-display text-base font-semibold">What happens at each stage</h3>
                  <ol>
                    {result.stages.map((s, i) => (
                      <li key={`${s.label}-${i}`} className="flex gap-3 border-b border-rule py-3 last:border-b-0">
                        <span className="w-5 shrink-0 text-right font-display font-bold tabular-nums text-ink-2">{i + 1}</span>
                        <div>
                          <p className="font-semibold text-ink">{s.label}</p>
                          {s.explanation && <p className="text-base leading-relaxed text-ink-2">{s.explanation}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <section className="flex flex-col gap-3 border-t border-rule pt-6">
                <h3 className="font-display text-base font-semibold">{LAYOUT_TITLES[result.layout]} for the blackboard</h3>
                <div
                  className="diagram-frame mx-auto w-full max-w-lg rounded-sm border border-rule bg-sheet p-3"
                  role="img"
                  aria-label={`Diagram: ${result.stages.map((s) => s.label).join(', ')}`}
                  dangerouslySetInnerHTML={{ __html: result.svg }}
                />
                <div className="mx-auto flex w-full max-w-lg flex-wrap items-start justify-between gap-2">
                  <p className="max-w-[46ch] text-sm leading-relaxed text-ink-2">{result.caption}</p>
                  <Button variant="quiet" icon="download" onClick={downloadDiagram} className="text-sm print:hidden">
                    Download diagram
                  </Button>
                </div>
              </section>
            </div>
          </Sheet>
        ) : (
          <Sheet>
            <EmptyState icon="draw" title="Your visual aid appears here">
              Sahayak draws a picture for the class, a labelled diagram you can copy onto the board, and a short
              explanation of each stage. Visual aids you make are also kept in your Library.
            </EmptyState>
          </Sheet>
        )}
      </div>
    </>
  )
}
