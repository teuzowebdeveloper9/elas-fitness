import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { UserProvider, useUser } from '@/contexts/UserContext'
import Layout from '@/components/Layout'
import Onboarding from '@/pages/Onboarding'
import Home from '@/pages/Home'
import Workouts from '@/pages/Workouts'
import Diet from '@/pages/Diet'
import Progress from '@/pages/Progress'
import Profile from '@/pages/Profile'
import CycleTracking from '@/pages/CycleTracking'
import MenopauseTracking from '@/pages/MenopauseTracking'

function AppRoutes() {
  const { userProfile } = useUser()

  // If onboarding not completed, redirect to onboarding
  if (!userProfile?.onboardingCompleted) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  // If onboarding completed, show main app
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
      <UserProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
