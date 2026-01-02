import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Clock, Dumbbell, Home, Zap, Music,
  Heart, Sparkles, Loader2, ArrowDown, ArrowUp, ArrowUpDown,
  Target
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { generatePersonalizedWorkout, WorkoutGenerationData } from '@/lib/openai-real'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type WorkoutType = 'musculacao' | 'casa' | 'abdominal' | 'funcional' | 'danca'
type MobilityType = 'inferior' | 'superior' | 'completa' | 'none'
type MuscleGroup = 'gluteos' | 'pernas' | 'superior' | 'core' | 'bracos' | 'completo' | 'nenhum'

export default function WorkoutsNew() {
  const { userProfile } = useUser()
  const { toast } = useToast()

  const [availableTime, setAvailableTime] = useState(45)
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType>('musculacao')
  const [selectedMobility, setSelectedMobility] = useState<MobilityType>('none')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup>('nenhum')
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

  const muscleGroupOptions = [
    {
      id: 'nenhum' as MuscleGroup,
      name: 'Sem preferência',
      emoji: '✨',
      description: 'Deixar a IA decidir o melhor foco'
    },
    {
      id: 'gluteos' as MuscleGroup,
      name: 'Glúteos',
      emoji: '🍑',
      description: 'Foco em glúteos e posterior'
    },
    {
      id: 'pernas' as MuscleGroup,
      name: 'Pernas Completas',
      emoji: '🦵',
      description: 'Quadríceps, posterior e panturrilhas'
    },
    {
      id: 'superior' as MuscleGroup,
      name: 'Corpo Superior',
      emoji: '💪',
      description: 'Peito, costas e ombros'
    },
    {
      id: 'bracos' as MuscleGroup,
      name: 'Braços',
      emoji: '💪',
      description: 'Bíceps, tríceps e antebraços'
    },
    {
      id: 'core' as MuscleGroup,
      name: 'Core/Abdômen',
      emoji: '⚡',
      description: 'Abdômen, oblíquos e lombar'
    },
    {
      id: 'completo' as MuscleGroup,
      name: 'Corpo Completo',
      emoji: '🔥',
      description: 'Treino full body balanceado'
    }
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
          muscleGroup: selectedMuscleGroup,
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
      <div className="relative bg-gradient-to-br from-[rgb(176,235,229)] via-white to-[rgb(216,191,228)] rounded-3xl p-6 shadow-xl border border-[rgb(231,228,225)]">
        <h2 className="text-3xl font-heading text-[rgb(51,51,51)]">
          Meus Treinos
        </h2>
        <p className="text-sm text-[var(--warm-gray)] mt-1">
          Crie treinos personalizados com inteligência artificial
        </p>
      </div>

      {/* Configuração do Treino */}
      <Card className="border-2 border-[var(--tiffany)] shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Sparkles className="w-5 h-5 text-[var(--tiffany)]" />
            Configure seu Treino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tempo Disponível */}
          <div className="space-y-3">
            <Label htmlFor="time" className="text-base font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--tiffany)]" />
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
                  className={availableTime === time ? 'bg-[var(--tiffany-light)] border-[var(--tiffany)]' : ''}
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
                        ? 'ring-2 ring-[var(--tiffany)] bg-gradient-to-br from-[var(--tiffany)] to-[var(--tiffany-dark)] text-white shadow-xl'
                        : 'hover:bg-[var(--off-white)]'
                    }`}
                    onClick={() => setSelectedWorkoutType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-[var(--tiffany)]'}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{type.name}</h3>
                          <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-[var(--warm-gray)]'}`}>
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

          {/* Grupo Muscular */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--coral)]" />
              Qual grupo muscular quer treinar hoje?
            </Label>
            {workoutSuggestion && (
              <Alert className="bg-gradient-to-r from-[rgb(255,245,240)] to-[rgb(255,250,235)] border-[var(--coral)] border-opacity-30">
                <AlertDescription className="text-sm">
                  <strong>💡 Sugestão da IA:</strong> {workoutSuggestion}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {muscleGroupOptions.map((group) => {
                const isSelected = selectedMuscleGroup === group.id
                return (
                  <Card
                    key={group.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'ring-2 ring-[var(--coral)] bg-gradient-to-br from-[rgb(255,240,235)] to-[rgb(255,250,235)] shadow-lg'
                        : 'hover:bg-[var(--off-white)]'
                    }`}
                    onClick={() => setSelectedMuscleGroup(group.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-3xl mb-2">{group.emoji}</div>
                      <h4 className="font-medium text-sm mb-1">{group.name}</h4>
                      <p className="text-xs text-[var(--warm-gray)]">{group.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Mobilidade */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Adicionar mobilidade?</Label>
            <p className="text-sm text-[var(--warm-gray)]">
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
                        ? 'ring-2 ring-[var(--lilac)] bg-[var(--lilac-light)] shadow-lg'
                        : 'hover:bg-[var(--off-white)]'
                    }`}
                    onClick={() => setSelectedMobility(option.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className={`w-5 h-5 ${isSelected ? 'text-[var(--lilac)]' : 'text-[var(--warm-gray)]'}`} />}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{option.name}</h4>
                          <p className="text-xs text-[var(--warm-gray)]">{option.description}</p>
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
            className="w-full bg-[var(--coral)] hover:bg-[rgb(255,139,128)] text-white h-12 text-lg font-heading-medium rounded-2xl shadow-md hover:shadow-lg transition-all"
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
            <Alert className="bg-gradient-to-br from-[var(--tiffany-light)] to-white border-[var(--tiffany)]">
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
