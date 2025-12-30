import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Clock, Flame, Dumbbell, Home, Zap, Music,
  Heart, Sparkles, Loader2, ArrowDown, ArrowUp, ArrowUpDown
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { generatePersonalizedWorkout, WorkoutGenerationData } from '@/lib/openai-real'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type WorkoutType = 'musculacao' | 'casa' | 'abdominal' | 'funcional' | 'danca'
type MobilityType = 'inferior' | 'superior' | 'completa' | 'none'

export default function WorkoutsNew() {
  const { userProfile } = useUser()
  const { toast } = useToast()

  const [availableTime, setAvailableTime] = useState(45)
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType>('musculacao')
  const [selectedMobility, setSelectedMobility] = useState<MobilityType>('none')
  const [isGenerating, setIsGenerating] = useState(false)
  const [workoutSuggestion, setWorkoutSuggestion] = useState<string | null>(null)

  // Buscar sugestão de treino ao carregar
  useEffect(() => {
    async function fetchSuggestion() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { suggestWorkoutFocus } = await import('@/lib/workout-intelligence')
        const suggestion = await suggestWorkoutFocus(user.id)
        setWorkoutSuggestion(suggestion.reasoning)
      } catch (error) {
        console.error('Erro ao buscar sugestão:', error)
      }
    }
    fetchSuggestion()
  }, [])

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

  const navigate = useNavigate()

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

      toast({
        title: '✨ Treino gerado!',
        description: 'Abrindo sua sessão de treino...',
      })

      // Navegar para a página de treino ativo
      navigate('/active-workout', { state: { workout } })
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

          {workoutSuggestion && (
            <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20">
              <AlertDescription className="text-sm">
                <strong>💡 Sugestão Inteligente:</strong> {workoutSuggestion}
              </AlertDescription>
            </Alert>
          )}

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
    </div>
  )
}
