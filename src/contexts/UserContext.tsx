import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

export type LifePhase = 'menstrual' | 'pre-menopause' | 'menopause' | 'post-menopause' | 'irregular-cycle'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type Goal = 'lose-weight' | 'gain-muscle' | 'tone' | 'health' | 'flexibility' | 'energy' | 'reduce-stress' | 'posture' | 'maintain'
export type DietType = 'mediterranean' | 'low-carb' | 'dash' | 'plant-based' | 'hypocaloric' | 'personalized'

export interface UserProfile {
  name: string
  age: number
  weight: number
  height: number
  goalWeight: number
  lifePhase: LifePhase
  hasMenstrualCycle: boolean
  cycleRegular: boolean
  usesDailyFeedback?: boolean // TRUE para ciclo irregular (usa feedback diário ao invés de ciclo)
  irregularCycleReason?: 'iud' | 'pcos' | 'stress' | 'health-condition' | 'other' // Motivo do ciclo irregular
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

  // Meta e dieta
  goalDeadlineWeeks?: number // Prazo em semanas para alcançar a meta
  selectedDietType?: DietType // Tipo de dieta escolhido
  customDietPlan?: string // Plano de dieta personalizado gerado pela IA

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
          usesDailyFeedback: data.uses_daily_feedback ?? false,
          irregularCycleReason: data.irregular_cycle_reason,
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
          goalDeadlineWeeks: data.goal_deadline_weeks,
          selectedDietType: data.selected_diet_type,
          customDietPlan: data.custom_diet_plan,
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

        // Carregar dados faltando do localStorage se não existirem no banco
        try {
          const missingFields = localStorage.getItem('missing_profile_fields')
          if (missingFields) {
            const parsed = JSON.parse(missingFields)
            profile.goalDeadlineWeeks = profile.goalDeadlineWeeks || parsed.goalDeadlineWeeks
            profile.selectedDietType = profile.selectedDietType || parsed.selectedDietType
            profile.customDietPlan = profile.customDietPlan || parsed.customDietPlan
            profile.usesDailyFeedback = profile.usesDailyFeedback ?? parsed.usesDailyFeedback
            profile.irregularCycleReason = profile.irregularCycleReason || parsed.irregularCycleReason
          }
        } catch (e) {
          console.warn('Erro ao carregar missing_profile_fields do localStorage:', e)
        }

        // Fallback antigo para compatibilidade
        if (!profile.goalDeadlineWeeks || !profile.selectedDietType) {
          try {
            const dietPlanData = localStorage.getItem('diet_plan_data')
            if (dietPlanData) {
              const parsed = JSON.parse(dietPlanData)
              profile.goalDeadlineWeeks = profile.goalDeadlineWeeks || parsed.goalDeadlineWeeks
              profile.selectedDietType = profile.selectedDietType || parsed.selectedDietType
              profile.customDietPlan = profile.customDietPlan || parsed.customDietPlan
            }
          } catch (e) {
            console.warn('Erro ao carregar diet_plan_data do localStorage:', e)
          }
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

      // Preparar dados MÍNIMOS - apenas campos que SEMPRE existem
      const baseData: any = {
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
      }

      // Tentar adicionar campos novos (podem não existir no banco)
      const optionalFields = {
        uses_daily_feedback: profile.usesDailyFeedback || false,
        irregular_cycle_reason: profile.irregularCycleReason || null,
        goal_deadline_weeks: profile.goalDeadlineWeeks,
        selected_diet_type: profile.selectedDietType,
        custom_diet_plan: profile.customDietPlan,
      }

      // Primeira tentativa: com TODOS os campos
      let { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({ ...baseData, ...optionalFields })

      if (profileError) {
        console.warn('⚠️ Erro ao salvar com todos os campos:', profileError.message)

        // Se o erro for por coluna não existir, tentar salvar SEM os campos opcionais
        if (
          profileError.message.includes('column') ||
          profileError.message.includes('does not exist') ||
          profileError.message.includes('violates')
        ) {
          console.warn('🔄 Tentando salvar SEM os campos opcionais...')

          // Segunda tentativa: APENAS com campos base (que sempre existem)
          const { error: retryError } = await supabase
            .from('user_profiles')
            .upsert(baseData)

          if (retryError) {
            console.error('❌ Erro mesmo sem campos opcionais:', retryError)
            throw retryError
          }

          // Salvou com sucesso sem os campos opcionais!
          console.info('✅ Perfil salvo (sem campos opcionais)')

          // Salvar campos opcionais no localStorage como fallback
          try {
            localStorage.setItem('missing_profile_fields', JSON.stringify({
              goalDeadlineWeeks: profile.goalDeadlineWeeks,
              selectedDietType: profile.selectedDietType,
              customDietPlan: profile.customDietPlan,
              usesDailyFeedback: profile.usesDailyFeedback,
              irregularCycleReason: profile.irregularCycleReason,
            }))
            console.info('💾 Campos opcionais salvos no navegador temporariamente')
            console.warn('📝 Execute o arquivo: EXECUTE-ESTE-SQL-AGORA.sql para salvar permanentemente')
          } catch (e) {
            console.warn('Erro ao salvar no localStorage:', e)
          }
        } else {
          // Erro diferente - propagar
          throw profileError
        }
      } else {
        console.info('✅ Perfil salvo com sucesso (com todos os campos)')
      }

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
