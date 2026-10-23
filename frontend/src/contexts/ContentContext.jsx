import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { readJSON, removeKey, writeJSON } from '../lib/storage'
import { useAuth } from './AuthContext'

// The backend keeps no content history, so recent generations are kept in this browser only.
const HISTORY_LIMIT = 30
// Visual-aid pictures are about 100 KB each and browser storage holds only a few MB, so only the
// newest few keep their picture once stored; older ones keep their diagram and explanation.
const PICTURES_KEPT = 5
const historyKey = (uid) => `sahayak.history.${uid}`

function withoutOldPictures(entries) {
  let kept = 0
  return entries.map((entry) => {
    if (!entry.result?.image) return entry
    kept += 1
    if (kept <= PICTURES_KEPT) return entry
    return { ...entry, result: { ...entry.result, image: null, imageDropped: true } }
  })
}

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const { user } = useAuth()
  const [current, setCurrentState] = useState(null) // { id, kind, request, result, createdAt }
  const [history, setHistory] = useState([])

  useEffect(() => {
    setCurrentState(null)
    setHistory(user ? readJSON(localStorage, historyKey(user.uid), []) : [])
  }, [user])

  const persist = useCallback(
    (next) => {
      if (user) writeJSON(localStorage, historyKey(user.uid), withoutOldPictures(next))
      return next
    },
    [user]
  )

  // A new piece of content: becomes current and the newest history entry.
  const addContent = useCallback(
    (kind, request, result) => {
      const entry = { id: `${Date.now()}`, kind, request, result, createdAt: Date.now() }
      setCurrentState(entry)
      setHistory((prev) => persist([entry, ...prev].slice(0, HISTORY_LIMIT)))
      return entry
    },
    [persist]
  )

  // A revision of the current content (simplify, translate, edit, regenerate) replaces it in place.
  const reviseCurrent = useCallback(
    (result) => {
      if (!current) return
      const updated = { ...current, result }
      setCurrentState(updated)
      setHistory((list) => persist(list.map((e) => (e.id === current.id ? updated : e))))
    },
    [current, persist]
  )

  const openEntry = useCallback((entry) => setCurrentState(entry), [])

  const clearHistory = useCallback(() => {
    setHistory([])
    if (user) removeKey(localStorage, historyKey(user.uid))
  }, [user])

  const value = useMemo(
    () => ({ current, history, addContent, reviseCurrent, openEntry, clearHistory }),
    [current, history, addContent, reviseCurrent, openEntry, clearHistory]
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
