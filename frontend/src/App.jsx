import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db, googleProvider } from './firebase'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (firebaseUser) {
        const teacherRef = doc(db, 'teachers', firebaseUser.uid)
        const snap = await getDoc(teacherRef)
        if (!snap.exists()) {
          await setDoc(teacherRef, {
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            createdAt: serverTimestamp(),
          })
        }
      }
    })
    return unsubscribe
  }, [])

  const handleSignIn = () => signInWithPopup(auth, googleProvider)
  const handleSignOut = () => signOut(auth)

  const testBackend = async () => {
    setBackendStatus('checking...')
    const token = await user.getIdToken()
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      setBackendStatus(`error: ${res.status}`)
      return
    }
    const data = await res.json()
    setBackendStatus(`backend confirmed: ${data.email}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-3xl font-semibold text-gray-800">Sahayak</h1>
      {user ? (
        <>
          <p className="text-gray-600">Signed in as {user.displayName}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={testBackend}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Test backend connection
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Sign out
            </button>
          </div>
          {backendStatus && <p className="text-sm text-gray-500">{backendStatus}</p>}
        </>
      ) : (
        <button
          type="button"
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  )
}

export default App
