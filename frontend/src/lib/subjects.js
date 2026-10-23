// Every subject owns one ink, identical on the schedule, planner, worksheets and analytics.
const KNOWN = {
  science: 1,
  maths: 2,
  math: 2,
  mathematics: 2,
  hindi: 3,
  evs: 4,
  'environmental studies': 4,
  environment: 4,
  marathi: 5,
  english: 6,
  tamil: 7,
  'social science': 8,
  'social studies': 8,
  sst: 8,
  history: 8,
  geography: 8,
}

export function subjectInk(subject) {
  const key = (subject || '').trim().toLowerCase()
  let slot = KNOWN[key]
  if (!slot) {
    let hash = 0
    for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
    slot = (hash % 8) + 1
  }
  return `var(--color-subject-${slot})`
}
