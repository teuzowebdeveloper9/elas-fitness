import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Play, Clock, Flame, Dumbbell, Home, Zap, Music,
  Heart, Sparkles, Loader2, ArrowDown, ArrowUp, ArrowUpDown
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { generatePersonalizedWorkout, WorkoutGenerationData } from '@/lib/openai'
import { useToast } from '@/hooks/use-toast'

type WorkoutType = 'musculacao' | 'casa' | 'abdominal' | 'funcional' | 'danca'
type MobilityType = 'inferior' | 'superior' | 'completa' | 'none'

interface GeneratedWorkout {
  workout_name: string
  description: string
  duration_minutes: number
  estimated_calories: number
  workout_plan: {
    warmup: Array<{name: string; duration: string; description: string}>
    main_exercises: Array<{name: string; sets: string; reps: string; rest: string; description: string; calories: number}>
    mobility_exercises?: Array<{name: string; duration: string; description: string; focus_area: string}>
    cooldown: Array<{name: string; duration: string; description: string}>
  }
  equipment_needed: string[]
  tips: string[]
  adaptations: string[]
}

export default function WorkoutsNew() {
  const { userProfile } = useUser()
  const { toast } = useToast()

  const [availableTime, setAvailableTime] = useState(45)
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType>('musculacao')
  const [selectedMobility, setSelectedMobility] = useState<MobilityType>('none')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null)
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false)

  const workoutTypes = [
    {
      id: 'musculacao' as WorkoutType,
      name: 'Musculação',
      icon: Dumbbell,
      description: 'Treino com pesos e equipamentos',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'casa' as WorkoutType,
      name: 'Treino em Casa',
      icon: Home,
      description: 'Sem equipamentos, apenas peso corporal',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'abdominal' as WorkoutType,
      name: 'Abdominal',
      icon: Zap,
      description: 'Foco em core e abdômen',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'funcional' as WorkoutType,
      name: 'Funcional',
      icon: Heart,
      description: 'Movimentos completos e dinâmicos',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'danca' as WorkoutType,
      name: 'Dança',
      icon: Music,
      description: 'Cardio divertido ao som de música',
      color: 'from-pink-500 to-rose-600'
    },
  ]

  const mobilityOptions = [
    {
      id: 'none' as MobilityType,
      name: 'Sem Mobilidade Extra',
      icon: null,
      description: 'Foco apenas no treino principal'
    },
    {
      id: 'inferior' as MobilityType,
      name: 'Mobilidade Inferior',
      icon: ArrowDown,
      description: 'Quadril, joelhos, tornozelos'
    },
    {
      id: 'superior' as MobilityType,
      name: 'Mobilidade Superior',
      icon: ArrowUp,
      description: 'Ombros, cotovelos, punhos'
    },
    {
      id: 'completa' as MobilityType,
      name: 'Mobilidade Completa',
      icon: ArrowUpDown,
      description: 'Corpo todo - máxima flexibilidade'
    },
  ]

  const handleGenerateWorkout = async () => {
    if (!userProfile) {
      toast({
        title: 'Erro',
        description: 'Perfil de usuário não encontrado',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)

    try {
      const workoutData: WorkoutGenerationData = {
        userProfile: {
          name: userProfile.name,
          age: userProfile.age,
          fitnessLevel: userProfile.fitnessLevel,
          goals: userProfile.goals,
          lifePhase: userProfile.lifePhase,
          exerciseFrequency: userProfile.exerciseFrequency,
          challenges: userProfile.challenges,
          healthConditions: userProfile.healthConditions
        },
        workoutPreferences: {
          workoutType: selectedWorkoutType,
          mobilityType: selectedMobility,
          availableTime: availableTime,
          equipmentAvailable: selectedWorkoutType === 'casa' ? [] : undefined
        }
      }

      const workout = await generatePersonalizedWorkout(workoutData)
      setGeneratedWorkout(workout)
      setShowWorkoutDialog(true)

      toast({
        title: '✨ Treino gerado!',
        description: 'Seu treino personalizado está pronto!',
      })
    } catch (error) {
      console.error('Erro ao gerar treino:', error)
      toast({
        title: 'Erro ao gerar treino',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Meus Treinos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Crie treinos personalizados com inteligência artificial
        </p>
      </div>

      {/* Configuração do Treino */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Configure seu Treino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tempo Disponível */}
          <div className="space-y-3">
            <Label htmlFor="time" className="text-base font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Quanto tempo você tem disponível hoje?
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="time"
                type="number"
                min={15}
                max={120}
                value={availableTime}
                onChange={(e) => setAvailableTime(parseInt(e.target.value) || 30)}
                className="w-32"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">minutos</span>
            </div>
            <div className="flex gap-2">
              {[20, 30, 45, 60].map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  onClick={() => setAvailableTime(time)}
                  className={availableTime === time ? 'bg-purple-100 border-purple-300' : ''}
                >
                  {time} min
                </Button>
              ))}
            </div>
          </div>

          {/* Tipo de Treino */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Escolha o tipo de treino:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workoutTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedWorkoutType === type.id
                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected
                        ? 'ring-2 ring-purple-500 bg-gradient-to-br ' + type.color + ' text-white'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedWorkoutType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-purple-500'}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{type.name}</h3>
                          <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Mobilidade */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Adicionar mobilidade?</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Exercícios de mobilidade melhoram flexibilidade e previnem lesões
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mobilityOptions.map((option) => {
                const Icon = option.icon
                const isSelected = selectedMobility === option.id
                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'ring-2 ring-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedMobility(option.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className={`w-5 h-5 ${isSelected ? 'text-pink-600' : 'text-gray-500'}`} />}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{option.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Botão Gerar */}
          <Button
            onClick={handleGenerateWorkout}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white h-12 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando seu treino perfeito...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Treino Personalizado
              </>
            )}
          </Button>

          {userProfile && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
              <AlertDescription className="text-sm">
                <strong>Adaptado para você:</strong> Nível {userProfile.fitnessLevel === 'beginner' ? 'Iniciante' : userProfile.fitnessLevel === 'intermediate' ? 'Intermediário' : 'Avançado'} •
                Fase: {userProfile.lifePhase === 'menstrual' ? 'Menstrual' : userProfile.lifePhase === 'pre-menopause' ? 'Pré-menopausa' : userProfile.lifePhase === 'menopause' ? 'Menopausa' : 'Pós-menopausa'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dialog com Treino Gerado */}
      {generatedWorkout && (
        <WorkoutDialog
          workout={generatedWorkout}
          open={showWorkoutDialog}
          onClose={() => setShowWorkoutDialog(false)}
        />
      )}
    </div>
  )
}

function WorkoutDialog({
  workout,
  open,
  onClose
}: {
  workout: GeneratedWorkout
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{workout.workout_name}</DialogTitle>
          <p className="text-gray-600 dark:text-gray-400">{workout.description}</p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4 border-y">
          <div className="text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-sm font-medium">{workout.duration_minutes} min</p>
            <p className="text-xs text-gray-500">Duração</p>
          </div>
          <div className="text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="text-sm font-medium">{workout.estimated_calories} kcal</p>
            <p className="text-xs text-gray-500">Estimado</p>
          </div>
          <div className="text-center">
            <Dumbbell className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-sm font-medium">{workout.workout_plan.main_exercises.length}</p>
            <p className="text-xs text-gray-500">Exercícios</p>
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <Tabs defaultValue="workout" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workout">Treino</TabsTrigger>
              <TabsTrigger value="mobility">Mobilidade</TabsTrigger>
              <TabsTrigger value="tips">Dicas</TabsTrigger>
            </TabsList>

            <TabsContent value="workout" className="space-y-6 mt-4">
              {/* Aquecimento */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Aquecimento
                </h3>
                <div className="space-y-2">
                  {workout.workout_plan.warmup.map((exercise, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{exercise.description}</p>
                        </div>
                        <Badge variant="secondary">{exercise.duration}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Exercícios Principais */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-purple-500" />
                  Exercícios Principais
                </h3>
                <div className="space-y-3">
                  {workout.workout_plan.main_exercises.map((exercise, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-lg">{idx + 1}. {exercise.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exercise.description}</p>
                          </div>
                          <div className="text-right">
                            <Flame className="w-4 h-4 inline text-orange-500 mr-1" />
                            <span className="text-sm font-medium">{exercise.calories} kcal</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm mt-3">
                          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <p className="font-medium">Séries</p>
                            <p className="text-gray-600 dark:text-gray-400">{exercise.sets}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <p className="font-medium">Repetições</p>
                            <p className="text-gray-600 dark:text-gray-400">{exercise.reps}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <p className="font-medium">Descanso</p>
                            <p className="text-gray-600 dark:text-gray-400">{exercise.rest}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Alongamento */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Alongamento Final
                </h3>
                <div className="space-y-2">
                  {workout.workout_plan.cooldown.map((exercise, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{exercise.description}</p>
                        </div>
                        <Badge variant="secondary">{exercise.duration}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mobility" className="space-y-4 mt-4">
              {workout.workout_plan.mobility_exercises && workout.workout_plan.mobility_exercises.length > 0 ? (
                <>
                  <h3 className="font-semibold text-lg">Exercícios de Mobilidade</h3>
                  {workout.workout_plan.mobility_exercises.map((exercise, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exercise.description}</p>
                          <Badge variant="outline" className="mt-2">{exercise.focus_area}</Badge>
                        </div>
                        <Badge>{exercise.duration}</Badge>
                      </div>
                    </Card>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum exercício de mobilidade adicional neste treino</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tips" className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold text-lg mb-3">💡 Dicas Importantes</h3>
                <ul className="space-y-2">
                  {workout.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {workout.equipment_needed && workout.equipment_needed.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">🎽 Equipamentos Necessários</h3>
                  <div className="flex flex-wrap gap-2">
                    {workout.equipment_needed.map((equipment, idx) => (
                      <Badge key={idx} variant="secondary">{equipment}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {workout.adaptations && workout.adaptations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">🌸 Adaptações para Você</h3>
                  <ul className="space-y-2">
                    {workout.adaptations.map((adaptation, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        <span className="text-sm">{adaptation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            onClick={() => {
              alert('Treino salvo! Em breve você poderá acompanhar seu progresso.')
              onClose()
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Começar Agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
