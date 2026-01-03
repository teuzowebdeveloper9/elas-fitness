import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Flame, Droplets, Heart, TrendingUp, Calendar, Clock, Activity, Dumbbell, Apple, Ruler } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/UserContext'
import { useEffect, useState } from 'react'
import { FoxMascot, useFoxStage } from '@/components/mascot/fox-mascot'

export default function Home() {
  const { userProfile } = useUser()
  const navigate = useNavigate()
  const [completedWorkouts] = useState(0) // TODO: Conectar com dados reais
  const [daysConsistent] = useState(0) // TODO: Conectar com dados reais
  const foxStage = useFoxStage(completedWorkouts, daysConsistent)

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

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
      {/* Welcome Section - Nova identidade visual com mascote */}
      <div className="relative bg-gradient-to-br from-[rgb(176,235,229)] via-white to-[rgb(216,191,228)] rounded-3xl p-6 shadow-xl border border-[rgb(231,228,225)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(129,216,208)] opacity-10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[rgb(186,155,201)] opacity-10 rounded-full -ml-12 -mb-12" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-[var(--warm-gray)] font-medium capitalize">{today}</p>
              <h2 className="text-3xl font-heading text-[rgb(51,51,51)] mt-1">
                {getGreeting()}, {userProfile?.name || 'Linda'}!
              </h2>
            </div>

            {/* Mascote */}
            <div className="flex-shrink-0">
              <FoxMascot stage={foxStage} size="medium" />
            </div>
          </div>

          {/* Mensagem motivacional da mascote */}
          <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[rgb(231,228,225)]">
            <p className="text-sm text-[rgb(51,51,51)] font-heading-medium text-center">
              {foxStage === 'starting' && 'Vamos juntas nessa jornada! 💚'}
              {foxStage === 'progressing' && 'Olha só como você está evoluindo! ✨'}
              {foxStage === 'active' && 'Que constância incrível! 🌟'}
              {foxStage === 'strong' && 'Você está imparável! 🔥'}
              {foxStage === 'champion' && 'Campeã absoluta! 👑'}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Card - Apenas se tiver tracking disponível */}
      {trackingLink && (
        <Link to={trackingLink.to}>
          <Card className="border-2 border-[rgb(186,155,201)] hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[rgb(216,191,228)] rounded-2xl">
                  <Activity className="w-6 h-6 text-[rgb(186,155,201)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-[rgb(51,51,51)]">{trackingLink.label}</h3>
                  <p className="text-sm text-[rgb(115,107,102)]">{trackingLink.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick Stats - Nova paleta */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-[rgb(255,240,235)] to-[rgb(255,230,225)] border-[rgb(255,159,148)] border-opacity-30 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[rgb(255,159,148)] rounded-2xl shadow-md">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(51,51,51)]">1.245</p>
                <p className="text-xs text-[rgb(115,107,102)]">Calorias queimadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[rgb(220,245,243)] to-[rgb(200,240,237)] border-[rgb(129,216,208)] border-opacity-30 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[rgb(129,216,208)] rounded-2xl shadow-md">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(51,51,51)]">1.8L</p>
                <p className="text-xs text-[rgb(115,107,102)]">
                  Meta: {userProfile?.waterGoal ? `${userProfile.waterGoal}L` : '2.5L'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seu Foco Hoje - Simplificado e direto */}
      <Card className="border-2 border-[rgb(129,216,208)] shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Heart className="w-5 h-5 text-[rgb(255,159,148)]" />
            Seu foco hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Treino</span>
              <span className="text-sm text-[rgb(115,107,102)]">0%</span>
            </div>
            <Progress value={0} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Hidratação</span>
              <span className="text-sm text-[rgb(115,107,102)]">1.8L / {userProfile?.waterGoal ? `${userProfile.waterGoal}L` : '2.5L'}</span>
            </div>
            <Progress value={userProfile?.waterGoal ? Math.round((1.8 / userProfile.waterGoal) * 100) : 72} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Today's Workout - Nova identidade */}
      <Card className="border-2 border-[rgb(186,155,201)] shadow-lg bg-gradient-to-br from-white to-[rgb(245,240,248)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-heading">
              <Calendar className="w-5 h-5 text-[rgb(186,155,201)]" />
              Treino de Hoje
            </CardTitle>
            <Badge className="bg-[rgb(186,155,201)] text-white hover:bg-[rgb(166,135,181)] font-heading-medium">Pernas & Glúteos</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[rgb(231,228,225)] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[rgb(216,191,228)] rounded-xl">
                <Clock className="w-5 h-5 text-[rgb(186,155,201)]" />
              </div>
              <div>
                <p className="font-medium text-[rgb(51,51,51)]">45 minutos</p>
                <p className="text-sm text-[rgb(115,107,102)]">8 exercícios</p>
              </div>
            </div>
          </div>
          <Link to="/workouts">
            <Button className="w-full bg-[rgb(255,159,148)] hover:bg-[rgb(255,139,128)] text-white font-heading-medium py-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              Começar agora
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Weekly Progress - Nova identidade */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <TrendingUp className="w-5 h-5 text-[rgb(129,216,208)]" />
            Sua constância
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
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-[rgb(129,216,208)] text-white shadow-md'
                        : isToday
                        ? 'bg-[rgb(255,159,148)] text-white ring-2 ring-[rgb(255,159,148)] ring-opacity-30 shadow-md'
                        : 'bg-[rgb(231,228,225)] text-[rgb(115,107,102)]'
                    }`}
                  >
                    {isCompleted ? '✓' : day.charAt(0)}
                  </div>
                  <span className="text-xs text-[rgb(115,107,102)] font-medium">{day}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Simplificado */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/workouts">
          <Card className="hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-[rgb(240,248,247)] border-[rgb(129,216,208)] border-opacity-40">
            <CardContent className="pt-6 pb-4 text-center">
              <div className="inline-flex p-3 bg-[rgb(129,216,208)] rounded-2xl mb-2 shadow-md">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading-medium text-sm text-[rgb(51,51,51)]">Treinos</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/diet">
          <Card className="hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-[rgb(245,243,240)] border-[rgb(186,155,201)] border-opacity-40">
            <CardContent className="pt-6 pb-4 text-center">
              <div className="inline-flex p-3 bg-[rgb(186,155,201)] rounded-2xl mb-2 shadow-md">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading-medium text-sm text-[rgb(51,51,51)]">Dieta</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/progress">
          <Card className="hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-[rgb(255,245,240)] border-[rgb(255,159,148)] border-opacity-40">
            <CardContent className="pt-6 pb-4 text-center">
              <div className="inline-flex p-3 bg-[rgb(255,159,148)] rounded-2xl mb-2 shadow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading-medium text-sm text-[rgb(51,51,51)]">Progresso</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/body-measurements">
          <Card className="hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-[rgb(240,248,255)] border-[rgb(176,235,229)] border-opacity-40">
            <CardContent className="pt-6 pb-4 text-center">
              <div className="inline-flex p-3 bg-[rgb(176,235,229)] rounded-2xl mb-2 shadow-md">
                <Ruler className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading-medium text-sm text-[rgb(51,51,51)]">Medidas</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
