import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type LifePhase = 'menstrual' | 'pre-menopause' | 'menopause' | 'post-menopause'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type Goal = 'lose-weight' | 'gain-muscle' | 'maintain' | 'health'

export interface UserProfile {
  name: string
  age: number
  weight: number
  height: number
  goalWeight: number
  lifePhase: LifePhase
  hasMenstrualCycle: boolean
  cycleRegular: boolean
  fitnessLevel: FitnessLevel
  goal: Goal
  exerciseFrequency: number
  dietaryRestrictions: string[]
  healthConditions: string[]
  onboardingCompleted: boolean
}

interface UserContextType {
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile) => void
  updateUserProfile: (updates: Partial<UserProfile>) => void
  clearUserProfile: () => void
}

const defaultProfile: UserProfile = {
  name: '',
  age: 0,
  weight: 0,
  height: 0,
  goalWeight: 0,
  lifePhase: 'menstrual',
  hasMenstrualCycle: true,
  cycleRegular: true,
  fitnessLevel: 'beginner',
  goal: 'health',
  exerciseFrequency: 3,
  dietaryRestrictions: [],
  healthConditions: [],
  onboardingCompleted: false,
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('userProfile')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile))
    }
  }, [userProfile])

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile)
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfileState(prev => prev ? { ...prev, ...updates } : null)
  }

  const clearUserProfile = () => {
    setUserProfileState(null)
    localStorage.removeItem('userProfile')
  }

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile, updateUserProfile, clearUserProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
