import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button, { ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/Feedback'
import Sheet from '../../components/ui/Sheet'
import { useContent } from '../../contexts/ContentContext'
import { cx } from '../../lib/cx'

const KINDS = {
  hyperlocal: { label: 'Story', route: '/content' },
  knowledge_base: { label: 'Explanation', route: '/content' },
  visual_aid: { label: 'Visual aid', route: '/visual-aid' },
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'hyperlocal', label: 'Stories' },
  { value: 'knowledge_base', label: 'Explanations' },
  { value: 'visual_aid', label: 'Visual aids' },
]

function titleOf(entry) {
  return entry.kind === 'hyperlocal' ? entry.result.title : entry.request.text
}

export default function RecentList() {
  const { history, openEntry } = useContent()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const rows = filter === 'all' ? history : history.filter((e) => e.kind === filter)

  return (
    <Sheet title="Made recently" description="Kept in this browser, newest first." bodyClassName="p-0">
      {history.length === 0 ? (
        <div className="px-5 py-2">
          <EmptyState title="Nothing made yet" action={<ButtonLink to="/home" size="sm">Go to Ask Sahayak</ButtonLink>}>
            Stories, explanations and diagrams you make are listed here so you can reopen, revise or print them later.
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b border-rule px-5 py-3" role="group" aria-label="Filter by type">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={cx(
                  'h-8 rounded-sm border px-3 text-sm font-semibold',
                  filter === f.value ? 'border-ink bg-ink text-white' : 'border-field bg-sheet text-ink hover:border-ink'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full sm:min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
                  <th className="px-5 py-2">Type</th>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3 max-sm:hidden">Language</th>
                  <th className="py-2 pr-3 max-sm:hidden">Made</th>
                  <th className="py-2 pr-5" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id} className="border-b border-rule last:border-b-0">
                    <td className="px-5 py-3 text-sm font-semibold text-ink-2">{KINDS[entry.kind].label}</td>
                    <td className="max-w-[420px] py-3 pr-3">
                      <span className="line-clamp-2 text-base">{titleOf(entry)}</span>
                    </td>
                    <td className="py-3 pr-3 text-sm max-sm:hidden">{entry.result.language || entry.request.language}</td>
                    <td className="py-3 pr-3 text-sm tabular-nums text-ink-2 max-sm:hidden">
                      {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 pr-5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          openEntry(entry)
                          navigate(KINDS[entry.kind].route)
                        }}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-4 text-sm text-ink-2">
                      Nothing of this type yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Sheet>
  )
}
