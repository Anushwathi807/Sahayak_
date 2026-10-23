// CBSE eight-point scale: the only score scale used anywhere in the interface.
export const BANDS = [
  { id: 'A1', min: 91, range: '91 to 100', color: 'var(--color-band-a1)', light: false },
  { id: 'A2', min: 81, range: '81 to 90', color: 'var(--color-band-a2)', light: false },
  { id: 'B1', min: 71, range: '71 to 80', color: 'var(--color-band-b1)', light: true },
  { id: 'B2', min: 61, range: '61 to 70', color: 'var(--color-band-b2)', light: true },
  { id: 'C1', min: 51, range: '51 to 60', color: 'var(--color-band-c1)', light: true },
  { id: 'C2', min: 41, range: '41 to 50', color: 'var(--color-band-c2)', light: true },
  { id: 'D', min: 33, range: '33 to 40', color: 'var(--color-band-d)', light: false },
  { id: 'E', min: 0, range: '32 and below', color: 'var(--color-band-e)', light: false },
]

export const ATTENTION_BELOW = 33

export function bandFor(percent) {
  if (percent == null || Number.isNaN(percent)) return null
  const rounded = Math.round(percent)
  return BANDS.find((b) => rounded >= b.min) ?? BANDS[BANDS.length - 1]
}

export function percentOf(score, maxScore) {
  if (!maxScore) return null
  return (score / maxScore) * 100
}

// Mean of per-quiz percentages, so a 10-mark quiz and a 50-mark quiz weigh the same.
export function averagePercent(attempts) {
  const values = attempts.map((a) => percentOf(a.score, a.max_score)).filter((v) => v != null)
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function distribution(percents) {
  const counts = Object.fromEntries(BANDS.map((b) => [b.id, 0]))
  for (const p of percents) {
    const band = bandFor(p)
    if (band) counts[band.id] += 1
  }
  return counts
}
