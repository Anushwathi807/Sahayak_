// Turns a saved lesson plan into the periods for one weekday, one period per subject and topic set.
export function periodsForDay(lessonPlan, dayName) {
  const day = lessonPlan?.result?.days?.find((d) => d.day === dayName)
  if (!day) return []
  const periods = []
  const byKey = new Map()
  for (const entry of day.entries) {
    const key = `${entry.subject}|${entry.topics.join('|')}`
    let period = byKey.get(key)
    if (!period) {
      period = { subject: entry.subject, topics: entry.topics, grades: [], entries: [] }
      byKey.set(key, period)
      periods.push(period)
    }
    period.grades.push(entry.grade)
    period.entries.push(entry)
  }
  for (const p of periods) {
    p.grades.sort((a, b) => a - b)
    p.entries.sort((a, b) => a.grade - b.grade)
  }
  return periods
}

export function planDays(lessonPlan) {
  return lessonPlan?.result?.days?.map((d) => d.day) ?? []
}
