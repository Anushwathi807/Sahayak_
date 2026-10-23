import { doc, getDoc, setDoc } from 'firebase/firestore'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

// Preferences and the latest lesson plan live on the teacher's own Firestore doc
// (teachers/{uid}), which the security rules let only that teacher read and write.
const DEFAULT_PREFERENCES = { language: 'English', grades: [], nuggetGrade: 3 }

const TeacherContext = createContext(null)

export function TeacherProvider({ children }) {
  const { user } = useAuth()
  const [loaded, setLoaded] = useState(false)
  const [preferences, setPreferencesState] = useState(DEFAULT_PREFERENCES)
  const [lessonPlan, setLessonPlan] = useState(null)

  useEffect(() => {
    if (!user) {
      setPreferencesState(DEFAULT_PREFERENCES)
      setLessonPlan(null)
      setLoaded(false)
      return
    }
    let cancelled = false
    getDoc(doc(db, 'teachers', user.uid))
      .then((snap) => {
        if (cancelled) return
        const data = snap.exists() ? snap.data() : {}
        setPreferencesState({ ...DEFAULT_PREFERENCES, ...(data.preferences || {}) })
        setLessonPlan(data.lessonPlan || null)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const savePreferences = useCallback(
    async (partial) => {
      const next = { ...preferences, ...partial }
      setPreferencesState(next)
      if (user) {
        await setDoc(doc(db, 'teachers', user.uid), { preferences: next }, { mergeFields: ['preferences'] })
      }
    },
    [preferences, user]
  )

  const saveLessonPlan = useCallback(
    async (plan) => {
      const record = plan ? { ...plan, savedAt: new Date().toISOString() } : null
      setLessonPlan(record)
      if (user) {
        await setDoc(doc(db, 'teachers', user.uid), { lessonPlan: record }, { mergeFields: ['lessonPlan'] })
      }
    },
    [user]
  )

  const value = useMemo(
    () => ({ loaded, preferences, savePreferences, lessonPlan, saveLessonPlan }),
    [loaded, preferences, savePreferences, lessonPlan, saveLessonPlan]
  )

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>
}

export function useTeacher() {
  const ctx = useContext(TeacherContext)
  if (!ctx) throw new Error('useTeacher must be used within TeacherProvider')
  return ctx
}
