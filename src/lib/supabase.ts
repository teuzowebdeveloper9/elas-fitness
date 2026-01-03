import { createClient } from '@supabase/supabase-js'

// Tentar com prefixo VITE_ primeiro, depois sem prefixo como fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

console.log('[Supabase Config] Verificando variáveis de ambiente...')
console.log('[Supabase Config] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✓ Configurada' : '✗ Faltando')
console.log('[Supabase Config] VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configurada' : '✗ Faltando')
console.log('[Supabase Config] Todas as variáveis de ambiente disponíveis:', Object.keys(import.meta.env))

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `
🔴 ERRO: Variáveis de ambiente do Supabase não encontradas!

Variáveis checadas:
- VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL || 'NÃO ENCONTRADA'}
- VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'NÃO ENCONTRADA'}

Todas as variáveis disponíveis: ${Object.keys(import.meta.env).join(', ')}

SOLUÇÃO: As variáveis precisam estar no arquivo .env ou .env.local com o prefixo VITE_
  `
  console.error(errorMsg)
  throw new Error('Missing Supabase environment variables. Verifique o arquivo .env ou .env.local')
}

console.log('[Supabase Config] ✅ Configuração OK! Conectando ao Supabase...')

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
