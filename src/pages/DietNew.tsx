import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Apple, Flame, Target, Loader2, Sparkles, Coffee, Sunrise,
  Sun, Sunset, Moon, ShoppingCart, Lightbulb
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { generatePersonalizedDiet, calculateBioimpedance, DietGenerationData, NutritionData } from '@/lib/openai'

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

  const [isCalculating, setIsCalculating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [generatedDiet, setGeneratedDiet] = useState<GeneratedDiet | null>(null)
  const [showDietDialog, setShowDietDialog] = useState(false)
  const [selectedDay, setSelectedDay] = useState<keyof GeneratedDiet['meal_plan']>('monday')

  useEffect(() => {
    // Se o usuário já tem dados nutricionais calculados, usa-os
    if (userProfile?.dailyCalories) {
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
  }, [userProfile])

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
        fatsGoal: bioData.fats
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
      setShowDietDialog(true)

      toast({
        title: '🎉 Dieta gerada!',
        description: 'Seu plano alimentar personalizado está pronto!'
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

      {/* Dialog com Dieta Gerada */}
      {generatedDiet && (
        <DietDialog
          diet={generatedDiet}
          nutritionData={nutritionData}
          open={showDietDialog}
          onClose={() => setShowDietDialog(false)}
          selectedDay={selectedDay}
          onDayChange={setSelectedDay}
          daysOfWeek={daysOfWeek}
        />
      )}
    </div>
  )
}

function DietDialog({
  diet,
  nutritionData,
  open,
  onClose,
  selectedDay,
  onDayChange,
  daysOfWeek
}: {
  diet: GeneratedDiet
  nutritionData: NutritionData | null
  open: boolean
  onClose: () => void
  selectedDay: keyof GeneratedDiet['meal_plan']
  onDayChange: (day: keyof GeneratedDiet['meal_plan']) => void
  daysOfWeek: Array<{key: keyof GeneratedDiet['meal_plan']; label: string}>
}) {
  const dayPlan = diet.meal_plan[selectedDay]
  const totalCalories = dayPlan.breakfast.calories + dayPlan.lunch.calories + dayPlan.dinner.calories +
    dayPlan.snacks.reduce((sum, snack) => sum + snack.calories, 0)
  const totalProtein = dayPlan.breakfast.protein + dayPlan.lunch.protein + dayPlan.dinner.protein
  const totalCarbs = dayPlan.breakfast.carbs + dayPlan.lunch.carbs + dayPlan.dinner.carbs
  const totalFats = dayPlan.breakfast.fats + dayPlan.lunch.fats + dayPlan.dinner.fats

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return Coffee
      case 'lunch': return Sun
      case 'dinner': return Moon
      default: return Sunrise
    }
  }

  const renderMeal = (meal: GeneratedMeal, mealType: string, mealName: string) => {
    const Icon = getMealIcon(mealType)
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-orange-500" />
              {mealName}
            </span>
            <Badge variant="secondary">{meal.calories} kcal</Badge>
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{diet.diet_name}</DialogTitle>
          <p className="text-gray-600 dark:text-gray-400">{diet.description}</p>
        </DialogHeader>

        {nutritionData && (
          <div className="grid grid-cols-4 gap-3 py-3 border-y">
            <div className="text-center">
              <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
              <p className="text-sm font-medium">{totalCalories}</p>
              <p className="text-xs text-gray-500">Meta: {nutritionData.dailyCalories}</p>
            </div>
            <div className="text-center">
              <Apple className="w-4 h-4 mx-auto mb-1 text-red-500" />
              <p className="text-sm font-medium">{totalProtein}g</p>
              <p className="text-xs text-gray-500">Meta: {nutritionData.protein}g</p>
            </div>
            <div className="text-center">
              <Coffee className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <p className="text-sm font-medium">{totalCarbs}g</p>
              <p className="text-xs text-gray-500">Meta: {nutritionData.carbs}g</p>
            </div>
            <div className="text-center">
              <Target className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-sm font-medium">{totalFats}g</p>
              <p className="text-xs text-gray-500">Meta: {nutritionData.fats}g</p>
            </div>
          </div>
        )}

        <ScrollArea className="h-[550px] pr-4">
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
                  {renderMeal(diet.meal_plan[day.key].breakfast, 'breakfast', 'Café da Manhã')}
                  {renderMeal(diet.meal_plan[day.key].lunch, 'lunch', 'Almoço')}
                  {renderMeal(diet.meal_plan[day.key].dinner, 'dinner', 'Jantar')}

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
        </ScrollArea>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            onClick={() => {
              alert('Dieta salva! Em breve você poderá acompanhar seu progresso.')
              onClose()
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Salvar Dieta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
