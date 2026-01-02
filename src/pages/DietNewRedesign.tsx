import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Apple, Flame, Camera, Sparkles, Coffee, Sunrise,
  Sun, Moon, ShoppingCart, ChevronRight
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { FoxMascot } from '@/components/mascot/fox-mascot'
import { generatePersonalizedDiet, calculateBioimpedance, DietGenerationData, NutritionData } from '@/lib/openai-real'

interface GeneratedMeal {
  name: string
  foods: string[]
  calories: number
  protein: number
  carbs: number
  fats: number
}

interface DayMealPlan {
  breakfast: GeneratedMeal
  lunch: GeneratedMeal
  dinner: GeneratedMeal
  snacks: Array<{name: string; calories: number}>
}

interface GeneratedDiet {
  diet_name: string
  description: string
  meal_plan: {
    monday: DayMealPlan
    tuesday: DayMealPlan
    wednesday: DayMealPlan
    thursday: DayMealPlan
    friday: DayMealPlan
    saturday: DayMealPlan
    sunday: DayMealPlan
  }
  shopping_list: string[]
  tips: string[]
}

const DAY_NAMES: Record<string, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo'
}

export default function DietNewRedesign() {
  const { userProfile, updateUserProfile } = useUser()
  const { toast } = useToast()

  const [isCalculating, setIsCalculating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingSavedDiet, setIsLoadingSavedDiet] = useState(true)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [generatedDiet, setGeneratedDiet] = useState<GeneratedDiet | null>(null)
  const [savedDietId, setSavedDietId] = useState<string | null>(null)
  const [showConfigScreen, setShowConfigScreen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<keyof GeneratedDiet['meal_plan']>('monday')

  // Carregar dieta salva
  useEffect(() => {
    async function loadSavedDiet() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('saved_diets')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (data && !error) {
          setGeneratedDiet(data.diet_data)
          setSavedDietId(data.id)
          if (data.nutrition_data) {
            setNutritionData(data.nutrition_data)
          }
          setShowConfigScreen(false)
        } else {
          setShowConfigScreen(true)
        }
      } catch (error) {
        console.log('Nenhuma dieta salva encontrada')
        setShowConfigScreen(true)
      } finally {
        setIsLoadingSavedDiet(false)
      }
    }

    loadSavedDiet()
  }, [])

  // Carregar dados nutricionais do perfil
  useEffect(() => {
    if (userProfile?.dailyCalories && !nutritionData) {
      setNutritionData({
        idealWeight: userProfile.idealWeight || 0,
        dailyCalories: userProfile.dailyCalories,
        protein: userProfile.proteinGoal || 0,
        carbs: userProfile.carbsGoal || 0,
        fats: userProfile.fatsGoal || 0,
        bmi: userProfile.bmi || 0,
        bodyFatPercentage: userProfile.bodyFatPercentage
      })
    }
  }, [userProfile, nutritionData])

  const handleCalculateBioimpedance = async () => {
    console.log('🚀 INICIANDO CÁLCULO DE METAS')

    if (!userProfile) {
      console.error('❌ userProfile não existe')
      return
    }

    console.log('✅ UserProfile OK:', {
      weight: userProfile.weight,
      height: userProfile.height,
      age: userProfile.age,
      activityLevel: userProfile.activityLevel,
      goals: userProfile.goals
    })

    setIsCalculating(true)

    try {
      console.log('📊 Chamando calculateBioimpedance...')

      const bioData = await calculateBioimpedance({
        weight: userProfile.weight,
        height: userProfile.height,
        age: userProfile.age,
        gender: 'female',
        activityLevel: userProfile.activityLevel || 'moderate',
        goals: userProfile.goals
      })

      console.log('✅ Cálculo concluído:', bioData)
      console.log('💾 Salvando no estado local...')
      setNutritionData(bioData)
      console.log('✅ Estado local atualizado')

      console.log('💾 Atualizando perfil do usuário no Supabase...')
      await updateUserProfile({
        idealWeight: bioData.idealWeight,
        bmi: bioData.bmi,
        bodyFatPercentage: bioData.bodyFatPercentage,
        dailyCalories: bioData.dailyCalories,
        proteinGoal: bioData.protein,
        carbsGoal: bioData.carbs,
        fatsGoal: bioData.fats,
        waterGoal: bioData.waterGoal
      })
      console.log('✅ Perfil atualizado no Supabase')

      toast({
        title: 'Metas calculadas! ✨',
        description: 'Suas necessidades nutricionais foram definidas.'
      })

      console.log('🎉 PROCESSO COMPLETO COM SUCESSO')
    } catch (error: any) {
      console.error('❌❌❌ ERRO DETALHADO AO CALCULAR METAS ❌❌❌')
      console.error('Tipo:', error?.constructor?.name)
      console.error('Mensagem:', error?.message)
      console.error('Status:', error?.status)
      console.error('Code:', error?.code)
      console.error('Details:', error?.details)
      console.error('Hint:', error?.hint)
      console.error('Stack:', error?.stack)
      console.error('Objeto completo:', JSON.stringify(error, null, 2))

      let errorMessage = error?.message || 'Tente novamente em alguns instantes.'

      toast({
        title: 'Erro ao calcular',
        description: errorMessage,
        variant: 'destructive'
      })

      alert(`🚨 ERRO AO CALCULAR METAS\n\n${errorMessage}\n\nDetalhes no Console (F12)`)
    } finally {
      setIsCalculating(false)
      console.log('🏁 Finalizando handleCalculateBioimpedance')
    }
  }

  const handleGenerateDiet = async () => {
    if (!userProfile || !nutritionData) return

    setIsGenerating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive'
        })
        return
      }

      const dietData: DietGenerationData = {
        userProfile: {
          name: userProfile.name,
          age: userProfile.age,
          weight: userProfile.weight,
          height: userProfile.height,
          goalWeight: userProfile.goalWeight,
          goals: userProfile.goals,
          lifePhase: userProfile.lifePhase,
          fitnessLevel: userProfile.fitnessLevel
        },
        nutritionData: nutritionData,
        foodPreferences: {
          dietaryRestrictions: userProfile.dietaryRestrictions || [],
          favoriteFoods: userProfile.favoriteFoods,
          dislikedFoods: userProfile.dislikedFoods,
          mealsPerDay: userProfile.mealsPerDay || 3,
          cookingSkill: userProfile.cookingSkill,
          timeForCooking: userProfile.timeForCooking
        }
      }

      const diet = await generatePersonalizedDiet(dietData)
      setGeneratedDiet(diet)

      if (savedDietId) {
        await supabase
          .from('saved_diets')
          .update({ is_active: false })
          .eq('id', savedDietId)
      }

      const { data: savedDiet, error: saveError } = await supabase
        .from('saved_diets')
        .insert({
          user_id: user.id,
          diet_name: diet.diet_name,
          description: diet.description,
          diet_data: diet,
          nutrition_data: nutritionData,
          is_active: true
        })
        .select()
        .single()

      if (!saveError) {
        setSavedDietId(savedDiet.id)
      }

      setShowConfigScreen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      toast({
        title: 'Dieta criada! 🎉',
        description: 'Sua dieta personalizada está pronta!'
      })
    } catch (error: any) {
      console.error('❌ ERRO DETALHADO AO GERAR DIETA:')
      console.error('Tipo:', error?.constructor?.name)
      console.error('Mensagem:', error?.message)
      console.error('Status:', error?.status)
      console.error('Código:', error?.code)
      console.error('Response:', error?.response)
      console.error('Stack:', error?.stack)
      console.error('Objeto completo:', error)

      // Mensagem amigável baseada no erro
      let errorMessage = 'Tente novamente em alguns instantes.'

      if (error?.message?.includes('API key')) {
        errorMessage = 'Problema com a chave da API. Verifique a configuração.'
      } else if (error?.message?.includes('rate limit') || error?.status === 429) {
        errorMessage = 'Muitas requisições. Aguarde um momento e tente novamente.'
      } else if (error?.message?.includes('timeout')) {
        errorMessage = 'A requisição demorou muito. Tente novamente.'
      } else if (error?.status === 401) {
        errorMessage = 'Chave da API inválida ou expirada.'
      } else if (error?.status === 500) {
        errorMessage = 'Erro no servidor da OpenAI. Tente novamente em alguns minutos.'
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: 'Erro ao gerar dieta',
        description: errorMessage,
        variant: 'destructive'
      })

      // Alert com mais detalhes para debug
      alert(`🚨 ERRO AO GERAR DIETA\n\n${errorMessage}\n\nAbra o Console (F12) para ver detalhes técnicos.`)
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoadingSavedDiet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tiffany)]"></div>
          <p className="mt-4 text-[var(--warm-gray)]">Carregando...</p>
        </div>
      </div>
    )
  }

  // Tela de configuração inicial
  if (showConfigScreen) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header com mascote */}
        <div className="relative bg-gradient-to-br from-[rgb(176,235,229)] via-white to-[rgb(216,191,228)] rounded-3xl p-6 shadow-xl border border-[var(--warm-gray-light)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-heading text-[rgb(51,51,51)]">Sua Dieta</h1>
              <p className="text-sm text-[var(--warm-gray)] mt-1">Vamos criar seu plano personalizado</p>
            </div>
            <FoxMascot stage="starting" size="small" />
          </div>
        </div>

        {/* Calcular metas nutricionais */}
        {!nutritionData ? (
          <Card className="border-2 border-[var(--tiffany)] shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--tiffany)]" />
                Primeiro passo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--warm-gray)]">
                Vou calcular suas necessidades de calorias, proteínas e nutrientes baseado no seu perfil.
              </p>
              <Button
                onClick={handleCalculateBioimpedance}
                disabled={isCalculating}
                className="w-full bg-[var(--tiffany)] hover:bg-[var(--tiffany-dark)] text-white font-heading-medium py-6 rounded-2xl"
              >
                {isCalculating ? 'Calculando...' : 'Calcular minhas metas'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Metas calculadas */}
            <Card className="border-2 border-[var(--tiffany)] shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[var(--coral)]" />
                  Suas metas diárias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[rgb(255,240,235)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)]">
                    <p className="text-2xl font-bold text-[rgb(51,51,51)]">{nutritionData.dailyCalories}</p>
                    <p className="text-xs text-[var(--warm-gray)]">Calorias</p>
                  </div>
                  <div className="bg-gradient-to-br from-[rgb(220,245,243)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)]">
                    <p className="text-2xl font-bold text-[rgb(51,51,51)]">{nutritionData.protein}g</p>
                    <p className="text-xs text-[var(--warm-gray)]">Proteínas</p>
                  </div>
                  <div className="bg-gradient-to-br from-[rgb(240,235,245)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)]">
                    <p className="text-2xl font-bold text-[rgb(51,51,51)]">{nutritionData.carbs}g</p>
                    <p className="text-xs text-[var(--warm-gray)]">Carboidratos</p>
                  </div>
                  <div className="bg-gradient-to-br from-[rgb(255,250,235)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)]">
                    <p className="text-2xl font-bold text-[rgb(51,51,51)]">{nutritionData.fats}g</p>
                    <p className="text-xs text-[var(--warm-gray)]">Gorduras</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gerar dieta */}
            <Card className="border-2 border-[var(--lilac)] shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Apple className="w-5 h-5 text-[var(--lilac)]" />
                  Criar plano alimentar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[var(--warm-gray)]">
                  Agora vou criar um cardápio completo para a semana, com refeições balanceadas e gostosas.
                </p>
                <Button
                  onClick={handleGenerateDiet}
                  disabled={isGenerating}
                  className="w-full bg-[var(--coral)] hover:bg-[rgb(255,139,128)] text-white font-heading-medium py-6 rounded-2xl"
                >
                  {isGenerating ? 'Criando sua dieta...' : 'Criar minha dieta'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    )
  }

  // Tela principal com dieta gerada
  if (!generatedDiet) return null

  const currentDayPlan = generatedDiet.meal_plan[selectedDay]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[rgb(176,235,229)] via-white to-[rgb(216,191,228)] rounded-3xl p-6 shadow-xl border border-[var(--warm-gray-light)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-heading text-[rgb(51,51,51)]">{generatedDiet.diet_name}</h1>
            <p className="text-sm text-[var(--warm-gray)] mt-1">{generatedDiet.description}</p>
          </div>
          <FoxMascot stage="progressing" size="small" />
        </div>
      </div>

      {/* Nutri Scan - Integrado na aba Dieta */}
      <Link to="/nutri-scan">
        <Card className="border-2 border-[var(--coral)] shadow-lg hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-[rgb(255,245,240)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[var(--coral)] rounded-2xl shadow-md">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-[rgb(51,51,51)]">Nutri Scan</h3>
                  <p className="text-sm text-[var(--warm-gray)]">Analise sua refeição com IA</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-[var(--coral)]" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Seletor de dias */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {Object.keys(generatedDiet.meal_plan).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day as keyof GeneratedDiet['meal_plan'])}
              className={`px-5 py-3 rounded-2xl font-heading-medium text-sm transition-all ${
                selectedDay === day
                  ? 'bg-[var(--tiffany)] text-white shadow-lg'
                  : 'bg-white text-[var(--warm-gray)] border border-[var(--warm-gray-light)] hover:border-[var(--tiffany)]'
              }`}
            >
              {DAY_NAMES[day]}
            </button>
          ))}
        </div>
      </div>

      {/* Refeições do dia */}
      <div className="space-y-4">
        {/* Café da manhã */}
        <Card className="border-2 border-[var(--tiffany-light)] shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <div className="p-2 bg-[var(--tiffany-light)] rounded-xl">
                <Sunrise className="w-5 h-5 text-[var(--tiffany-dark)]" />
              </div>
              Café da manhã
              <Badge className="ml-auto bg-[var(--tiffany-light)] text-[var(--tiffany-dark)] font-heading-medium">
                {currentDayPlan.breakfast.calories} cal
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentDayPlan.breakfast.foods.map((food, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[var(--tiffany)] mt-1">•</span>
                  <span className="text-[rgb(51,51,51)]">{food}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Almoço */}
        <Card className="border-2 border-[var(--yellow-soft)] border-opacity-40 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <div className="p-2 bg-[var(--yellow-soft)] rounded-xl">
                <Sun className="w-5 h-5 text-[rgb(200,150,50)]" />
              </div>
              Almoço
              <Badge className="ml-auto bg-[var(--yellow-soft)] text-[rgb(150,100,30)] font-heading-medium">
                {currentDayPlan.lunch.calories} cal
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentDayPlan.lunch.foods.map((food, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[rgb(200,150,50)] mt-1">•</span>
                  <span className="text-[rgb(51,51,51)]">{food}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Jantar */}
        <Card className="border-2 border-[var(--lilac-light)] shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <div className="p-2 bg-[var(--lilac-light)] rounded-xl">
                <Moon className="w-5 h-5 text-[var(--lilac)]" />
              </div>
              Jantar
              <Badge className="ml-auto bg-[var(--lilac-light)] text-[var(--lilac)] font-heading-medium">
                {currentDayPlan.dinner.calories} cal
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentDayPlan.dinner.foods.map((food, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[var(--lilac)] mt-1">•</span>
                  <span className="text-[rgb(51,51,51)]">{food}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Lanches */}
        {currentDayPlan.snacks && currentDayPlan.snacks.length > 0 && (
          <Card className="border-2 border-[var(--coral)] border-opacity-30 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <div className="p-2 bg-[var(--coral)] bg-opacity-20 rounded-xl">
                  <Coffee className="w-5 h-5 text-[var(--coral)]" />
                </div>
                Lanches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentDayPlan.snacks.map((snack, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(51,51,51)]">{snack.name}</span>
                    <Badge className="bg-[var(--coral)] bg-opacity-20 text-[var(--coral)] font-heading-medium">
                      {snack.calories} cal
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de compras */}
      {generatedDiet.shopping_list && generatedDiet.shopping_list.length > 0 && (
        <Card className="border-2 border-[var(--tiffany)] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <ShoppingCart className="w-5 h-5 text-[var(--tiffany)]" />
              Lista de compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {generatedDiet.shopping_list.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 bg-[var(--tiffany-light)] rounded-xl">
                  <span className="text-[var(--tiffany)]">•</span>
                  <span className="text-[rgb(51,51,51)]">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão para nova dieta */}
      <Button
        onClick={() => setShowConfigScreen(true)}
        variant="outline"
        className="w-full border-2 border-[var(--tiffany)] text-[var(--tiffany)] hover:bg-[var(--tiffany)] hover:text-white font-heading-medium py-6 rounded-2xl"
      >
        Criar nova dieta
      </Button>
    </div>
  )
}
