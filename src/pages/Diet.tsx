import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Apple,
  Egg,
  Fish,
  Carrot,
  Plus,
  Target,
  Flame,
  Activity,
  TrendingUp,
  Coffee,
  Sunrise,
  Sun,
  Sunset,
  Moon
} from 'lucide-react'

interface Meal {
  id: string
  name: string
  time: string
  icon: typeof Coffee
  calories: number
  protein: number
  carbs: number
  fats: number
  items: string[]
}

export default function Diet() {
  const { toast } = useToast()
  const [meals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Café da Manhã',
      time: '08:00',
      icon: Coffee,
      calories: 380,
      protein: 25,
      carbs: 45,
      fats: 12,
      items: ['2 ovos mexidos', 'Pão integral', 'Suco de laranja', 'Banana']
    },
    {
      id: '2',
      name: 'Lanche da Manhã',
      time: '10:30',
      icon: Sunrise,
      calories: 150,
      protein: 10,
      carbs: 20,
      fats: 3,
      items: ['Iogurte grego', 'Granola']
    },
    {
      id: '3',
      name: 'Almoço',
      time: '13:00',
      icon: Sun,
      calories: 520,
      protein: 40,
      carbs: 55,
      fats: 18,
      items: ['Peito de frango grelhado (150g)', 'Arroz integral', 'Salada verde', 'Legumes refogados']
    },
    {
      id: '4',
      name: 'Lanche da Tarde',
      time: '16:00',
      icon: Sunset,
      calories: 200,
      protein: 15,
      carbs: 25,
      fats: 5,
      items: ['Batata doce (100g)', 'Pasta de amendoim']
    },
    {
      id: '5',
      name: 'Jantar',
      time: '19:30',
      icon: Moon,
      calories: 450,
      protein: 35,
      carbs: 40,
      fats: 15,
      items: ['Salmão grelhado', 'Quinoa', 'Brócolis no vapor', 'Tomate cereja']
    }
  ])

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0)
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0)
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0)
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0)

  const calorieGoal = 1800
  const proteinGoal = 120
  const carbsGoal = 180
  const fatsGoal = 60

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          Meu Plano Alimentar
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe suas refeições e macros diários
        </p>
      </div>

      {/* Daily Overview */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Metas Diárias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Calorias
              </span>
              <span className="text-sm font-bold">{totalCalories} / {calorieGoal} kcal</span>
            </div>
            <Progress value={(totalCalories / calorieGoal) * 100} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium">Proteínas</span>
                <span className="text-xs font-bold">{totalProtein}g</span>
              </div>
              <Progress value={(totalProtein / proteinGoal) * 100} className="h-2" />
              <span className="text-xs text-gray-500">Meta: {proteinGoal}g</span>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium">Carboidratos</span>
                <span className="text-xs font-bold">{totalCarbs}g</span>
              </div>
              <Progress value={(totalCarbs / carbsGoal) * 100} className="h-2" />
              <span className="text-xs text-gray-500">Meta: {carbsGoal}g</span>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium">Gorduras</span>
                <span className="text-xs font-bold">{totalFats}g</span>
              </div>
              <Progress value={(totalFats / fatsGoal) * 100} className="h-2" />
              <span className="text-xs text-gray-500">Meta: {fatsGoal}g</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals List */}
      <div className="space-y-4">
        {meals.map((meal) => (
          <Card key={meal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <meal.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                    <p className="text-sm text-gray-500">{meal.time}</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300">
                  {meal.calories} kcal
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Proteínas</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{meal.protein}g</p>
                  </div>
                  <div className="p-2 bg-[var(--tiffany-light)] dark:bg-purple-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Carbos</p>
                    <p className="text-sm font-bold text-[var(--lilac)] dark:text-purple-400">{meal.carbs}g</p>
                  </div>
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Gorduras</p>
                    <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{meal.fats}g</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {meal.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meal Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--lilac)]" />
            Sugestões Saudáveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="protein" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="protein">
                <Fish className="w-4 h-4 mr-1" />
                Proteínas
              </TabsTrigger>
              <TabsTrigger value="carbs">
                <Apple className="w-4 h-4 mr-1" />
                Carbos
              </TabsTrigger>
              <TabsTrigger value="veggies">
                <Carrot className="w-4 h-4 mr-1" />
                Vegetais
              </TabsTrigger>
              <TabsTrigger value="snacks">
                <Egg className="w-4 h-4 mr-1" />
                Lanches
              </TabsTrigger>
            </TabsList>

            <TabsContent value="protein" className="space-y-2 mt-4">
              {['Peito de frango (150g) - 165 kcal', 'Salmão (100g) - 206 kcal', 'Tilápia (150g) - 145 kcal', 'Carne magra (100g) - 250 kcal', 'Ovos (2 unidades) - 140 kcal'].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm">{item}</span>
                  <Button size="sm" variant="ghost" onClick={() => {
                    toast({
                      title: "Adicionado!",
                      description: "Item adicionado ao seu plano alimentar"
                    })
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="carbs" className="space-y-2 mt-4">
              {['Batata doce (100g) - 86 kcal', 'Arroz integral (100g) - 123 kcal', 'Aveia (50g) - 190 kcal', 'Quinoa (100g) - 120 kcal', 'Pão integral (2 fatias) - 138 kcal'].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-[var(--tiffany-light)] dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm">{item}</span>
                  <Button size="sm" variant="ghost" onClick={() => {
                    toast({
                      title: "Adicionado!",
                      description: "Item adicionado ao seu plano alimentar"
                    })
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="veggies" className="space-y-2 mt-4">
              {['Brócolis (100g) - 34 kcal', 'Espinafre (100g) - 23 kcal', 'Cenoura (100g) - 41 kcal', 'Tomate (100g) - 18 kcal', 'Abobrinha (100g) - 17 kcal'].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm">{item}</span>
                  <Button size="sm" variant="ghost" onClick={() => {
                    toast({
                      title: "Adicionado!",
                      description: "Item adicionado ao seu plano alimentar"
                    })
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="snacks" className="space-y-2 mt-4">
              {['Iogurte grego (150g) - 100 kcal', 'Mix de castanhas (30g) - 180 kcal', 'Frutas vermelhas (100g) - 50 kcal', 'Queijo cottage (100g) - 98 kcal', 'Pasta de amendoim (20g) - 120 kcal'].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <span className="text-sm">{item}</span>
                  <Button size="sm" variant="ghost" onClick={() => {
                    toast({
                      title: "Adicionado!",
                      description: "Item adicionado ao seu plano alimentar"
                    })
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Water Intake */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Hidratação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Consumo de Água</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">1.8L / 2.5L</span>
            </div>
            <Progress value={72} className="h-3" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                <div
                  key={glass}
                  className={`h-8 w-full rounded ${
                    glass <= 6 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                toast({
                  title: "Ótimo! 💧",
                  description: "Mais um copo registrado!"
                })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Copo de Água
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
