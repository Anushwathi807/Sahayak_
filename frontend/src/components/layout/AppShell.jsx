import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { readJSON, writeJSON } from '../../lib/storage'
import AtAGlanceDialog from '../glance/AtAGlanceDialog'
import Icon from '../ui/Icon'
import Masthead from './Masthead'
import SideNav from './SideNav'

export default function AppShell() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const [glanceOpen, setGlanceOpen] = useState(false)

  // The first visit to Home in a browser session opens At a glance.
  useEffect(() => {
    if (!user || pathname !== '/home') return
    const key = `sahayak.glanceSeen.${user.uid}`
    if (!readJSON(sessionStorage, key, false)) {
      writeJSON(sessionStorage, key, true)
      setGlanceOpen(true)
    }
  }, [user, pathname])

  useEffect(() => setNavOpen(false), [pathname])

  useEffect(() => {
    if (!navOpen) return
    const onKey = (e) => e.key === 'Escape' && setNavOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navOpen])

  const openGlance = useCallback(() => setGlanceOpen(true), [])

  return (
    <div className="min-h-screen bg-ground">
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-sheet px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Masthead onOpenNav={() => setNavOpen(true)} onOpenGlance={openGlance} />
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh_-_4rem)] w-64 shrink-0 overflow-y-auto border-r border-rule bg-rail lg:block print:hidden">
          <SideNav />
        </aside>
        {navOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setNavOpen(false)}
              className="absolute inset-0 bg-ink/50"
            />
            <aside className="sheet-rise absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-ink bg-rail">
              <div className="bg-masthead flex h-16 items-center justify-between px-4 text-white">
                <span className="font-display text-2xl font-bold">Sahayak</span>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setNavOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-sm hover:bg-brand-deep"
                >
                  <Icon name="close" size={24} />
                </button>
              </div>
              <SideNav onNavigate={() => setNavOpen(false)} />
            </aside>
          </div>
        )}
        <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1200px]">
            <Outlet context={{ openGlance }} />
          </div>
        </main>
      </div>
      <AtAGlanceDialog open={glanceOpen} onClose={() => setGlanceOpen(false)} />
    </div>
  )
}
