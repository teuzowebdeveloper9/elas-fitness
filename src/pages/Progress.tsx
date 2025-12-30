import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/contexts/UserContext'
import {
  TrendingDown,
  Scale,
  Ruler,
  Target,
  Award,
  Calendar as CalendarIcon,
  Camera,
  ChevronRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

export default function Progress() {
  const { toast } = useToast()
  const { userProfile } = useUser()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento
    if (userProfile) {
      setLoading(false)
    }
  }, [userProfile])

  // Dados reais do usuário
  const currentWeight = userProfile?.weight || 0
  const startWeight = userProfile?.weight || 0 // Peso inicial = peso atual (começando agora)
  const goalWeight = userProfile?.goalWeight || 0
  const weightLost = 0 // Zero, pois está começando agora

  // Sem atividades ainda (começando do zero)
  const weeklyProgress = [
    { day: 'Seg', completed: false },
    { day: 'Ter', completed: false },
    { day: 'Qua', completed: false },
    { day: 'Qui', completed: false },
    { day: 'Sex', completed: false },
    { day: 'Sáb', completed: false },
    { day: 'Dom', completed: false },
  ]

  // Sem medidas ainda
  const measurements: any[] = []

  // Conquistas zeradas
  const achievements = [
    { title: 'Primeira Semana', description: 'Complete 7 dias seguidos', completed: false, progress: 0 },
    { title: '30 Dias Ativos', description: 'Treine por 30 dias', completed: false, progress: 0 },
    { title: 'Hidratação Master', description: '14 dias atingindo a meta de água', completed: false, progress: 0 },
    { title: 'Perda de Peso', description: 'Perca 5kg', completed: false, progress: 0 },
    { title: 'Força Total', description: 'Complete 50 treinos', completed: false, progress: 0 },
    { title: 'Nutrição Perfeita', description: '7 dias dentro das macros', completed: false, progress: 0 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
          Meu Progresso
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe sua evolução e conquistas
        </p>
      </div>

      {/* Weight Progress Overview */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600" />
            Progresso de Peso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peso Inicial</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{startWeight} kg</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peso Atual</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currentWeight} kg</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meta</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{goalWeight} kg</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progresso até a meta</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {((weightLost / (startWeight - goalWeight)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${(weightLost / (startWeight - goalWeight)) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-700 dark:text-blue-400">
              Você está começando sua jornada! Complete treinos e registre seu progresso.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Measurements History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-blue-600" />
            Histórico de Medidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length > 0 ? (
            <div className="space-y-3">
              {measurements.map((measurement: any, index: number) => {
                const isLatest = index === measurements.length - 1

                return (
                  <div
                    key={measurement.date}
                    className={`p-4 rounded-lg border-2 ${
                      isLatest
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{measurement.date}</span>
                      {isLatest && (
                        <Badge className="bg-blue-500 hover:bg-blue-600">Mais Recente</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peso</p>
                        <p className="text-lg font-bold">{measurement.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cintura</p>
                        <p className="text-lg font-bold">{measurement.waist} cm</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quadril</p>
                        <p className="text-lg font-bold">{measurement.hips} cm</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Coxa</p>
                        <p className="text-lg font-bold">{measurement.thigh} cm</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ruler className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma medida registrada</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Comece registrando suas medidas iniciais (peso, cintura, quadril, coxa) para acompanhar sua evolução!
              </p>
            </div>
          )}

          <Button
            className="w-full mt-4"
            variant="outline"
            onClick={() => {
              toast({
                title: "Em breve!",
                description: "A funcionalidade de adicionar medições estará disponível em breve"
              })
            }}
          >
            <Target className="w-4 h-4 mr-2" />
            Adicionar Nova Medição
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-orange-600" />
            Atividade Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-2 mb-4">
            {weeklyProgress.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-full h-12 rounded-lg flex items-center justify-center text-sm font-medium ${
                    day.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {day.completed ? <CheckCircle2 className="w-5 h-5" /> : day.day}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{day.day}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <p className="text-sm text-center text-gray-700 dark:text-gray-300">
              <span className="font-bold text-purple-600 dark:text-purple-400">0 de 7 dias</span> completados esta semana. Comece seu primeiro treino!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  achievement.completed
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  </div>
                  {achievement.completed ? (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 ml-2">
                      <Award className="w-3 h-3 mr-1" />
                      Completo
                    </Badge>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  )}
                </div>

                {!achievement.completed && achievement.progress !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                      <span className="font-medium">{achievement.progress}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${(achievement.progress / (achievement.title === 'Força Total' ? 50 : achievement.title === 'Perda de Peso' ? 5 : 30)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photo Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-600" />
            Fotos de Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((photo) => (
              <div
                key={photo}
                className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center border-2 border-dashed border-pink-300 dark:border-pink-700"
              >
                <Camera className="w-8 h-8 text-pink-400" />
              </div>
            ))}
          </div>
          <Button
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            onClick={() => {
              toast({
                title: "Adicionar Foto",
                description: "Registre seu progresso visual!"
              })
            }}
          >
            <Camera className="w-4 h-4 mr-2" />
            Adicionar Nova Foto
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
