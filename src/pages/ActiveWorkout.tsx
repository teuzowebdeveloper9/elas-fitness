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
  ArrowLeft, Target, Timer, Award, Heart, Zap, Video
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
    mobility_exercises?: Array<{name: string; duration: string; description: string; focus_area: string}>
    main_exercises: Array<{name: string; sets: string; reps: string; rest: string; description: string; calories: number}>
    cardio: Array<{name: string; duration: string; description: string; intensity: string; calories: number}>
  }
  equipment_needed: string[]
  tips: string[]
  adaptations: string[]
  cardio_importance?: string
}

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const workout = location.state?.workout as GeneratedWorkout | null
  const [currentTab, setCurrentTab] = useState('main')
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
  const [exerciseWeights, setExerciseWeights] = useState<Record<string, number>>({})
  const [cardioTimes, setCardioTimes] = useState<Record<string, number>>({})
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [exerciseVideos, setExerciseVideos] = useState<YouTubeVideo[]>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [expandedVideoExercise, setExpandedVideoExercise] = useState<string | null>(null)
  const [exerciseVideoCache, setExerciseVideoCache] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    if (!workout) {
      navigate('/workouts', { replace: true })
      return
    }

    // Definir tab inicial baseado na presença de mobilidade
    if (workout.workout_plan?.mobility_exercises && workout.workout_plan.mobility_exercises.length > 0) {
      setCurrentTab('mobility')
    } else {
      setCurrentTab('main')
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tiffany)]"></div>
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

  const handleCardioTimeChange = (exerciseName: string, minutes: number) => {
    setCardioTimes(prev => ({ ...prev, [exerciseName]: minutes }))
  }

  const handleWatchVideo = async (exerciseName: string, exerciseId: string) => {
    // Se já está expandido, colapsa
    if (expandedVideoExercise === exerciseId) {
      setExpandedVideoExercise(null)
      return
    }

    // Se não tem vídeo em cache, buscar
    if (!exerciseVideoCache.has(exerciseId)) {
      try {
        const videos = await searchExerciseVideo(exerciseName, 1)
        if (videos.length > 0) {
          const newCache = new Map(exerciseVideoCache)
          newCache.set(exerciseId, videos[0].embedUrl)
          setExerciseVideoCache(newCache)
        } else {
          toast({
            title: 'Vídeo não encontrado',
            description: 'Não foi possível encontrar um vídeo para este exercício.',
            variant: 'destructive'
          })
          return
        }
      } catch (error) {
        console.error('Erro ao buscar vídeo:', error)
        toast({
          title: 'Erro ao carregar vídeo',
          description: 'Tente novamente em alguns instantes.',
          variant: 'destructive'
        })
        return
      }
    }

    // Expandir o vídeo
    setExpandedVideoExercise(exerciseId)
  }

  const totalExercises =
    (workout.workout_plan.mobility_exercises?.length || 0) +
    workout.workout_plan.main_exercises.length +
    workout.workout_plan.cardio.length

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

      // Calcular tempo total de cardio realizado
      const totalCardioMinutes = Object.values(cardioTimes).reduce((sum, time) => sum + time, 0)

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
            completed_at: new Date().toISOString(),
            cardio_minutes: totalCardioMinutes || null
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
    type: 'mobility' | 'main' | 'cardio',
    icon: any
  ) => {
    const Icon = icon
    const exerciseId = `${type}-${exercise.name}`
    const isCompleted = completedExercises.has(exerciseId)
    const isVideoExpanded = expandedVideoExercise === exerciseId
    const videoUrl = exerciseVideoCache.get(exerciseId)

    return (
      <Card key={exerciseId} className={`transition-all ${isCompleted ? 'bg-green-50 border-green-300' : ''}`}>
        <CardContent className="p-3 sm:p-4">
          {/* Layout mobile: tudo em coluna vertical */}
          <div className="space-y-3">
            {/* Cabeçalho com título e botões (lado a lado no mobile) */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--lilac)] flex-shrink-0" />
                  <h4 className="font-semibold text-sm sm:text-base">{exercise.name}</h4>
                </div>
                <Badge variant="outline" className="text-xs gap-1">
                  <Video className="w-3 h-3" />
                  Vídeo disponível
                </Badge>
              </div>

              {/* Botões de ação (sempre visíveis no mobile) */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Button
                  size="sm"
                  variant={isVideoExpanded ? 'default' : 'outline'}
                  onClick={() => handleWatchVideo(exercise.name, exerciseId)}
                  className="whitespace-nowrap text-xs h-8 px-2"
                >
                  <Video className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">{isVideoExpanded ? 'Ocultar' : 'Ver vídeo'}</span>
                </Button>
                <Button
                  size="sm"
                  variant={isCompleted ? 'default' : 'outline'}
                  onClick={() => toggleExerciseComplete(exerciseId)}
                  className={`whitespace-nowrap text-xs h-8 px-2 ${isCompleted ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  {isCompleted ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <span className="text-xs">Concluir</span>}
                </Button>
              </div>
            </div>

            {/* Vídeo (fullwidth no mobile quando expandido) */}
            {isVideoExpanded && videoUrl && (
              <div className="w-full">
                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src={videoUrl}
                    title={`Vídeo: ${exercise.name}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Descrição do exercício */}
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {exercise.description}
              </p>
            </div>

            {/* Badges com informações do exercício */}
            {type === 'main' && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Badge variant="outline" className="text-xs">{exercise.sets} séries</Badge>
                <Badge variant="outline" className="text-xs">{exercise.reps} reps</Badge>
                <Badge variant="outline" className="text-xs">Descanso: {exercise.rest}</Badge>
                <Badge variant="secondary" className="text-xs">{exercise.calories} kcal</Badge>
              </div>
            )}

            {type === 'mobility' && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Badge variant="outline" className="text-xs">{exercise.duration}</Badge>
              </div>
            )}

            {type === 'cardio' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge variant="outline" className="text-xs">Sugestão: {exercise.duration}</Badge>
                  {exercise.intensity && (
                    <Badge variant="secondary" className="text-xs">Intensidade: {exercise.intensity}</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Inputs de peso ou tempo de cardio */}
            <div className="flex flex-wrap gap-3">
              {type === 'cardio' && (
                <div className="space-y-1 flex-1 min-w-[140px]">
                  <Label htmlFor={`cardio-time-${exerciseId}`} className="text-xs">
                    Quanto tempo fez? (min)
                  </Label>
                  <Input
                    id={`cardio-time-${exerciseId}`}
                    type="number"
                    placeholder="Ex: 15"
                    value={cardioTimes[exercise.name] || ''}
                    onChange={(e) => handleCardioTimeChange(exercise.name, parseFloat(e.target.value) || 0)}
                    className="w-full h-8 text-sm"
                    step="1"
                    min="0"
                  />
                </div>
              )}

              {type === 'main' && (
                <div className="space-y-1 flex-1 min-w-[140px]">
                  <Label htmlFor={`weight-${exerciseId}`} className="text-xs">
                    Peso usado (kg) - opcional
                  </Label>
                  <Input
                    id={`weight-${exerciseId}`}
                    type="number"
                    placeholder="0.0"
                    value={exerciseWeights[exercise.name] || ''}
                    onChange={(e) => handleWeightChange(exercise.name, parseFloat(e.target.value) || 0)}
                    className="w-full h-8 text-sm"
                    step="0.5"
                  />
                </div>
              )}
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
              <Target className="w-5 h-5 mx-auto mb-1 text-[var(--lilac)]" />
              <p className="text-lg font-bold">{Math.round(progressPercentage)}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Completo</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Exercícios */}
        <Card>
          <CardContent className="p-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className={`grid w-full ${workout.workout_plan.mobility_exercises && workout.workout_plan.mobility_exercises.length > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {workout.workout_plan.mobility_exercises && workout.workout_plan.mobility_exercises.length > 0 && (
                  <TabsTrigger value="mobility" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Mobilidade
                  </TabsTrigger>
                )}
                <TabsTrigger value="main" className="text-xs">
                  <Dumbbell className="w-3 h-3 mr-1" />
                  Principal
                </TabsTrigger>
                <TabsTrigger value="cardio" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Cardio
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100vh-400px)] mt-4">
                {workout.workout_plan.mobility_exercises && workout.workout_plan.mobility_exercises.length > 0 && (
                  <TabsContent value="mobility" className="space-y-3 mt-0">
                    {workout.workout_plan.mobility_exercises.map((exercise) =>
                      renderExerciseCard(exercise, 'mobility', Zap)
                    )}
                  </TabsContent>
                )}

                <TabsContent value="main" className="space-y-3 mt-0">
                  {workout.workout_plan.main_exercises.map((exercise) =>
                    renderExerciseCard(exercise, 'main', Dumbbell)
                  )}
                </TabsContent>

                <TabsContent value="cardio" className="space-y-3 mt-0">
                  {workout.cardio_importance && (
                    <Alert className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 mb-4">
                      <Heart className="w-4 h-4 text-red-500" />
                      <AlertDescription className="text-sm">
                        <strong>💪 Importância do Cardio:</strong> {workout.cardio_importance}
                      </AlertDescription>
                    </Alert>
                  )}
                  {workout.workout_plan.cardio.map((exercise) =>
                    renderExerciseCard(exercise, 'cardio', Heart)
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
