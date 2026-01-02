import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Apple, Flame, Target, Loader2, Sparkles, Coffee, Sunrise,
  Sun, Moon, ShoppingCart, Lightbulb, Camera, ArrowRight,
  RefreshCw, MessageSquare
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { generatePersonalizedDiet, calculateBioimpedance, DietGenerationData, NutritionData } from '@/lib/openai-real'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

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

export default function DietNew() {
  const { userProfile, updateUserProfile } = useUser()
  const { toast } = useToast()
  const navigate = useNavigate()

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
          // Não mostrar tela de configuração se já tem dieta
          setShowConfigScreen(false)
        } else {
          // Mostrar tela de configuração se não tem dieta
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
    if (!userProfile) return

    setIsCalculating(true)

    try {
      const bioData = await calculateBioimpedance({
        weight: userProfile.weight,
        height: userProfile.height,
        age: userProfile.age,
        gender: 'female',
        activityLevel: userProfile.activityLevel || 'moderate',
        goals: userProfile.goals
      })

      setNutritionData(bioData)

      // Salvar no perfil do usuário
      updateUserProfile({
        idealWeight: bioData.idealWeight,
        bmi: bioData.bmi,
        bodyFatPercentage: bioData.bodyFatPercentage,
        dailyCalories: bioData.dailyCalories,
        proteinGoal: bioData.protein,
        carbsGoal: bioData.carbs,
        fatsGoal: bioData.fats,
        waterGoal: bioData.waterGoal
      })

      toast({
        title: '✨ Bioimpedância calculada!',
        description: 'Suas metas nutricionais foram definidas.'
      })
    } catch (error) {
      console.error('Erro ao calcular bioimpedância:', error)
      toast({
        title: 'Erro ao calcular',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      })
    } finally {
      setIsCalculating(false)
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
          dietaryRestrictions: userProfile.dietaryRestrictions,
          favoriteFoods: userProfile.favoriteFoods,
          dislikedFoods: userProfile.dislikedFoods,
          mealsPerDay: userProfile.mealsPerDay || 3,
          cookingSkill: userProfile.cookingSkill,
          timeForCooking: userProfile.timeForCooking
        }
      }

      const diet = await generatePersonalizedDiet(dietData)
      setGeneratedDiet(diet)

      // Desativar dieta anterior se existir
      if (savedDietId) {
        await supabase
          .from('saved_diets')
          .update({ is_active: false })
          .eq('id', savedDietId)
      }

      // Salvar automaticamente a nova dieta
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

      if (saveError) {
        console.error('Erro ao salvar dieta:', saveError)
      } else {
        setSavedDietId(savedDiet.id)
      }

      // Ocultar tela de configuração e mostrar a dieta
      setShowConfigScreen(false)

      // Rolar para o topo
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })

      toast({
        title: '🎉 Dieta gerada e salva!',
        description: 'Sua dieta personalizada está pronta!'
      })
    } catch (error) {
      console.error('Erro ao gerar dieta:', error)
      toast({
        title: 'Erro ao gerar dieta',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const daysOfWeek = [
    { key: 'monday' as const, label: 'Segunda' },
    { key: 'tuesday' as const, label: 'Terça' },
    { key: 'wednesday' as const, label: 'Quarta' },
    { key: 'thursday' as const, label: 'Quinta' },
    { key: 'friday' as const, label: 'Sexta' },
    { key: 'saturday' as const, label: 'Sábado' },
    { key: 'sunday' as const, label: 'Domingo' }
  ]

  // Se tem dieta gerada, mostrar a dieta
  if (!isLoadingSavedDiet && generatedDiet && !showConfigScreen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              {generatedDiet.diet_name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {generatedDiet.description}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowConfigScreen(true)}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Nova Dieta
          </Button>
        </div>

        {/* Nutri Scan Quick Access */}
        <Card
          className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
          onClick={() => navigate('/nutri-scan')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Nutri Scan</h3>
                  <p className="text-white/90 text-sm">
                    Tire foto da sua refeição e registre os nutrientes automaticamente
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <DietView
          diet={generatedDiet}
          nutritionData={nutritionData}
          selectedDay={selectedDay}
          onDayChange={setSelectedDay}
          daysOfWeek={daysOfWeek}
          dietId={savedDietId}
        />
      </div>
    )
  }

  // Senão, mostrar tela de configuração
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          Minha Dieta
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Crie uma dieta personalizada com inteligência artificial
        </p>
      </div>

      {/* Nutri Scan Quick Access */}
      <Card
        className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
        onClick={() => navigate('/nutri-scan')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Nutri Scan</h3>
                <p className="text-white/90 text-sm">
                  Tire foto da sua refeição e registre os nutrientes automaticamente
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Aviso se já tem dieta mas está editando */}
      {!isLoadingSavedDiet && generatedDiet && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Sua Dieta Personalizada
              </span>
              <Badge variant="secondary">Ativa</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
              <AlertDescription className="text-sm">
                💡 <strong>Dica:</strong> Use o ícone de mensagem em cada refeição para sugerir alterações. Depois, gere uma nova versão da dieta considerando seus feedbacks.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleGenerateDiet}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando nova versão...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Nova Versão da Dieta
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bioimpedância e Metas Nutricionais */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Suas Metas Nutricionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!nutritionData ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">Calcule sua Bioimpedância</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Vamos usar inteligência artificial para calcular suas metas ideais de calorias e macronutrientes
              </p>
              <Button
                onClick={handleCalculateBioimpedance}
                disabled={isCalculating}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Calcular Agora
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">{nutritionData.dailyCalories}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Calorias/dia</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Apple className="w-5 h-5 mx-auto mb-2 text-red-500" />
                    <p className="text-2xl font-bold">{nutritionData.protein}g</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Proteína</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Coffee className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                    <p className="text-2xl font-bold">{nutritionData.carbs}g</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Carboidratos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{nutritionData.fats}g</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Gorduras</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
                  <AlertDescription>
                    <strong>Peso Ideal:</strong> {nutritionData.idealWeight.toFixed(1)} kg
                  </AlertDescription>
                </Alert>
                <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20">
                  <AlertDescription>
                    <strong>IMC:</strong> {nutritionData.bmi.toFixed(1)} •
                    {nutritionData.bodyFatPercentage && (
                      <> <strong>Gordura:</strong> {nutritionData.bodyFatPercentage.toFixed(1)}%</>
                    )}
                  </AlertDescription>
                </Alert>
              </div>

              <Button
                onClick={handleGenerateDiet}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-12 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando sua dieta perfeita...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Dieta Personalizada
                  </>
                )}
              </Button>

              <Button
                onClick={handleCalculateBioimpedance}
                disabled={isCalculating}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recalculando...
                  </>
                ) : (
                  'Recalcular Bioimpedância'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

function DietView({
  diet,
  nutritionData,
  selectedDay,
  onDayChange,
  daysOfWeek,
  dietId
}: {
  diet: GeneratedDiet
  nutritionData: NutritionData | null
  selectedDay: keyof GeneratedDiet['meal_plan']
  onDayChange: (day: keyof GeneratedDiet['meal_plan']) => void
  daysOfWeek: Array<{key: keyof GeneratedDiet['meal_plan']; label: string}>
  dietId: string | null
}) {
  const { toast } = useToast()
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [selectedMealForFeedback, setSelectedMealForFeedback] = useState<{
    day: string
    type: string
    meal: string
  } | null>(null)
  const dayPlan = diet.meal_plan[selectedDay]
  const totalCalories = dayPlan.breakfast.calories + dayPlan.lunch.calories + dayPlan.dinner.calories +
    dayPlan.snacks.reduce((sum, snack) => sum + snack.calories, 0)
  const totalProtein = dayPlan.breakfast.protein + dayPlan.lunch.protein + dayPlan.dinner.protein
  const totalCarbs = dayPlan.breakfast.carbs + dayPlan.lunch.carbs + dayPlan.dinner.carbs
  const totalFats = dayPlan.breakfast.fats + dayPlan.lunch.fats + dayPlan.dinner.fats

  const handleMealFeedback = (day: string, type: string, meal: string, _feedbackType: 'like' | 'dislike') => {
    setSelectedMealForFeedback({ day, type, meal })
    setShowFeedbackDialog(true)
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() || !selectedMealForFeedback || !dietId) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('diet_feedback')
        .insert({
          user_id: user.id,
          diet_id: dietId,
          feedback_type: 'change_request',
          meal_day: selectedMealForFeedback.day,
          meal_type: selectedMealForFeedback.type,
          feedback_text: feedbackText
        })

      if (error) throw error

      toast({
        title: '✅ Feedback enviado!',
        description: 'Suas sugestões foram salvas. Você pode gerar uma nova dieta considerando este feedback.'
      })

      setShowFeedbackDialog(false)
      setFeedbackText('')
      setSelectedMealForFeedback(null)
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível salvar seu feedback.',
        variant: 'destructive'
      })
    }
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return Coffee
      case 'lunch': return Sun
      case 'dinner': return Moon
      default: return Sunrise
    }
  }

  const renderMeal = (meal: GeneratedMeal, mealType: string, mealName: string, dayKey: string) => {
    const Icon = getMealIcon(mealType)
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-orange-500" />
              {mealName}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{meal.calories} kcal</Badge>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-xs"
                onClick={() => handleMealFeedback(dayKey, mealType, meal.name, 'dislike')}
              >
                <MessageSquare className="w-3 h-3" />
                Feedback
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium mb-2">{meal.name}</p>
            <ul className="space-y-1">
              {meal.foods.map((food, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  {food}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
            <div className="text-center">
              <p className="font-medium text-red-600">{meal.protein}g</p>
              <p className="text-gray-500">Proteína</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-amber-600">{meal.carbs}g</p>
              <p className="text-gray-500">Carbos</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-blue-600">{meal.fats}g</p>
              <p className="text-gray-500">Gorduras</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Metas Nutricionais do Dia */}
      {nutritionData && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Resumo Nutricional do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Flame className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{totalCalories}</p>
                <p className="text-xs text-gray-500">Meta: {nutritionData.dailyCalories} kcal</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Apple className="w-5 h-5 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{totalProtein}g</p>
                <p className="text-xs text-gray-500">Meta: {nutritionData.protein}g</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Coffee className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">{totalCarbs}g</p>
                <p className="text-xs text-gray-500">Meta: {nutritionData.carbs}g</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Target className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{totalFats}g</p>
                <p className="text-xs text-gray-500">Meta: {nutritionData.fats}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plano de Refeições */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={selectedDay} onValueChange={(value) => onDayChange(value as keyof GeneratedDiet['meal_plan'])} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-4">
              {daysOfWeek.map((day) => (
                <TabsTrigger key={day.key} value={day.key} className="text-xs">
                  {day.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {daysOfWeek.map((day) => (
              <TabsContent key={day.key} value={day.key} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderMeal(diet.meal_plan[day.key].breakfast, 'breakfast', 'Café da Manhã', day.label)}
                  {renderMeal(diet.meal_plan[day.key].lunch, 'lunch', 'Almoço', day.label)}
                  {renderMeal(diet.meal_plan[day.key].dinner, 'dinner', 'Jantar', day.label)}

                  {/* Lanches */}
                  {diet.meal_plan[day.key].snacks.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Sunrise className="w-5 h-5 text-purple-500" />
                          Lanches
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {diet.meal_plan[day.key].snacks.map((snack, idx) => (
                            <li key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="text-sm">{snack.name}</span>
                              <Badge variant="secondary" className="text-xs">{snack.calories} kcal</Badge>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Lista de Compras e Dicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-500" />
                  Lista de Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {diet.shopping_list.slice(0, 15).map((item, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {item}
                    </li>
                  ))}
                  {diet.shopping_list.length > 15 && (
                    <li className="text-sm text-gray-500">E mais {diet.shopping_list.length - 15} itens...</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Dicas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diet.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-yellow-500">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Feedback */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Feedback sobre Refeição</DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedMealForFeedback && (
                <>Sugerindo alteração para <strong>{selectedMealForFeedback.meal}</strong> ({selectedMealForFeedback.day})</>
              )}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">O que você gostaria de mudar?</Label>
              <Textarea
                id="feedback"
                placeholder="Ex: Não gosto de frango, prefiro peixe. Ou: Esta refeição tem muita gordura, gostaria de algo mais leve."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20">
              <AlertDescription className="text-sm">
                💡 Seu feedback será considerado ao gerar uma nova versão da dieta. Quanto mais específico, melhor!
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFeedbackDialog(false)
                  setFeedbackText('')
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Enviar Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
