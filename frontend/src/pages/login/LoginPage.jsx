import { Link } from 'react-router-dom'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import PublicMasthead from '../../components/layout/PublicMasthead'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ground">
      <PublicMasthead />
      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:py-20">
        <section aria-labelledby="login-title" className="w-full max-w-md overflow-hidden rounded-md border border-ink bg-sheet">
          <div aria-hidden="true" className="bg-masthead h-2" />
          <div className="flex flex-col gap-5 px-6 py-8 sm:px-8">
            <div>
              <h1 id="login-title" className="text-3xl font-bold">
                Sign in
              </h1>
              <p className="mt-2 text-base text-ink-2">
                Use the Google account you teach with. Your students, quizzes, marks and saved plan stay with this account.
              </p>
            </div>
            <GoogleSignInButton className="w-full" />
            <dl className="grid grid-cols-[110px_1fr] gap-y-2 border-t border-rule pt-5 text-sm">
              <dt className="font-semibold">Languages</dt>
              <dd>हिन्दी · English · मराठी · தமிழ்</dd>
              <dt className="font-semibold">Grades</dt>
              <dd>1 to 8, several in one room</dd>
            </dl>
            <Link to="/" className="text-sm font-semibold text-entry hover:underline">
              What is Sahayak?
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
