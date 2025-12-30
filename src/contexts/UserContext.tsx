import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

export type LifePhase = 'menstrual' | 'pre-menopause' | 'menopause' | 'post-menopause'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type Goal = 'lose-weight' | 'gain-muscle' | 'tone' | 'health' | 'flexibility' | 'energy' | 'reduce-stress' | 'posture' | 'maintain'

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
  goals: Goal[]
  challenges: string[]
  exerciseFrequency: number
  dietaryRestrictions: string[]
  healthConditions: string[]

  // Dados de bioimpedância (calculados pela IA)
  idealWeight?: number
  bmi?: number
  bodyFatPercentage?: number
  dailyCalories?: number
  proteinGoal?: number
  carbsGoal?: number
  fatsGoal?: number
  waterGoal?: number // Meta de água em litros

  // Preferências alimentares
  favoriteFoods?: string[]
  dislikedFoods?: string[]
  mealsPerDay?: number
  cookingSkill?: 'beginner' | 'intermediate' | 'advanced'
  timeForCooking?: number
  eatsOutFrequency?: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily'

  // Dados adicionais
  neck?: number // circunferência do pescoço
  waist?: number // circunferência da cintura
  hips?: number // circunferência do quadril
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'

  onboardingCompleted: boolean
}

interface UserContextType {
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile) => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  clearUserProfile: () => void
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar perfil do Supabase quando o usuário fizer login
  useEffect(() => {
    if (user) {
      loadUserProfile()
    } else {
      setUserProfileState(null)
      setLoading(false)
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Perfil não existe ainda
          setUserProfileState(null)
        } else {
          console.error('Erro ao carregar perfil:', error)
        }
        setLoading(false)
        return
      }

      if (data) {
        // Converter os dados do banco para o formato do UserProfile
        const profile: UserProfile = {
          name: data.name,
          age: data.age,
          weight: data.weight,
          height: data.height,
          goalWeight: data.goal_weight,
          lifePhase: data.life_phase,
          hasMenstrualCycle: data.has_menstrual_cycle ?? true,
          cycleRegular: data.cycle_regular ?? true,
          fitnessLevel: data.fitness_level,
          goals: data.goals || [],
          challenges: data.challenges || [],
          exerciseFrequency: data.exercise_frequency || 3,
          dietaryRestrictions: data.dietary_restrictions || [],
          healthConditions: data.health_conditions || [],
          idealWeight: data.ideal_weight,
          bmi: data.bmi,
          bodyFatPercentage: data.body_fat_percentage,
          dailyCalories: data.daily_calories,
          proteinGoal: data.protein_goal,
          carbsGoal: data.carbs_goal,
          fatsGoal: data.fats_goal,
          waterGoal: data.water_goal,
          neck: data.neck,
          waist: data.waist,
          hips: data.hips,
          activityLevel: data.activity_level,
          onboardingCompleted: data.onboarding_completed || false,
        }

        // Buscar preferências alimentares
        const { data: foodPrefs } = await supabase
          .from('food_preferences')
          .select('*')
          .eq('user_id', user!.id)
          .single()

        if (foodPrefs) {
          profile.favoriteFoods = foodPrefs.favorite_foods || []
          profile.dislikedFoods = foodPrefs.disliked_foods || []
          profile.mealsPerDay = foodPrefs.meals_per_day || 3
          profile.cookingSkill = foodPrefs.cooking_skill || 'intermediate'
          profile.timeForCooking = foodPrefs.time_for_cooking || 30
          profile.eatsOutFrequency = foodPrefs.eats_out_frequency || 'sometimes'
          profile.proteinGoal = foodPrefs.protein_goal_grams
          profile.carbsGoal = foodPrefs.carbs_goal_grams
          profile.fatsGoal = foodPrefs.fats_goal_grams
        }

        setUserProfileState(profile)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const setUserProfile = async (profile: UserProfile) => {
    try {
      if (!user) return

      // Obter email do usuário
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser?.email) throw new Error('Email não encontrado')

      // Salvar no banco de dados
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: authUser.email,
          name: profile.name,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          goal_weight: profile.goalWeight,
          life_phase: profile.lifePhase,
          has_menstrual_cycle: profile.hasMenstrualCycle,
          cycle_regular: profile.cycleRegular,
          fitness_level: profile.fitnessLevel,
          goals: profile.goals,
          challenges: profile.challenges,
          exercise_frequency: profile.exerciseFrequency,
          dietary_restrictions: profile.dietaryRestrictions,
          health_conditions: profile.healthConditions,
          ideal_weight: profile.idealWeight,
          bmi: profile.bmi,
          body_fat_percentage: profile.bodyFatPercentage,
          daily_calories: profile.dailyCalories,
          neck: profile.neck,
          waist: profile.waist,
          hips: profile.hips,
          activity_level: profile.activityLevel,
          onboarding_completed: profile.onboardingCompleted,
        })

      if (profileError) throw profileError

      // Salvar preferências alimentares separadamente
      if (profile.favoriteFoods || profile.dislikedFoods || profile.mealsPerDay) {
        const { error: foodPrefsError } = await supabase
          .from('food_preferences')
          .upsert({
            user_id: user.id,
            favorite_foods: profile.favoriteFoods || [],
            disliked_foods: profile.dislikedFoods || [],
            meals_per_day: profile.mealsPerDay || 3,
            cooking_skill: profile.cookingSkill || 'intermediate',
            time_for_cooking: profile.timeForCooking || 30,
            eats_out_frequency: profile.eatsOutFrequency || 'sometimes',
            protein_goal_grams: profile.proteinGoal,
            carbs_goal_grams: profile.carbsGoal,
            fats_goal_grams: profile.fatsGoal,
          }, {
            onConflict: 'user_id'
          })

        if (foodPrefsError) throw foodPrefsError
      }

      // Atualizar estado local
      setUserProfileState(profile)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      throw error
    }
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile || !user) return

    const updatedProfile = { ...userProfile, ...updates }
    await setUserProfile(updatedProfile)
  }

  const clearUserProfile = () => {
    setUserProfileState(null)
  }

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile, updateUserProfile, clearUserProfile, loading }}>
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
