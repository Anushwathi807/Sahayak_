import { BANDS } from '../../lib/grades'
import { cx } from '../../lib/cx'

export function BandChip({ band, className, title }) {
  if (!band) return <span className="text-sm text-ink-3">Not assessed</span>
  return (
    <span
      title={title ?? `Band ${band.id}: ${band.range} percent`}
      className={cx(
        'inline-flex min-w-10 items-center justify-center rounded-sm px-1.5 py-0.5 font-display text-xs font-bold tracking-wide',
        className
      )}
      style={{ background: band.color, color: band.light ? 'var(--color-ink)' : '#fff' }}
    >
      {band.id}
    </span>
  )
}

// The class laid out on the eight-band scale; the legend under it carries the counts as text.
export function BandStrip({ counts, total, tall = false }) {
  const summary = BANDS.map((b) => `${b.id} ${counts[b.id]}`).join(', ')
  return (
    <div>
      <div
        role="img"
        aria-label={`Students per grade band: ${summary}`}
        className={cx('flex overflow-hidden rounded-sm border border-ink bg-ground', tall ? 'h-8' : 'h-5')}
      >
        {total > 0 &&
          BANDS.map((b) =>
            counts[b.id] > 0 ? <span key={b.id} style={{ flex: counts[b.id], background: b.color }} /> : null
          )}
      </div>
      <dl className="mt-1.5 grid grid-cols-8 text-center">
        {BANDS.map((b) => (
          <div key={b.id}>
            <dt className="font-display text-xs font-bold text-ink-2">{b.id}</dt>
            <dd className="text-sm tabular-nums text-ink">{counts[b.id]}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
