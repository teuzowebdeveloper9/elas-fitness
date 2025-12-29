import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { TrendingUp, TrendingDown, Minus, Dumbbell, Calendar, Award, Target } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ExerciseProgress {
  exercise_name: string
  current_weight: number
  previous_weight: number
  increase: number
  date: string
  total_sessions: number
}

interface ProgressStats {
  total_workouts: number
  workouts_this_week: number
  workouts_this_month: number
  days_until_progression: number
}

export default function WeightProgress() {
  const { toast } = useToast()
  const [exercises, setExercises] = useState<ExerciseProgress[]>([])
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar estatísticas gerais
      const { data: statsData, error: statsError } = await supabase
        .from('user_progress_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (statsError && statsError.code !== 'PGRST116') throw statsError

      // Calcular dias até progressão (30 dias de treinos consistentes)
      const daysUntilProgression = statsData ? Math.max(0, 30 - (statsData.workouts_this_month || 0)) : 30

      setStats({
        total_workouts: statsData?.total_workouts || 0,
        workouts_this_week: statsData?.workouts_this_week || 0,
        workouts_this_month: statsData?.workouts_this_month || 0,
        days_until_progression: daysUntilProgression
      })

      // Buscar evolução de peso por exercício
      const { data: progressData, error: progressError } = await supabase
        .from('exercise_weight_progression')
        .select('*')
        .eq('user_id', user.id)
        .order('exercise_name', { ascending: true })
        .order('created_at', { ascending: false })

      if (progressError) throw progressError

      // Agrupar por exercício e pegar apenas o mais recente de cada
      const groupedExercises = new Map<string, ExerciseProgress>()

      progressData?.forEach((row: any) => {
        if (!groupedExercises.has(row.exercise_name)) {
          groupedExercises.set(row.exercise_name, {
            exercise_name: row.exercise_name,
            current_weight: row.weight_kg,
            previous_weight: row.previous_weight || row.weight_kg,
            increase: row.weight_increase || 0,
            date: row.created_at,
            total_sessions: 1
          })
        }
      })

      setExercises(Array.from(groupedExercises.values()))
    } catch (error) {
      console.error('Erro ao buscar progresso:', error)
      toast({
        title: 'Erro ao carregar progresso',
        description: 'Não foi possível carregar seus dados de evolução',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (increase: number) => {
    if (increase > 0) return <TrendingUp className="w-5 h-5 text-green-500" />
    if (increase < 0) return <TrendingDown className="w-5 h-5 text-red-500" />
    return <Minus className="w-5 h-5 text-gray-400" />
  }

  const getProgressPercentage = () => {
    if (!stats) return 0
    return Math.min(100, (stats.workouts_this_month / 30) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-muted-foreground">Carregando progresso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
          Seu Progresso
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe sua evolução e veja como está progredindo
        </p>
      </div>

      {/* Estatísticas Gerais */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500 rounded-full">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_workouts}</p>
                  <p className="text-sm text-muted-foreground">Treinos Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.workouts_this_week}</p>
                  <p className="text-sm text-muted-foreground">Esta Semana</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-500 rounded-full">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.workouts_this_month}</p>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progresso para Próxima Evolução */}
      {stats && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-6 h-6" />
              Progresso para Próxima Evolução
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">
                  {stats.workouts_this_month} de 30 treinos no mês
                </p>
                <p className="text-sm font-medium">
                  {Math.round(getProgressPercentage())}%
                </p>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {stats.days_until_progression > 0 ? (
              <Alert className="bg-white/20 border-white/30 text-white">
                <AlertDescription>
                  <strong>Continue assim!</strong> Faltam {stats.days_until_progression} treinos para o próximo nível.
                  Quando você alcançar 30 treinos em um mês, seu programa será atualizado com novos exercícios e desafios!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-white border-white text-purple-900">
                <AlertDescription>
                  <strong>Parabéns! 🎉</strong> Você atingiu o objetivo mensal! Seu próximo treino será mais desafiador.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Evolução de Peso por Exercício */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Carga por Exercício</CardTitle>
        </CardHeader>
        <CardContent>
          {exercises.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {exercises.map((exercise, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getTrendIcon(exercise.increase)}
                        <div className="flex-1">
                          <h3 className="font-semibold">{exercise.exercise_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(exercise.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {exercise.previous_weight !== exercise.current_weight && (
                            <span className="text-sm text-gray-500 line-through">
                              {exercise.previous_weight.toFixed(1)} kg
                            </span>
                          )}
                          <span className="text-lg font-bold text-purple-600">
                            {exercise.current_weight.toFixed(1)} kg
                          </span>
                        </div>
                        {exercise.increase !== 0 && (
                          <Badge
                            variant={exercise.increase > 0 ? 'default' : 'destructive'}
                            className="mt-1"
                          >
                            {exercise.increase > 0 ? '+' : ''}{exercise.increase.toFixed(1)} kg
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Nenhum registro ainda</h3>
              <p className="text-muted-foreground">
                Comece a registrar os pesos dos seus exercícios durante os treinos para ver sua evolução aqui!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dicas de Progressão */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle>💡 Como Funciona a Progressão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <p className="text-sm">
              <strong>Registre suas cargas:</strong> Durante cada treino, anote o peso que você usou em cada exercício.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <p className="text-sm">
              <strong>Treine consistentemente:</strong> Complete 30 treinos em um mês para desbloquear a próxima fase.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <p className="text-sm">
              <strong>Evolua automaticamente:</strong> Ao atingir a meta mensal, seus treinos serão atualizados com novos desafios!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
