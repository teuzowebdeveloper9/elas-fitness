import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase Config Error] Missing environment variables')
  console.error('Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
})

// Database Types
export interface UserProfile {
  id: string
  email: string
  name: string
  age: number
  weight: number
  height: number
  goal: 'lose-weight' | 'gain-muscle' | 'maintain' | 'health'
  life_phase: 'menstrual' | 'pre-menopause' | 'menopause' | 'post-menopause'
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface CycleData {
  id: string
  user_id: string
  last_period_date: string
  cycle_length: number
  created_at: string
  updated_at: string
}

export interface CycleLog {
  id: string
  user_id: string
  date: string
  feeling: string
  symptoms: string[]
  created_at: string
}

export interface MenopauseData {
  id: string
  user_id: string
  phase: 'premenopausa' | 'menopausa' | 'posmenopausa'
  symptoms: {
    id: string
    active: boolean
    intensity: number
  }[]
  created_at: string
  updated_at: string
}

export interface MenopauseLog {
  id: string
  user_id: string
  date: string
  symptoms: string[]
  feeling: string
  what_helps: string
  what_makes_worse: string
  created_at: string
}
