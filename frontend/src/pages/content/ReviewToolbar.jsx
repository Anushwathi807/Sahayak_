import { useState } from 'react'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { LANGUAGES } from '../../lib/constants'

export default function ReviewToolbar({ busy, language, speaking, onSimplify, onTranslate, onEdit, onRegenerate, onSpeak, onCopy, copied }) {
  const [chosen, setTarget] = useState('')
  const target = chosen && chosen !== language ? chosen : LANGUAGES.find((l) => l.value !== language).value
  const [editing, setEditing] = useState(false)
  const [instruction, setInstruction] = useState('')

  const submitEdit = (e) => {
    e.preventDefault()
    if (!instruction.trim()) return
    onEdit(instruction.trim()).then((ok) => {
      if (ok) {
        setInstruction('')
        setEditing(false)
      }
    })
  }

  return (
    <div className="sticky top-16 z-20 mb-6 rounded-md border border-rule bg-sheet print:hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5">
        <div role="group" aria-label="Revise" className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" icon="auto_fix_high" onClick={onSimplify} disabled={!!busy}>
            Simplify
          </Button>
          <Button variant="secondary" size="sm" icon="edit" onClick={() => setEditing((v) => !v)} disabled={!!busy} aria-expanded={editing}>
            Edit
          </Button>
          <Button variant="secondary" size="sm" icon="refresh" onClick={onRegenerate} disabled={!!busy}>
            Regenerate
          </Button>
        </div>
        <span className="h-7 w-px bg-rule max-sm:hidden" aria-hidden="true" />
        <div role="group" aria-label="Translate" className="flex items-center gap-2">
          <label htmlFor="translate-target" className="text-sm font-semibold whitespace-nowrap">
            Translate to
          </label>
          <div className="w-40">
            <Select id="translate-target" value={target} onChange={(e) => setTarget(e.target.value)} className="h-9 text-sm">
              {LANGUAGES.filter((l) => l.value !== language).map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="secondary" size="sm" icon="translate" onClick={() => onTranslate(target)} disabled={!!busy}>
            Translate
          </Button>
        </div>
        <span className="h-7 w-px bg-rule max-sm:hidden" aria-hidden="true" />
        <div role="group" aria-label="Use" className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" icon={speaking ? 'stop_circle' : 'volume_up'} onClick={onSpeak}>
            {speaking ? 'Stop' : 'Read aloud'}
          </Button>
          <Button variant="secondary" size="sm" icon={copied ? 'check' : 'content_copy'} onClick={onCopy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="secondary" size="sm" icon="print" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>
      {editing && (
        <form onSubmit={submitEdit} className="flex flex-wrap items-center gap-2 border-t border-rule px-3 py-2.5">
          <label htmlFor="edit-instruction" className="sr-only">
            Describe the change
          </label>
          <Input
            id="edit-instruction"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe the change, for example: make the ending happier"
            className="h-9 min-w-[240px] flex-1 text-sm"
            autoFocus
          />
          <Button type="submit" size="sm" disabled={!instruction.trim() || !!busy}>
            Apply change
          </Button>
          <Button variant="quiet" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </form>
      )}
    </div>
  )
}
