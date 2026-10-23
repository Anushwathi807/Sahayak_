import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { checkHealth } from '../../lib/api'
import { cx } from '../../lib/cx'
import Icon from '../ui/Icon'

export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/home', label: 'Home', icon: 'home', also: ['/content'] },
      { to: '/analytics', label: 'Analytics', icon: 'monitoring' },
    ],
  },
  { label: 'Plan', items: [{ to: '/lesson-planner', label: 'Lesson planner', icon: 'calendar_view_week' }] },
  {
    label: 'Prepare',
    items: [
      { to: '/library', label: 'Library', icon: 'menu_book' },
      { to: '/visual-aid', label: 'Visual aids', icon: 'schema' },
    ],
  },
  {
    label: 'Assess',
    items: [
      { to: '/worksheets', label: 'Worksheets', icon: 'assignment' },
      { to: '/students', label: 'Students and marks', icon: 'groups' },
    ],
  },
  { label: 'Account', items: [{ to: '/settings', label: 'Settings', icon: 'settings' }] },
]

function ServerStatus() {
  const [online, setOnline] = useState(null)
  useEffect(() => {
    const check = () => checkHealth().then(setOnline)
    check()
    window.addEventListener('focus', check)
    return () => window.removeEventListener('focus', check)
  }, [])
  if (online === null) return null
  return (
    <p className="flex items-start gap-2 px-4 text-xs text-ink-2">
      <Icon
        name={online ? 'check_circle' : 'cancel'}
        filled
        size={16}
        className={online ? 'text-success' : 'text-attention'}
      />
      <span>{online ? 'Server online' : 'Server not reachable. Start the backend, then refresh.'}</span>
    </p>
  )
}

export default function SideNav({ onNavigate }) {
  const { pathname } = useLocation()
  return (
    <nav aria-label="Main" className="flex h-full flex-col justify-between py-4">
      <div>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="px-4 pt-3 pb-1.5 font-display text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5 px-2">
              {group.items.map((item) => {
                const extra = item.also?.some((p) => pathname.startsWith(p))
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cx(
                          'flex h-10 items-center gap-3 rounded-sm px-3 text-base transition-colors',
                          isActive || extra
                            ? 'bg-brand-tint font-semibold text-ink'
                            : 'text-ink-2 hover:bg-ground hover:text-ink'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            name={item.icon}
                            size={20}
                            filled={isActive || extra}
                            className={isActive || extra ? 'text-brand' : 'text-ink-3'}
                          />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      <ServerStatus />
    </nav>
  )
}
