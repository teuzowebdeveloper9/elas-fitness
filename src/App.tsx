import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { UserProvider, useUser } from '@/contexts/UserContext'
import Layout from '@/components/Layout'
import Auth from '@/pages/Auth'
import Onboarding from '@/pages/Onboarding'
import Home from '@/pages/Home'
import Workouts from '@/pages/WorkoutsNew'
import Diet from '@/pages/DietNew'
import Progress from '@/pages/Progress'
import Profile from '@/pages/Profile'
import CycleTracking from '@/pages/CycleTracking'
import MenopauseTracking from '@/pages/MenopauseTracking'

function AppRoutes() {
  const { user, loading: authLoading } = useAuth()
  const { userProfile } = useUser()

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show auth page
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  // If authenticated but onboarding not completed, redirect to onboarding
  if (!userProfile?.onboardingCompleted) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  // If authenticated and onboarding completed, show main app
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="workouts" element={<Workouts />} />
        <Route path="diet" element={<Diet />} />
        <Route path="progress" element={<Progress />} />
        <Route path="profile" element={<Profile />} />
        <Route path="cycle-tracking" element={<CycleTracking />} />
        <Route path="menopause-tracking" element={<MenopauseTracking />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <UserProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Toaster />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
