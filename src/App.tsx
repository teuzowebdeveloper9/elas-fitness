import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Workouts from '@/pages/Workouts'
import Diet from '@/pages/Diet'
import Progress from '@/pages/Progress'
import Profile from '@/pages/Profile'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="diet" element={<Diet />} />
            <Route path="progress" element={<Progress />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
