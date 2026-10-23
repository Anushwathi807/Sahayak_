import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import PublicMasthead from '../../components/layout/PublicMasthead'
import { BandChip } from '../../components/ui/Band'
import { ButtonLink } from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { BANDS } from '../../lib/grades'
import GlanceExcerpt from './GlanceExcerpt'
import WeekTable from './WeekTable'

const PARTICULARS = [
  ['Made for', 'Teachers of multi-grade classes, grades 1 to 8'],
  ['Languages', 'हिन्दी · English · मराठी · தமிழ்'],
  ['Sign in', 'With your Google account'],
  ['Makes', 'Stories, explanations, blackboard diagrams, worksheets, weekly plans'],
  ['Keeps', 'Your roster, quizzes and marks, in CBSE grade bands'],
  ['Prints', 'Worksheets and answer keys as PDF or Word'],
]

function PrimaryAction() {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-12" />
  return user ? (
    <ButtonLink to="/home" size="lg" icon="arrow_forward">
      Open Sahayak
    </ButtonLink>
  ) : (
    <GoogleSignInButton />
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ground">
      <PublicMasthead />
      <main className="px-4 py-8 sm:px-6 sm:py-12">
        <article className="mx-auto max-w-[1160px] rounded-md border border-ink bg-sheet">
          <section
            aria-labelledby="landing-title"
            className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 px-5 pt-8 pb-8 sm:px-10 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_400px]"
          >
            <div>
              <h1 id="landing-title" className="text-4xl font-bold tracking-tight sm:text-5xl">
                A week of multi-grade lessons, prepared in your language.
              </h1>
              <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-ink-2">
                Sahayak writes stories, explanations, blackboard diagrams, worksheets and weekly plans for every grade in your room,
                then keeps your class's marks in grade bands so you can see who needs help first.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <PrimaryAction />
                <a href="#what-it-makes" className="text-base font-semibold text-entry hover:underline">
                  See what it makes
                </a>
              </div>
            </div>
            <GlanceExcerpt />
          </section>

          <section aria-label="Particulars" className="border-y border-ink">
            <dl className="grid grid-cols-1 gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
              {PARTICULARS.map(([label, value]) => (
                <div key={label} className="bg-sheet px-5 py-4 sm:px-10">
                  <dt className="font-display text-xs font-semibold tracking-wide text-ink-2 uppercase">{label}</dt>
                  <dd className="mt-1 text-base">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="what-it-makes" aria-labelledby="makes-title" className="scroll-mt-6 px-5 pt-10 pb-6 sm:px-10">
            <h2 id="makes-title" className="text-3xl font-bold">
              What it makes in a week
            </h2>
            <p className="mt-2 max-w-[62ch] text-base text-ink-2">
              Teachers plan, prepare, teach, assess and track. Each row is one request and what comes back. The samples are illustrations.
            </p>
            <div className="mt-6">
              <WeekTable />
            </div>
          </section>

          <section aria-labelledby="bands-title" className="border-t border-ink px-5 py-10 sm:px-10">
            <h2 id="bands-title" className="text-3xl font-bold">
              Marks you enter land in grade bands
            </h2>
            <p className="mt-2 max-w-[62ch] text-base text-ink-2">
              The eight-point CBSE scale. After you sign in, At a glance opens with your class sorted weakest first, next to today's
              periods from your plan.
            </p>
            <ol className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-ink bg-rule sm:grid-cols-4 lg:grid-cols-8">
              {BANDS.map((band) => (
                <li key={band.id} className="flex flex-col items-start gap-1.5 bg-sheet px-3 py-3">
                  <BandChip band={band} />
                  <span className="text-sm tabular-nums">{band.range}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="remarks-title" className="border-t border-ink px-5 py-10 sm:px-10">
            <h2 id="remarks-title" className="text-3xl font-bold">
              Remarks
            </h2>
            <p className="mt-3 max-w-[62ch] text-lg leading-relaxed">
              Sahayak is a final-year engineering project. It runs on the free tiers of Google Gemini and Firebase, so each request
              takes a few seconds, and everything it writes can be printed for the classroom.
            </p>
            <div className="mt-7">
              <PrimaryAction />
            </div>
          </section>
        </article>
        <footer className="mx-auto mt-6 max-w-[1160px] px-1 text-sm text-ink-2">Sahayak · Teaching assistant for multi-grade classrooms</footer>
      </main>
    </div>
  )
}
