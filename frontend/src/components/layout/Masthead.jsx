import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTeacher } from '../../contexts/TeacherContext'
import { LANGUAGES, longDate } from '../../lib/constants'
import Button from '../ui/Button'
import Icon from '../ui/Icon'

function AccountMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const firstName = user?.displayName?.split(' ')[0] || 'Teacher'

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-sm px-1.5 text-white hover:bg-brand-deep"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-brand">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-sm font-semibold sm:inline">{firstName}</span>
        <Icon name="expand_more" size={18} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-12 right-0 z-50 w-64 rounded-md border border-ink bg-sheet py-2 text-ink shadow-[0_12px_32px_-12px_rgba(23,35,58,0.35)]"
        >
          <div className="border-b border-rule px-4 pb-2.5">
            <p className="truncate text-sm font-semibold">{user?.displayName}</p>
            <p className="truncate text-xs text-ink-2">{user?.email}</p>
          </div>
          <Link role="menuitem" to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-ground">
            <Icon name="settings" size={18} className="text-ink-2" />
            Settings
          </Link>
          <button role="menuitem" type="button" onClick={signOut} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-ground">
            <Icon name="logout" size={18} className="text-ink-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Masthead({ onOpenNav, onOpenGlance }) {
  const { preferences, savePreferences } = useTeacher()
  return (
    <header className="bg-masthead sticky top-0 z-30 flex h-16 items-center gap-3 px-3 text-white sm:px-5 print:hidden">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="flex h-10 w-10 items-center justify-center rounded-sm hover:bg-brand-deep lg:hidden"
      >
        <Icon name="menu" size={24} />
      </button>
      <Link to="/home" className="font-display text-2xl font-bold tracking-tight">
        Sahayak
      </Link>
      <p className="ml-3 hidden text-sm text-on-brand-muted md:block">{longDate()}</p>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Button variant="outlineOnBrand" size="sm" icon="fact_check" onClick={onOpenGlance} className="max-sm:hidden">
          At a glance
        </Button>
        <label className="relative flex items-center">
          <span className="sr-only">Default language</span>
          <select
            value={preferences.language}
            onChange={(e) => savePreferences({ language: e.target.value }).catch(() => {})}
            className="h-9 appearance-none rounded-sm border border-white bg-transparent pr-8 pl-3 text-sm font-semibold text-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <Icon name="expand_more" size={18} className="pointer-events-none absolute right-2" />
        </label>
        <AccountMenu />
      </div>
    </header>
  )
}
