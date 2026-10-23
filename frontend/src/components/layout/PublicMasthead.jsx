import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ButtonLink } from '../ui/Button'

export default function PublicMasthead() {
  const { user, loading } = useAuth()
  return (
    <header className="bg-masthead text-white">
      <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-bold tracking-tight">Sahayak</span>
          <span className="hidden text-sm text-on-brand-muted sm:inline">Teaching assistant for multi-grade classrooms</span>
        </Link>
        {!loading &&
          (user ? (
            <ButtonLink to="/home" variant="onBrand" size="sm" icon="arrow_forward">
              Open Sahayak
            </ButtonLink>
          ) : (
            <ButtonLink to="/login" variant="outlineOnBrand" size="sm">
              Sign in
            </ButtonLink>
          ))}
      </div>
    </header>
  )
}
