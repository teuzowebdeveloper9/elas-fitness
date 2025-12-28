import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Flame, Droplets, Heart, TrendingUp, Calendar, Clock, Activity } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/UserContext'
import { useEffect } from 'react'

export default function Home() {
  const { userProfile } = useUser()
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  // Detecta se precisa redirecionar para o tracking apropriado
  useEffect(() => {
    const checkTrackingSetup = () => {
      if (!userProfile) return

      // Se menstrua, verifica se já configurou o ciclo
      if (userProfile.lifePhase === 'menstrual') {
        const cycleData = localStorage.getItem('cycleData')
        if (!cycleData) {
          // Primeira vez - redireciona para configurar
          const hasVisited = localStorage.getItem('hasVisitedCycleTracking')
          if (!hasVisited) {
            localStorage.setItem('hasVisitedCycleTracking', 'true')
            navigate('/cycle-tracking')
          }
        }
      }

      // Se está em fase de menopausa, verifica se já configurou sintomas
      if (['pre-menopause', 'menopause', 'post-menopause'].includes(userProfile.lifePhase)) {
        const menopauseData = localStorage.getItem('menopauseData')
        if (!menopauseData) {
          const hasVisited = localStorage.getItem('hasVisitedMenopauseTracking')
          if (!hasVisited) {
            localStorage.setItem('hasVisitedMenopauseTracking', 'true')
            navigate('/menopause-tracking')
          }
        }
      }
    }

    // Delay para não redirecionar imediatamente
    const timer = setTimeout(checkTrackingSetup, 1000)
    return () => clearTimeout(timer)
  }, [userProfile, navigate])

  const getLifePhaseMessage = () => {
    if (!userProfile) return ''

    switch (userProfile.lifePhase) {
      case 'menstrual':
        return 'Treinos adaptados ao seu ciclo menstrual'
      case 'pre-menopause':
        return 'Treinos focados em equilíbrio hormonal'
      case 'menopause':
        return 'Treinos para fortalecer ossos e músculos'
      case 'post-menopause':
        return 'Treinos para manter vitalidade e saúde'
      default:
        return ''
    }
  }

  const getTrackingLink = () => {
    if (!userProfile) return null

    if (userProfile.lifePhase === 'menstrual') {
      return {
        to: '/cycle-tracking',
        label: 'Acompanhar Ciclo Menstrual',
        description: 'Registre sua menstruação e sentimentos'
      }
    }

    if (['pre-menopause', 'menopause', 'post-menopause'].includes(userProfile.lifePhase)) {
      return {
        to: '/menopause-tracking',
        label: 'Acompanhar Sintomas',
        description: 'Monitore seus sintomas e bem-estar'
      }
    }

    return null
  }

  const trackingLink = getTrackingLink()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Olá, {userProfile?.name || 'Linda'}! 💪</h2>
        <p className="text-pink-100 capitalize">{today}</p>
        <p className="mt-4 text-sm">{getLifePhaseMessage()}</p>
      </div>

      {/* Tracking Card - Apenas se tiver tracking disponível */}
      {trackingLink && (
        <Link to={trackingLink.to}>
          <Card className="border-2 border-pink-200 dark:border-pink-700 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                  <Activity className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{trackingLink.label}</h3>
                  <p className="text-sm text-muted-foreground">{trackingLink.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-full">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">1.245</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Calorias queimadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-full">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">1.8L</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Água consumida</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Metas de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Treino Completo</span>
              <span className="text-sm text-gray-500">75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Calorias Diárias</span>
              <span className="text-sm text-gray-500">1.245 / 1.800</span>
            </div>
            <Progress value={69} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Hidratação</span>
              <span className="text-sm text-gray-500">1.8L / 2.5L</span>
            </div>
            <Progress value={72} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Today's Workout */}
      <Card className="border-2 border-purple-200 dark:border-purple-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Treino de Hoje
            </CardTitle>
            <Badge className="bg-purple-500 hover:bg-purple-600">Pernas & Glúteos</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">Duração: 45 minutos</p>
                <p className="text-sm text-gray-500">8 exercícios</p>
              </div>
            </div>
          </div>
          <Link to="/workouts">
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              Iniciar Treino
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Progresso da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
              const isCompleted = index < 4
              const isToday = index === 3

              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isToday
                        ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : day.charAt(0)}
                  </div>
                  <span className="text-xs text-gray-500">{day}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/diet">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                <Flame className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium">Registrar Refeição</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/progress">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-medium">Ver Progresso</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
