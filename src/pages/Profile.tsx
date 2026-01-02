import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  RefreshCw
} from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const { userProfile, clearUserProfile } = useUser()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [workoutReminders, setWorkoutReminders] = useState(true)
  const [mealReminders, setMealReminders] = useState(true)
  const [waterReminders, setWaterReminders] = useState(true)

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Pessoal</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
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
