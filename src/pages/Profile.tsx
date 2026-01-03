import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from 'next-themes'
import { useUser } from '@/contexts/UserContext'
import { getLifePhaseLabel } from '@/utils/workoutAdaptations'
import {
  User,
  Calendar,
  Target,
  Activity,
  Bell,
  Moon,
  Sun,
  Lock,
  LogOut,
  Camera,
  Save,
  RefreshCw,
  Ruler,
  Plus,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react'

interface Measurement {
  id: string
  date: string
  weight: number
  chest?: number
  waist?: number
  hips?: number
  arms?: number
  thighs?: number
  calves?: number
}

export default function Profile() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const { userProfile, clearUserProfile } = useUser()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [workoutReminders, setWorkoutReminders] = useState(true)
  const [mealReminders, setMealReminders] = useState(true)
  const [waterReminders, setWaterReminders] = useState(true)

  // Measurements state
  const [measurements, setMeasurements] = useState<Measurement[]>([
    {
      id: '1',
      date: '2024-12-01',
      weight: 75.5,
      chest: 95,
      waist: 78,
      hips: 102,
      arms: 32,
      thighs: 58,
      calves: 37
    },
    {
      id: '2',
      date: '2024-12-15',
      weight: 74.2,
      chest: 94,
      waist: 76,
      hips: 100,
      arms: 31.5,
      thighs: 57,
      calves: 36.5
    },
    {
      id: '3',
      date: '2025-01-01',
      weight: 73.0,
      chest: 93,
      waist: 74,
      hips: 99,
      arms: 31,
      thighs: 56,
      calves: 36
    }
  ])

  const [newMeasurement, setNewMeasurement] = useState<Partial<Measurement>>({
    date: new Date().toISOString().split('T')[0],
    weight: userProfile?.weight || 0
  })

  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false)

  const handleSaveProfile = () => {
    toast({
      title: "Perfil Atualizado! ✨",
      description: "Suas informações foram salvas com sucesso"
    })
  }

  const handleSaveSettings = () => {
    toast({
      title: "Configurações Salvas! ⚙️",
      description: "Suas preferências foram atualizadas"
    })
  }

  const handleAddMeasurement = () => {
    if (!newMeasurement.weight) {
      toast({
        title: "Peso obrigatório",
        description: "Por favor, insira pelo menos o peso",
        variant: "destructive"
      })
      return
    }

    const measurement: Measurement = {
      id: Date.now().toString(),
      date: newMeasurement.date || new Date().toISOString().split('T')[0],
      weight: newMeasurement.weight,
      chest: newMeasurement.chest,
      waist: newMeasurement.waist,
      hips: newMeasurement.hips,
      arms: newMeasurement.arms,
      thighs: newMeasurement.thighs,
      calves: newMeasurement.calves
    }

    setMeasurements([...measurements, measurement].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ))

    setNewMeasurement({
      date: new Date().toISOString().split('T')[0],
      weight: userProfile?.weight || 0
    })

    setIsAddingMeasurement(false)

    toast({
      title: "Medida adicionada!",
      description: "Suas medidas foram registradas com sucesso"
    })
  }

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id))
    toast({
      title: "Medida removida",
      description: "O registro foi excluído"
    })
  }

  const calculateDifference = (field: keyof Measurement) => {
    if (measurements.length < 2) return null
    const latest = measurements[0]
    const previous = measurements[1]

    const latestValue = latest[field] as number
    const previousValue = previous[field] as number

    if (!latestValue || !previousValue) return null

    return latestValue - previousValue
  }

  const formatDifference = (diff: number | null) => {
    if (diff === null) return null
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff.toFixed(1)}`
  }

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-[rgb(176,235,229)] via-white to-[rgb(216,191,228)] rounded-3xl p-6 shadow-xl border border-[rgb(231,228,225)]">
        <h2 className="text-3xl font-heading text-[rgb(51,51,51)]">
          Meu Perfil
        </h2>
        <p className="text-sm text-[var(--warm-gray)] mt-1">
          Gerencie suas informações e preferências
        </p>
      </div>

      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-[rgb(176,235,229)] via-white to-[rgb(216,191,228)] border-2 border-[var(--tiffany)] shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src="" alt="Perfil" />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-[var(--tiffany)] to-[var(--lilac)] text-white">
                  MJ
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-[var(--coral)] hover:bg-[rgb(255,139,128)] shadow-md"
                onClick={() => {
                  toast({
                    title: "Foto de Perfil",
                    description: "Selecione uma nova foto para seu perfil"
                  })
                }}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <h3 className="text-2xl font-heading text-[rgb(51,51,51)] mb-1">{userProfile?.name || 'Usuária'}</h3>
            <p className="text-[var(--warm-gray)] mb-2">{userProfile?.age} anos</p>
            {userProfile && (
              <p className="text-sm font-medium text-[var(--lilac)] mb-4">
                {getLifePhaseLabel(userProfile.lifePhase)}
              </p>
            )}
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[var(--tiffany)]">34</p>
                <p className="text-xs text-[var(--warm-gray)]">Treinos</p>
              </div>
              <div className="w-px bg-[var(--warm-gray-light)]" />
              <div>
                <p className="text-2xl font-bold text-[var(--lilac)]">23</p>
                <p className="text-xs text-[var(--warm-gray)]">Dias Ativos</p>
              </div>
              <div className="w-px bg-[var(--warm-gray-light)]" />
              <div>
                <p className="text-2xl font-bold text-[var(--coral)]">
                  {userProfile ? (userProfile.weight - userProfile.goalWeight).toFixed(1) : '0'}kg
                </p>
                <p className="text-xs text-[var(--warm-gray)]">Restantes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Pessoal</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="measurements">Medidas</TabsTrigger>
          <TabsTrigger value="settings">Config.</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4 mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <User className="w-5 h-5 text-[var(--tiffany)]" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-[var(--warm-gray)]" />
                  <Input id="name" defaultValue={userProfile?.name} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-[var(--warm-gray)]" />
                  <Input id="age" type="number" defaultValue={userProfile?.age} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lifePhase">Fase da Vida</Label>
                <div className="p-3 bg-[var(--lilac-light)] rounded-2xl">
                  <p className="text-sm font-medium">
                    {userProfile && getLifePhaseLabel(userProfile.lifePhase)}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  clearUserProfile()
                  navigate('/onboarding')
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refazer Quiz Inicial
              </Button>

              <Button
                className="w-full bg-[var(--tiffany)] hover:bg-[var(--tiffany-dark)] text-white font-heading-medium rounded-2xl py-6 shadow-md"
                onClick={handleSaveProfile}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4 mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Target className="w-5 h-5 text-[var(--coral)]" />
                Metas e Objetivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-weight">Peso Atual (kg)</Label>
                <Input id="current-weight" type="number" defaultValue={userProfile?.weight} step="0.1" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-weight">Meta de Peso (kg)</Label>
                <Input id="goal-weight" type="number" defaultValue={userProfile?.goalWeight} step="0.1" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input id="height" type="number" defaultValue={userProfile?.height} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-calories">Meta de Calorias Diárias</Label>
                <Input id="daily-calories" type="number" defaultValue="1800" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="water-goal">Meta de Água Diária (L)</Label>
                <Input id="water-goal" type="number" defaultValue="2.5" step="0.1" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workout-frequency">Frequência de Treino (dias/semana)</Label>
                <Input id="workout-frequency" type="number" defaultValue={userProfile?.exerciseFrequency} min="1" max="7" />
              </div>

              <Button
                className="w-full bg-[var(--coral)] hover:bg-[rgb(255,139,128)] text-white font-heading-medium rounded-2xl py-6 shadow-md"
                onClick={handleSaveProfile}
              >
                <Save className="w-4 h-4 mr-2" />
                Atualizar Metas
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[var(--tiffany-light)] to-white border-2 border-[var(--tiffany)] shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-[var(--tiffany-dark)] mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Nível de Atividade: Moderado</h4>
                  <p className="text-sm text-[var(--warm-gray)]">
                    Baseado na sua frequência de treino de 5 dias por semana
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-4 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-lg bg-gradient-to-br from-[var(--tiffany-light)] to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--warm-gray)] mb-1">Peso Atual</p>
                    <p className="text-2xl font-bold text-[var(--tiffany-dark)]">
                      {measurements.length > 0 ? `${measurements[0].weight} kg` : '-'}
                    </p>
                    {calculateDifference('weight') !== null && (
                      <p className={`text-xs flex items-center gap-1 mt-1 ${
                        calculateDifference('weight')! < 0 ? 'text-green-600' : 'text-[var(--coral)]'
                      }`}>
                        {calculateDifference('weight')! < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {formatDifference(calculateDifference('weight'))} kg
                      </p>
                    )}
                  </div>
                  <Ruler className="w-8 h-8 text-[var(--tiffany)]" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-gradient-to-br from-[var(--lilac-light)] to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--warm-gray)] mb-1">Registros</p>
                    <p className="text-2xl font-bold text-[var(--lilac-dark)]">
                      {measurements.length}
                    </p>
                    <p className="text-xs text-[var(--warm-gray)] mt-1">
                      Medidas salvas
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-[var(--lilac)]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Measurement Button */}
          <Dialog open={isAddingMeasurement} onOpenChange={setIsAddingMeasurement}>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-[var(--tiffany)] hover:bg-[var(--tiffany-dark)] text-white font-heading-medium rounded-2xl py-6 shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Nova Medida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-heading">
                  <Ruler className="w-5 h-5 text-[var(--tiffany)]" />
                  Nova Medida
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="measure-date">Data</Label>
                  <Input
                    id="measure-date"
                    type="date"
                    value={newMeasurement.date}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="measure-weight">Peso (kg) *</Label>
                  <Input
                    id="measure-weight"
                    type="number"
                    step="0.1"
                    value={newMeasurement.weight || ''}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: parseFloat(e.target.value) })}
                    placeholder="Ex: 70.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="measure-chest">Peito (cm)</Label>
                    <Input
                      id="measure-chest"
                      type="number"
                      step="0.1"
                      value={newMeasurement.chest || ''}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: parseFloat(e.target.value) })}
                      placeholder="Ex: 95"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measure-waist">Cintura (cm)</Label>
                    <Input
                      id="measure-waist"
                      type="number"
                      step="0.1"
                      value={newMeasurement.waist || ''}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: parseFloat(e.target.value) })}
                      placeholder="Ex: 75"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measure-hips">Quadril (cm)</Label>
                    <Input
                      id="measure-hips"
                      type="number"
                      step="0.1"
                      value={newMeasurement.hips || ''}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, hips: parseFloat(e.target.value) })}
                      placeholder="Ex: 100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measure-arms">Braços (cm)</Label>
                    <Input
                      id="measure-arms"
                      type="number"
                      step="0.1"
                      value={newMeasurement.arms || ''}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, arms: parseFloat(e.target.value) })}
                      placeholder="Ex: 32"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measure-thighs">Coxas (cm)</Label>
                    <Input
                      id="measure-thighs"
                      type="number"
                      step="0.1"
                      value={newMeasurement.thighs || ''}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, thighs: parseFloat(e.target.value) })}
                      placeholder="Ex: 58"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measure-calves">Panturrilha (cm)</Label>
                    <Input
                      id="measure-calves"
                      type="number"
                      step="0.1"
                      value={newMeasurement.calves || ''}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, calves: parseFloat(e.target.value) })}
                      placeholder="Ex: 37"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddingMeasurement(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-[var(--tiffany)] hover:bg-[var(--tiffany-dark)] text-white"
                    onClick={handleAddMeasurement}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Measurements History */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Activity className="w-5 h-5 text-[var(--tiffany)]" />
                Histórico de Medidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {measurements.length === 0 ? (
                <div className="text-center py-8 text-[var(--warm-gray)]">
                  <Ruler className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma medida registrada ainda</p>
                  <p className="text-sm mt-1">Adicione sua primeira medida para começar a acompanhar sua evolução</p>
                </div>
              ) : (
                measurements.map((measure, index) => (
                  <Card key={measure.id} className="bg-gradient-to-br from-[var(--tiffany-light)] to-white border border-[var(--tiffany)]">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-[rgb(51,51,51)]">
                            {new Date(measure.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          {index === 0 && (
                            <span className="text-xs bg-[var(--tiffany)] text-white px-2 py-0.5 rounded-full">
                              Mais recente
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[var(--coral)] hover:text-[rgb(255,139,128)] hover:bg-[rgb(255,245,240)]"
                          onClick={() => handleDeleteMeasurement(measure.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-[var(--warm-gray)] mb-0.5">Peso</p>
                          <p className="text-lg font-bold text-[var(--tiffany-dark)]">{measure.weight} kg</p>
                        </div>
                        {measure.chest && (
                          <div>
                            <p className="text-xs text-[var(--warm-gray)] mb-0.5">Peito</p>
                            <p className="text-lg font-bold text-[rgb(51,51,51)]">{measure.chest} cm</p>
                          </div>
                        )}
                        {measure.waist && (
                          <div>
                            <p className="text-xs text-[var(--warm-gray)] mb-0.5">Cintura</p>
                            <p className="text-lg font-bold text-[rgb(51,51,51)]">{measure.waist} cm</p>
                          </div>
                        )}
                        {measure.hips && (
                          <div>
                            <p className="text-xs text-[var(--warm-gray)] mb-0.5">Quadril</p>
                            <p className="text-lg font-bold text-[rgb(51,51,51)]">{measure.hips} cm</p>
                          </div>
                        )}
                        {measure.arms && (
                          <div>
                            <p className="text-xs text-[var(--warm-gray)] mb-0.5">Braços</p>
                            <p className="text-lg font-bold text-[rgb(51,51,51)]">{measure.arms} cm</p>
                          </div>
                        )}
                        {measure.thighs && (
                          <div>
                            <p className="text-xs text-[var(--warm-gray)] mb-0.5">Coxas</p>
                            <p className="text-lg font-bold text-[rgb(51,51,51)]">{measure.thighs} cm</p>
                          </div>
                        )}
                        {measure.calves && (
                          <div>
                            <p className="text-xs text-[var(--warm-gray)] mb-0.5">Panturrilha</p>
                            <p className="text-lg font-bold text-[rgb(51,51,51)]">{measure.calves} cm</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          {measurements.length >= 2 && (
            <Card className="shadow-lg bg-gradient-to-br from-[var(--lilac-light)] to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  Progresso (últimas 2 medidas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--warm-gray)] mb-1">Peso</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold">
                        {formatDifference(calculateDifference('weight'))} kg
                      </p>
                      {calculateDifference('weight')! < 0 && (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      )}
                      {calculateDifference('weight')! > 0 && (
                        <TrendingUp className="w-4 h-4 text-[var(--coral)]" />
                      )}
                    </div>
                  </div>

                  {measurements[0].waist && measurements[1].waist && (
                    <div>
                      <p className="text-sm text-[var(--warm-gray)] mb-1">Cintura</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold">
                          {formatDifference(calculateDifference('waist'))} cm
                        </p>
                        {calculateDifference('waist')! < 0 && (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        )}
                        {calculateDifference('waist')! > 0 && (
                          <TrendingUp className="w-4 h-4 text-[var(--coral)]" />
                        )}
                      </div>
                    </div>
                  )}

                  {measurements[0].hips && measurements[1].hips && (
                    <div>
                      <p className="text-sm text-[var(--warm-gray)] mb-1">Quadril</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold">
                          {formatDifference(calculateDifference('hips'))} cm
                        </p>
                        {calculateDifference('hips')! < 0 && (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        )}
                        {calculateDifference('hips')! > 0 && (
                          <TrendingUp className="w-4 h-4 text-[var(--coral)]" />
                        )}
                      </div>
                    </div>
                  )}

                  {measurements[0].arms && measurements[1].arms && (
                    <div>
                      <p className="text-sm text-[var(--warm-gray)] mb-1">Braços</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold">
                          {formatDifference(calculateDifference('arms'))} cm
                        </p>
                        {calculateDifference('arms')! < 0 && (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        )}
                        {calculateDifference('arms')! > 0 && (
                          <TrendingUp className="w-4 h-4 text-[var(--coral)]" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Bell className="w-5 h-5 text-[var(--tiffany)]" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-[var(--warm-gray)]">Receba notificações no dispositivo</p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lembrete de Treino</Label>
                  <p className="text-sm text-[var(--warm-gray)]">Notificação diária às 18h</p>
                </div>
                <Switch
                  checked={workoutReminders}
                  onCheckedChange={setWorkoutReminders}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lembrete de Refeições</Label>
                  <p className="text-sm text-[var(--warm-gray)]">Notificações nos horários das refeições</p>
                </div>
                <Switch
                  checked={mealReminders}
                  onCheckedChange={setMealReminders}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lembrete de Hidratação</Label>
                  <p className="text-sm text-[var(--warm-gray)]">Notificação a cada 2 horas</p>
                </div>
                <Switch
                  checked={waterReminders}
                  onCheckedChange={setWaterReminders}
                  disabled={!notificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-[var(--lilac)]" />
                ) : (
                  <Sun className="w-5 h-5 text-[var(--yellow-soft)]" />
                )}
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-[var(--warm-gray)]">Ativar tema escuro</p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Lock className="w-5 h-5 text-[var(--coral)]" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start text-[var(--coral)] hover:text-[rgb(255,139,128)] hover:bg-[rgb(255,245,240)]">
                <LogOut className="w-4 h-4 mr-2" />
                Sair da Conta
              </Button>
            </CardContent>
          </Card>

          <Button
            className="w-full bg-[var(--lilac)] hover:bg-[rgb(166,135,181)] text-white font-heading-medium rounded-2xl py-6 shadow-md"
            onClick={handleSaveSettings}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </TabsContent>
      </Tabs>

      {/* App Info */}
      <Card className="shadow-lg">
        <CardContent className="pt-6 text-center text-sm text-[var(--warm-gray)]">
          <p className="mb-1">Elas Fit - Fitness Adaptado Para Você</p>
          <p>Versão 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  )
}
