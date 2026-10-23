import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { buttonClass } from '../ui/Button'
import Icon from '../ui/Icon'

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}

const MESSAGES = {
  'auth/popup-blocked': 'The sign-in window was blocked. Allow pop-ups for this site and try again.',
  'auth/network-request-failed': 'No internet connection. Connect and try again.',
}

export default function GoogleSignInButton({ variant = 'primary', size = 'lg', className, label = 'Sign in with Google' }) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onClick = async () => {
    setBusy(true)
    setError('')
    try {
      await signIn()
      navigate('/home')
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(MESSAGES[err?.code] || 'Sign-in did not complete. Try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={onClick} disabled={busy} className={buttonClass({ variant, size, className })}>
        {busy ? <Icon name="progress_activity" size={18} className="animate-spin" /> : <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-white"><GoogleMark /></span>}
        {busy ? 'Opening Google' : label}
      </button>
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-attention">
          <Icon name="error" size={16} />
          {error}
        </p>
      )}
    </div>
  )
}
