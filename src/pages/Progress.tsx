import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/lib/supabase'
import {
  Scale,
  Ruler,
  Award,
  Camera,
  CheckCircle2,
  Plus,
  TrendingDown,
  TrendingUp,
  Trophy,
  Star,
  Flame,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Componente de Confetti 🎉
function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    color: string
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'][Math.floor(Math.random() * 7)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => setParticles([]), 5000)
      return () => clearTimeout(timer)
    }
  }, [active])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}

// Modal para adicionar peso
function AddWeightModal({ 
  isOpen, 
  onClose, 
  onSave,
  currentWeight 
}: { 
  isOpen: boolean
  onClose: () => void
  onSave: (weight: number) => void
  currentWeight: number
}) {
  const [weight, setWeight] = useState(currentWeight.toString())

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading flex items-center gap-2">
            <Scale className="w-5 h-5 text-[var(--tiffany)]" />
            Registrar Peso
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-[var(--warm-gray)] mb-4">
              Qual seu peso hoje? 📊
            </p>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-center text-4xl font-bold h-20 border-2 border-[var(--tiffany)] focus:ring-[var(--tiffany)]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-[var(--warm-gray)]">
                kg
              </span>
            </div>
          </div>

          {/* Quick adjust buttons */}
          <div className="flex justify-center gap-2">
            {[-0.5, -0.1, +0.1, +0.5].map((delta) => (
              <Button
                key={delta}
                variant="outline"
                size="sm"
                onClick={() => setWeight((parseFloat(weight) + delta).toFixed(1))}
                className={delta < 0 ? 'text-green-600 border-green-300' : 'text-red-500 border-red-300'}
              >
                {delta > 0 ? '+' : ''}{delta}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => {
              onSave(parseFloat(weight))
              onClose()
            }}
            className="w-full bg-gradient-to-r from-[var(--tiffany)] to-[var(--coral)] hover:opacity-90 text-white font-heading-medium py-6 rounded-2xl text-lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Salvar Peso
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Modal para adicionar medidas
function AddMeasurementsModal({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  onSave: (measurements: any) => void
}) {
  const [measurements, setMeasurements] = useState({
    waist: '',
    hips: '',
    chest: '',
    arm: '',
    thigh: ''
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10">
          <CardTitle className="font-heading flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[var(--lilac)]" />
            Registrar Medidas
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--warm-gray)] text-center">
            Registre suas medidas em centímetros 📏
          </p>

          {[
            { key: 'waist', label: 'Cintura', emoji: '👗' },
            { key: 'hips', label: 'Quadril', emoji: '🍑' },
            { key: 'chest', label: 'Busto', emoji: '👙' },
            { key: 'arm', label: 'Braço', emoji: '💪' },
            { key: 'thigh', label: 'Coxa', emoji: '🦵' }
          ].map(({ key, label, emoji }) => (
            <div key={key} className="space-y-2">
              <Label className="flex items-center gap-2">
                <span>{emoji}</span> {label}
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  placeholder={`${label} em cm`}
                  value={measurements[key as keyof typeof measurements]}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, [key]: e.target.value }))}
                  className="pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--warm-gray)]">
                  cm
                </span>
              </div>
            </div>
          ))}

          <Button
            onClick={() => {
              onSave(measurements)
              onClose()
            }}
            className="w-full bg-gradient-to-r from-[var(--lilac)] to-[var(--coral)] hover:opacity-90 text-white font-heading-medium py-6 rounded-2xl text-lg mt-6"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Salvar Medidas
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Celebration Modal
function CelebrationModal({ 
  isOpen, 
  onClose,
  type,
  message 
}: { 
  isOpen: boolean
  onClose: () => void
  type: 'goal' | 'milestone'
  message: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200 text-center overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-1">
          <div className="bg-white p-6 rounded-t-lg">
            <div className="text-8xl mb-4 animate-bounce">
              {type === 'goal' ? '🏆' : '⭐'}
            </div>
            <h2 className="text-3xl font-heading text-[rgb(51,51,51)] mb-2">
              {type === 'goal' ? 'META ALCANÇADA!' : 'PARABÉNS!'}
            </h2>
            <p className="text-lg text-[var(--warm-gray)]">
              {message}
            </p>
          </div>
        </div>
        <CardContent className="pt-6">
          <div className="flex justify-center gap-2 mb-6">
            {['🎉', '💪', '✨', '🔥', '👏'].map((emoji, i) => (
              <span key={i} className="text-3xl animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                {emoji}
              </span>
            ))}
          </div>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-heading-medium py-6 rounded-2xl text-lg"
          >
            <Star className="w-5 h-5 mr-2" />
            Continuar minha jornada!
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Progress() {
  const { toast } = useToast()
  const { userProfile, updateUserProfile } = useUser()
  const [loading, setLoading] = useState(true)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')
  const [celebrationType, setCelebrationType] = useState<'goal' | 'milestone'>('milestone')
  const [weightHistory, setWeightHistory] = useState<Array<{ date: string; weight: number }>>([])
  const [measurementsHistory, setMeasurementsHistory] = useState<Array<any>>([])

  // Fetch weight history
  const fetchWeightHistory = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      if (data && data.length > 0) {
        setWeightHistory(data.map(m => ({
          date: format(new Date(m.created_at), 'dd/MM', { locale: ptBR }),
          weight: m.weight
        })))
        setMeasurementsHistory(data)
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
    }
  }, [])

  useEffect(() => {
    if (userProfile) {
      setLoading(false)
      fetchWeightHistory()
    }
  }, [userProfile, fetchWeightHistory])

  // Dados do usuário
  const currentWeight = weightHistory.length > 0 ? weightHistory[0].weight : (userProfile?.weight || 0)
  const startWeight = userProfile?.weight || 0
  const goalWeight = userProfile?.goalWeight || 0

  // Calcular progresso
  const isLosingWeight = goalWeight < startWeight
  const totalToLose = Math.abs(startWeight - goalWeight)
  const currentLost = isLosingWeight 
    ? Math.max(0, startWeight - currentWeight)
    : Math.max(0, currentWeight - startWeight)
  const progressPercentage = totalToLose > 0 ? Math.min(100, (currentLost / totalToLose) * 100) : 0
  const goalReached = progressPercentage >= 100

  // Salvar novo peso
  const handleSaveWeight = async (newWeight: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Inserir nova medida
      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          weight: newWeight,
          measurement_date: new Date().toISOString().split('T')[0]
        })

      if (error) throw error

      // Atualizar perfil
      await updateUserProfile({ weight: newWeight })

      // Verificar se atingiu a meta
      const newProgressPercentage = totalToLose > 0 
        ? Math.min(100, (Math.abs(startWeight - newWeight) / totalToLose) * 100) 
        : 0

      if (newProgressPercentage >= 100 && progressPercentage < 100) {
        // META ALCANÇADA! 🎉
        setShowConfetti(true)
        setCelebrationMessage(`Você alcançou sua meta de ${goalWeight}kg! Incrível conquista!`)
        setCelebrationType('goal')
        setShowCelebration(true)
      } else if (newWeight < currentWeight && isLosingWeight) {
        // Perdeu peso - pequena celebração
        const kgLost = (currentWeight - newWeight).toFixed(1)
        toast({
          title: `🎉 Mandou bem! -${kgLost}kg`,
          description: 'Continue assim, você está arrasando!'
        })

        // Milestone a cada 1kg perdido
        const prevLost = Math.floor(startWeight - currentWeight)
        const newLost = Math.floor(startWeight - newWeight)
        if (newLost > prevLost && newLost > 0) {
          setShowConfetti(true)
          setCelebrationMessage(`Você já perdeu ${newLost}kg! Continue firme!`)
          setCelebrationType('milestone')
          setShowCelebration(true)
        }
      }

      await fetchWeightHistory()

      toast({
        title: 'Peso registrado! ✅',
        description: `Novo peso: ${newWeight}kg`
      })
    } catch (error) {
      console.error('Erro ao salvar peso:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente',
        variant: 'destructive'
      })
    }
  }

  // Salvar medidas
  const handleSaveMeasurements = async (measurements: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          weight: currentWeight,
          waist: measurements.waist ? parseFloat(measurements.waist) : null,
          hips: measurements.hips ? parseFloat(measurements.hips) : null,
          chest: measurements.chest ? parseFloat(measurements.chest) : null,
          arm_right: measurements.arm ? parseFloat(measurements.arm) : null,
          thigh_right: measurements.thigh ? parseFloat(measurements.thigh) : null,
          measurement_date: new Date().toISOString().split('T')[0]
        })

      if (error) throw error

      await fetchWeightHistory()

      toast({
        title: 'Medidas registradas! 📏',
        description: 'Continue acompanhando sua evolução!'
      })
    } catch (error) {
      console.error('Erro ao salvar medidas:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tiffany)]"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Confetti */}
      <Confetti active={showConfetti} />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => {
          setShowCelebration(false)
          setShowConfetti(false)
        }}
        type={celebrationType}
        message={celebrationMessage}
      />

      {/* Weight Modal */}
      <AddWeightModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSave={handleSaveWeight}
        currentWeight={currentWeight}
      />

      {/* Measurements Modal */}
      <AddMeasurementsModal
        isOpen={showMeasurementsModal}
        onClose={() => setShowMeasurementsModal(false)}
        onSave={handleSaveMeasurements}
      />

      {/* Header */}
      <div className="relative bg-gradient-to-br from-[rgb(176,235,229)] via-white to-[rgb(216,191,228)] rounded-3xl p-6 shadow-xl border border-[rgb(231,228,225)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading text-[rgb(51,51,51)]">
              Meu Progresso
            </h2>
            <p className="text-sm text-[var(--warm-gray)] mt-1">
              Acompanhe sua evolução e conquistas
            </p>
          </div>
          {goalReached && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 animate-pulse">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Weight Progress Card - DESTAQUE */}
      <Card className={`shadow-xl overflow-hidden transition-all duration-500 ${
        goalReached 
          ? 'border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' 
          : 'border-2 border-[var(--tiffany)] bg-gradient-to-br from-[rgb(220,245,243)] to-white'
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between font-heading">
            <div className="flex items-center gap-2">
              <Scale className={`w-6 h-6 ${goalReached ? 'text-yellow-500' : 'text-[var(--tiffany)]'}`} />
              Progresso de Peso
            </div>
            {goalReached && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                <Trophy className="w-3 h-3 mr-1" /> META!
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Peso atual grande */}
          <div className="text-center py-4">
            <p className="text-sm text-[var(--warm-gray)] mb-2">Peso Atual</p>
            <div className="relative inline-block">
              <span className={`text-6xl font-bold ${
                goalReached ? 'text-yellow-500' : 'text-[var(--tiffany)]'
              }`}>
                {currentWeight}
              </span>
              <span className="text-2xl text-[var(--warm-gray)] ml-1">kg</span>
              {weightHistory.length > 1 && (
                <div className={`absolute -right-12 top-2 flex items-center gap-1 text-sm font-medium ${
                  currentWeight < weightHistory[1]?.weight ? 'text-green-500' : 'text-red-500'
                }`}>
                  {currentWeight < weightHistory[1]?.weight ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  {Math.abs(currentWeight - weightHistory[1]?.weight).toFixed(1)}
                </div>
              )}
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-[rgb(51,51,51)]">
                {startWeight}kg
              </span>
              <span className={`font-bold ${goalReached ? 'text-yellow-500' : 'text-[var(--tiffany)]'}`}>
                {progressPercentage.toFixed(1)}%
              </span>
              <span className="font-medium text-[rgb(51,51,51)]">
                {goalWeight}kg
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-1000 ease-out rounded-full ${
                  goalReached 
                    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500' 
                    : 'bg-gradient-to-r from-[var(--tiffany)] to-[var(--coral)]'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
              {/* Marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg border-2 border-[var(--tiffany)] flex items-center justify-center transition-all duration-1000"
                style={{ left: `calc(${progressPercentage}% - 12px)` }}
              >
                <Flame className="w-3 h-3 text-[var(--coral)]" />
              </div>
            </div>
            <p className="text-center text-sm text-[var(--warm-gray)]">
              {isLosingWeight 
                ? `Faltam ${Math.max(0, currentWeight - goalWeight).toFixed(1)}kg para a meta!`
                : `Faltam ${Math.max(0, goalWeight - currentWeight).toFixed(1)}kg para a meta!`
              }
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/80 rounded-2xl p-3 text-center shadow">
              <p className="text-xs text-[var(--warm-gray)]">Inicial</p>
              <p className="text-xl font-bold text-[rgb(51,51,51)]">{startWeight}kg</p>
            </div>
            <div className={`rounded-2xl p-3 text-center shadow ${
              currentLost > 0 ? 'bg-green-100' : 'bg-white/80'
            }`}>
              <p className="text-xs text-[var(--warm-gray)]">
                {isLosingWeight ? 'Perdido' : 'Ganho'}
              </p>
              <p className={`text-xl font-bold ${currentLost > 0 ? 'text-green-600' : 'text-[rgb(51,51,51)]'}`}>
                {currentLost.toFixed(1)}kg
              </p>
            </div>
            <div className="bg-white/80 rounded-2xl p-3 text-center shadow">
              <p className="text-xs text-[var(--warm-gray)]">Meta</p>
              <p className="text-xl font-bold text-[rgb(51,51,51)]">{goalWeight}kg</p>
            </div>
          </div>

          {/* Botão de registrar peso */}
          <Button
            onClick={() => setShowWeightModal(true)}
            className="w-full bg-gradient-to-r from-[var(--tiffany)] to-[var(--coral)] hover:opacity-90 text-white font-heading-medium py-6 rounded-2xl text-lg shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Registrar Novo Peso
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Peso Mini-Chart */}
      {weightHistory.length > 0 && (
        <Card className="border-2 border-[var(--lilac-light)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <TrendingDown className="w-5 h-5 text-[var(--lilac)]" />
              Histórico Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-24 gap-2">
              {weightHistory.slice(0, 7).reverse().map((entry, index) => {
                const maxWeight = Math.max(...weightHistory.map(e => e.weight))
                const minWeight = Math.min(...weightHistory.map(e => e.weight))
                const range = maxWeight - minWeight || 1
                const height = ((entry.weight - minWeight) / range) * 60 + 20

                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <span className="text-xs text-[var(--warm-gray)] mb-1">
                      {entry.weight}
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-[var(--tiffany)] to-[var(--lilac)] rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-[var(--warm-gray)] mt-1">
                      {entry.date}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medidas Corporais */}
      <Card className="border-2 border-[var(--coral-light)]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-heading">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[var(--coral)]" />
              Medidas Corporais
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMeasurementsModal(true)}
              className="border-[var(--coral)] text-[var(--coral)] hover:bg-[var(--coral)] hover:text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {measurementsHistory.length > 0 && measurementsHistory[0].waist ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Cintura', value: measurementsHistory[0].waist, emoji: '👗' },
                { label: 'Quadril', value: measurementsHistory[0].hips, emoji: '🍑' },
                { label: 'Busto', value: measurementsHistory[0].chest, emoji: '👙' },
                { label: 'Braço', value: measurementsHistory[0].arm_right, emoji: '💪' },
              ].filter(m => m.value).map((measurement, i) => (
                <div key={i} className="bg-gradient-to-br from-[var(--coral-light)] to-white p-4 rounded-2xl text-center">
                  <span className="text-2xl">{measurement.emoji}</span>
                  <p className="text-2xl font-bold text-[rgb(51,51,51)]">{measurement.value}cm</p>
                  <p className="text-xs text-[var(--warm-gray)]">{measurement.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ruler className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-[var(--warm-gray)] mb-4">
                Nenhuma medida registrada ainda
              </p>
              <Button
                variant="outline"
                onClick={() => setShowMeasurementsModal(true)}
                className="border-[var(--coral)] text-[var(--coral)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Medidas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conquistas */}
      <Card className="border-2 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Award className="w-5 h-5 text-yellow-500" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { title: '1kg', completed: currentLost >= 1, emoji: '🎯' },
              { title: '3kg', completed: currentLost >= 3, emoji: '💪' },
              { title: '5kg', completed: currentLost >= 5, emoji: '🔥' },
              { title: '10kg', completed: currentLost >= 10, emoji: '⭐' },
              { title: 'Meta!', completed: goalReached, emoji: '🏆' },
              { title: 'Streak', completed: weightHistory.length >= 7, emoji: '📊' },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                  achievement.completed
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400 shadow-lg scale-105'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <span className={`text-3xl ${achievement.completed ? 'animate-bounce' : 'grayscale'}`}>
                  {achievement.emoji}
                </span>
                <p className={`text-sm font-medium mt-2 ${
                  achievement.completed ? 'text-yellow-700' : 'text-gray-400'
                }`}>
                  {achievement.title}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fotos de Progresso */}
      <Card className="border-2 border-[var(--lilac-light)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Camera className="w-5 h-5 text-[var(--lilac)]" />
            Fotos de Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((photo) => (
              <div
                key={photo}
                className="aspect-square bg-gradient-to-br from-[var(--lilac-light)] to-white rounded-2xl flex items-center justify-center border-2 border-dashed border-[var(--lilac)]"
              >
                <Camera className="w-8 h-8 text-[var(--lilac)]" />
              </div>
            ))}
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[var(--lilac)] to-[var(--coral)] hover:opacity-90"
            onClick={() => {
              toast({
                title: "Em breve! 📸",
                description: "Funcionalidade de fotos chegando em breve!"
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
