// Values sent to the backend must match its Language enum exactly.
export const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'हिन्दी (Hindi)' },
  { value: 'Marathi', label: 'मराठी (Marathi)' },
  { value: 'Tamil', label: 'தமிழ் (Tamil)' },
]

export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8]

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export const ACTIVITY_LABELS = {
  direct_teaching: 'Direct teaching',
  independent_worksheet: 'Independent worksheet',
  group_activity: 'Group activity',
  peer_reading: 'Peer reading',
}

export const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple choice' },
  { value: 'true_false', label: 'True or false' },
  { value: 'fill_blank', label: 'Fill in the blank' },
  { value: 'short_answer', label: 'Short answer' },
  { value: 'long_answer', label: 'Long answer' },
  { value: 'match_the_following', label: 'Match the following' },
  { value: 'diagram_based', label: 'Diagram based' },
]

export const QUESTION_TYPE_LABELS = Object.fromEntries(QUESTION_TYPES.map((q) => [q.value, q.label]))

export function formatGrades(grades) {
  if (!grades || grades.length === 0) return ''
  const sorted = [...grades].sort((a, b) => a - b)
  return `${sorted.length === 1 ? 'Grade' : 'Grades'} ${sorted.join(', ')}`
}

export function todayWeekday() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

export function longDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}
