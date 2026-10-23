import { BandChip, BandStrip } from '../../components/ui/Band'
import { ATTENTION_BELOW, bandFor, distribution } from '../../lib/grades'

// Sample class, labelled as such: the proof that sits beside the landing claim.
const SAMPLE = [
  ['Fatima', 2, 28],
  ['Rohan', 2, 31],
  ['Kavya', 4, 57],
  ['Ravi', 3, 75],
  ['Asha', 3, 92],
]

export default function GlanceExcerpt() {
  const counts = distribution(SAMPLE.map(([, , pct]) => pct))
  const low = SAMPLE.filter(([, , pct]) => pct < ATTENTION_BELOW)
  return (
    <figure className="overflow-hidden rounded-md border border-ink bg-sheet">
      <div aria-hidden="true" className="bg-masthead h-1.5" />
      <div className="flex items-baseline justify-between gap-3 border-b border-ink px-4 pt-3 pb-2.5">
        <p className="font-display text-xl font-bold">At a glance</p>
        <p className="text-xs text-ink-2">5 students in grades 2 to 4</p>
      </div>
      <div className="flex flex-col gap-4 px-4 py-3">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink font-display text-xs font-semibold tracking-wide uppercase">
              <th className="py-1.5 pr-3">Student</th>
              <th className="py-1.5 pr-3">Grade</th>
              <th className="py-1.5 pr-3 text-right">Average</th>
              <th className="py-1.5">Band</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE.map(([name, grade, pct]) => {
              const isLow = pct < ATTENTION_BELOW
              return (
                <tr key={name} className="border-b border-rule">
                  <td className="py-2 pr-3 font-medium">{name}</td>
                  <td className="py-2 pr-3 tabular-nums">{grade}</td>
                  <td
                    className={`py-2 pr-3 text-right font-semibold tabular-nums ${
                      isLow ? 'text-attention underline decoration-2 underline-offset-4' : 'text-entry'
                    }`}
                  >
                    {pct}%
                  </td>
                  <td className="py-2">
                    <BandChip band={bandFor(pct)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <BandStrip counts={counts} total={SAMPLE.length} />
        <p className="text-sm font-semibold text-attention">
          {low.length} below {ATTENTION_BELOW}%: {low.map(([name]) => name).join(', ')}
        </p>
      </div>
      <figcaption className="border-t border-rule px-4 py-2.5 text-xs text-ink-2">
        Sample class. After you sign in, this opens with your own students and today's periods.
      </figcaption>
    </figure>
  )
}
