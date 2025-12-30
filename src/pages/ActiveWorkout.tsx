import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle, Clock, Flame, Dumbbell,
  ArrowLeft, Target, Timer, Award, Coffee, Moon, Zap, Video
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { ExerciseVideoModal } from '@/components/ExerciseVideoModal'
import { searchExerciseVideo, YouTubeVideo } from '@/lib/youtube-service'

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

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const workout = location.state?.workout as GeneratedWorkout | null
  const [currentTab, setCurrentTab] = useState('warmup')
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
  const [exerciseWeights, setExerciseWeights] = useState<Record<string, number>>({})
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [exerciseVideos, setExerciseVideos] = useState<YouTubeVideo[]>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)

  useEffect(() => {
    if (!workout) {
      navigate('/workouts', { replace: true })
      return
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [workout, navigate, startTime])

  if (!workout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    )
  }

  const toggleExerciseComplete = (exerciseName: string) => {
    const newCompleted = new Set(completedExercises)
    if (newCompleted.has(exerciseName)) {
      newCompleted.delete(exerciseName)
    } else {
      newCompleted.add(exerciseName)
    }
    setCompletedExercises(newCompleted)
  }

  const handleWeightChange = (exerciseName: string, weight: number) => {
    setExerciseWeights(prev => ({ ...prev, [exerciseName]: weight }))
  }

  const handleWatchVideo = async (exerciseName: string) => {
    setSelectedExercise(exerciseName)
    setExerciseVideos([]) // Limpar vídeos anteriores
    setLoadingVideos(true)
    setVideoModalOpen(true)

    try {
      console.log('🔍 Buscando vídeos para:', exerciseName)
      const videos = await searchExerciseVideo(exerciseName, 5)
      console.log('✅ Vídeos encontrados:', videos.length, videos.map(v => v.title))
      setExerciseVideos(videos)
    } catch (error) {
      console.error('❌ Erro ao buscar vídeos:', error)
      toast({
        title: 'Erro ao buscar vídeos',
        description: 'Não foi possível carregar os vídeos neste momento.',
        variant: 'destructive'
      })
    } finally {
      setLoadingVideos(false)
    }
  }

  const totalExercises =
    workout.workout_plan.warmup.length +
    workout.workout_plan.main_exercises.length +
    (workout.workout_plan.mobility_exercises?.length || 0) +
    workout.workout_plan.cooldown.length

  const progressPercentage = (completedExercises.size / totalExercises) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleFinishWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Se não tiver usuário, apenas navega
        const duration = Math.floor(elapsedTime / 60)
        toast({
          title: '🎉 Treino Concluído!',
          description: `Parabéns! Você treinou por ${duration} minutos.`
        })
        navigate('/workout-completion', {
          state: {
            workout,
            duration,
            caloriesBurned: Math.round(workout.estimated_calories * (duration / workout.duration_minutes))
          }
        })
        return
      }

      const duration = Math.floor(elapsedTime / 60)

      // Tentar salvar treino completado (sem bloquear se falhar)
      try {
        await supabase
          .from('completed_workouts')
          .insert({
            user_id: user.id,
            workout_name: workout.workout_name,
            workout_type: 'personalizado',
            duration_minutes: duration,
            calories_burned: Math.round(workout.estimated_calories * (duration / workout.duration_minutes)),
            completed_at: new Date().toISOString()
          })
      } catch (workoutError) {
        console.error('Erro ao salvar treino (continuando):', workoutError)
      }

      // Tentar salvar pesos dos exercícios (sem bloquear se falhar)
      if (Object.keys(exerciseWeights).length > 0) {
        try {
          const weightEntries = Object.entries(exerciseWeights)
            .filter(([_, weight]) => weight > 0)
            .map(([exerciseName, weight]) => ({
              user_id: user.id,
              exercise_name: exerciseName,
              weight_kg: weight,
              previous_weight: 0,
              weight_increase: 0
            }))

          if (weightEntries.length > 0) {
            await supabase
              .from('exercise_weight_progression')
              .insert(weightEntries)
          }
        } catch (weightError) {
          console.error('Erro ao salvar pesos (continuando):', weightError)
        }
      }

      toast({
        title: '🎉 Treino Concluído!',
        description: `Parabéns! Você treinou por ${duration} minutos.`
      })

      navigate('/workout-completion', {
        state: {
          workout,
          duration,
          caloriesBurned: Math.round(workout.estimated_calories * (duration / workout.duration_minutes))
        }
      })
    } catch (error) {
      console.error('Erro ao finalizar treino:', error)
      // Mesmo com erro, permite finalizar
      const duration = Math.floor(elapsedTime / 60)
      toast({
        title: '🎉 Treino Concluído!',
        description: `Você treinou por ${duration} minutos.`
      })
      navigate('/workout-completion', {
        state: {
          workout,
          duration,
          caloriesBurned: Math.round(workout.estimated_calories * (duration / workout.duration_minutes))
        }
      })
    }
  }

  const renderExerciseCard = (
    exercise: any,
    type: 'warmup' | 'main' | 'mobility' | 'cooldown',
    icon: any
  ) => {
    const Icon = icon
    const exerciseId = `${type}-${exercise.name}`
    const isCompleted = completedExercises.has(exerciseId)

    return (
      <Card key={exerciseId} className={`transition-all ${isCompleted ? 'bg-green-50 border-green-300' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Icon className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold">{exercise.name}</h4>
                <Badge variant="outline" className="text-xs gap-1">
                  <Video className="w-3 h-3" />
                  Vídeo disponível
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {exercise.description}
              </p>

              {type === 'main' && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{exercise.sets} séries</Badge>
                  <Badge variant="outline">{exercise.reps} reps</Badge>
                  <Badge variant="outline">Descanso: {exercise.rest}</Badge>
                  <Badge variant="secondary">{exercise.calories} kcal</Badge>
                </div>
              )}

              {(type === 'warmup' || type === 'mobility' || type === 'cooldown') && (
                <Badge variant="outline" className="mb-2">{exercise.duration}</Badge>
              )}

              {type === 'main' && (
                <div className="space-y-2">
                  <Label htmlFor={`weight-${exerciseId}`} className="text-xs">
                    Peso utilizado (kg) - opcional
                  </Label>
                  <Input
                    id={`weight-${exerciseId}`}
                    type="number"
                    placeholder="0.0"
                    value={exerciseWeights[exercise.name] || ''}
                    onChange={(e) => handleWeightChange(exercise.name, parseFloat(e.target.value) || 0)}
                    className="w-32 h-8 text-sm"
                    step="0.5"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleWatchVideo(exercise.name)}
                className="whitespace-nowrap"
              >
                <Video className="w-4 h-4 mr-1" />
                Ver vídeo
              </Button>
              <Button
                size="sm"
                variant={isCompleted ? 'default' : 'outline'}
                onClick={() => toggleExerciseComplete(exerciseId)}
                className={isCompleted ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : 'Concluir'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 pb-6">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/workouts')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Timer className="w-4 h-4 text-blue-500" />
                <span className="font-mono font-semibold">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{workout.workout_name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{workout.description}</p>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progresso</span>
              <span className="font-semibold">{completedExercises.size}/{totalExercises} exercícios</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{workout.duration_minutes} min</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Duração</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4 text-center">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-lg font-bold">{workout.estimated_calories}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Calorias</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <p className="text-lg font-bold">{Math.round(progressPercentage)}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Completo</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Exercícios */}
        <Card>
          <CardContent className="p-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className={`grid w-full ${workout.workout_plan.mobility_exercises && workout.workout_plan.mobility_exercises.length > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger value="warmup" className="text-xs">
                  <Coffee className="w-3 h-3 mr-1" />
                  Aquecimento
                </TabsTrigger>
                <TabsTrigger value="main" className="text-xs">
                  <Dumbbell className="w-3 h-3 mr-1" />
                  Principal
                </TabsTrigger>
                {workout.workout_plan.mobility_exercises && workout.workout_plan.mobility_exercises.length > 0 && (
                  <TabsTrigger value="mobility" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Mobilidade
                  </TabsTrigger>
                )}
                <TabsTrigger value="cooldown" className="text-xs">
                  <Moon className="w-3 h-3 mr-1" />
                  Alongamento
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100vh-400px)] mt-4">
                <TabsContent value="warmup" className="space-y-3 mt-0">
                  {workout.workout_plan.warmup.map((exercise) =>
                    renderExerciseCard(exercise, 'warmup', Coffee)
                  )}
                </TabsContent>

                <TabsContent value="main" className="space-y-3 mt-0">
                  {workout.workout_plan.main_exercises.map((exercise) =>
                    renderExerciseCard(exercise, 'main', Dumbbell)
                  )}
                </TabsContent>

                {workout.workout_plan.mobility_exercises && (
                  <TabsContent value="mobility" className="space-y-3 mt-0">
                    {workout.workout_plan.mobility_exercises.map((exercise) =>
                      renderExerciseCard(exercise, 'mobility', Zap)
                    )}
                  </TabsContent>
                )}

                <TabsContent value="cooldown" className="space-y-3 mt-0">
                  {workout.workout_plan.cooldown.map((exercise) =>
                    renderExerciseCard(exercise, 'cooldown', Moon)
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>

        {/* Botão Finalizar */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <Button
              onClick={handleFinishWorkout}
              disabled={completedExercises.size === 0}
              className="w-full bg-white text-green-600 hover:bg-green-50 font-bold h-12"
            >
              <Award className="w-5 h-5 mr-2" />
              Finalizar Treino
            </Button>
            {completedExercises.size === 0 && (
              <p className="text-center text-xs mt-2 text-white/80">
                Complete pelo menos um exercício para finalizar
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dicas */}
        {workout.tips.length > 0 && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription>
              <p className="font-semibold mb-2">💡 Dicas:</p>
              <ul className="space-y-1 text-sm">
                {workout.tips.slice(0, 3).map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Modal de Vídeos */}
      <ExerciseVideoModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        exerciseName={selectedExercise || ''}
        videos={exerciseVideos}
        loading={loadingVideos}
      />
    </div>
  )
}
