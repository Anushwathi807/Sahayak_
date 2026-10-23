import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { Working } from './components/ui/Feedback'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ContentProvider } from './contexts/ContentContext'
import { TeacherProvider } from './contexts/TeacherContext'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import ContentPage from './pages/content/ContentPage'
import HomePage from './pages/home/HomePage'
import LandingPage from './pages/landing/LandingPage'
import LessonPlannerPage from './pages/lesson-planner/LessonPlannerPage'
import LibraryPage from './pages/library/LibraryPage'
import LoginPage from './pages/login/LoginPage'
import SettingsPage from './pages/settings/SettingsPage'
import StudentsPage from './pages/students/StudentsPage'
import VisualAidPage from './pages/visual-aid/VisualAidPage'
import WorksheetsPage from './pages/worksheets/WorksheetsPage'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ground">
        <Working>Opening Sahayak</Working>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

function RedirectIfSignedIn({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/home" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TeacherProvider>
          <ContentProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <RedirectIfSignedIn>
                    <LoginPage />
                  </RedirectIfSignedIn>
                }
              />
              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/home" element={<HomePage />} />
                <Route path="/content" element={<ContentPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/lesson-planner" element={<LessonPlannerPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/visual-aid" element={<VisualAidPage />} />
                <Route path="/worksheets" element={<WorksheetsPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ContentProvider>
        </TeacherProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
