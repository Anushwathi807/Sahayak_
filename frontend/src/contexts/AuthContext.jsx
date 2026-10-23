import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, db, googleProvider } from '../firebase'
import { createApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (firebaseUser) {
        try {
          const teacherRef = doc(db, 'teachers', firebaseUser.uid)
          const snap = await getDoc(teacherRef)
          if (!snap.exists()) {
            await setDoc(teacherRef, {
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              createdAt: serverTimestamp(),
            })
          }
        } catch {
          /* the profile doc is optional for using the app */
        }
      }
    })
    return unsubscribe
  }, [])

  const api = useMemo(() => createApi(() => auth.currentUser?.getIdToken()), [])

  const value = useMemo(
    () => ({
      user,
      loading,
      api,
      signIn: () => signInWithPopup(auth, googleProvider),
      signOut: () => signOut(auth),
    }),
    [user, loading, api]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
