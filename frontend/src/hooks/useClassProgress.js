import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { averagePercent, bandFor, distribution } from '../lib/grades'

// Built only from existing endpoints: /students, /quizzes and /students/{id}/attempts.
// Cached for the session so opening At a glance twice does not refetch every student.
let cache = null // { uid, data }
const listeners = new Set()

export function invalidateClassProgress() {
  cache = null
  listeners.forEach((fn) => fn())
}

async function load(api) {
  const [students, quizzes] = await Promise.all([api.get('/students'), api.get('/quizzes')])
  const attemptsByStudent = await Promise.all(
    students.map((s) => api.get(`/students/${s.id}/attempts`).catch(() => []))
  )
  const rows = students.map((student, i) => {
    const attempts = attemptsByStudent[i]
    const average = averagePercent(attempts)
    return { student, attempts, average, band: bandFor(average) }
  })
  const assessed = rows.filter((r) => r.average != null)
  return {
    students,
    quizzes,
    rows,
    assessedCount: assessed.length,
    distribution: distribution(assessed.map((r) => r.average)),
  }
}

export function useClassProgress({ enabled = true } = {}) {
  const { api, user } = useAuth()
  const [state, setState] = useState(() =>
    cache && cache.uid === user?.uid ? { status: 'ready', data: cache.data, error: null } : { status: 'idle', data: null, error: null }
  )
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const onInvalidate = () => setVersion((v) => v + 1)
    listeners.add(onInvalidate)
    return () => listeners.delete(onInvalidate)
  }, [])

  useEffect(() => {
    if (!enabled || !user) return
    if (cache && cache.uid === user.uid) {
      setState({ status: 'ready', data: cache.data, error: null })
      return
    }
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading', error: null }))
    load(api)
      .then((data) => {
        cache = { uid: user.uid, data }
        if (!cancelled) setState({ status: 'ready', data, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', data: null, error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [api, user, enabled, version])

  const refresh = useCallback(() => invalidateClassProgress(), [])

  return { ...state, refresh }
}

// Weakest first, unassessed students last.
export function sortWeakestFirst(rows) {
  return [...rows].sort((a, b) => {
    if (a.average == null && b.average == null) return a.student.name.localeCompare(b.student.name)
    if (a.average == null) return 1
    if (b.average == null) return -1
    return a.average - b.average
  })
}
