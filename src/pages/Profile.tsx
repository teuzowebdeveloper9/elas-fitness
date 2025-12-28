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
  Mail,
  Phone,
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
  const { userProfile, updateUserProfile, clearUserProfile } = useUser()
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
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Meu Perfil
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas informações e preferências
        </p>
      </div>

      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-700">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage src="" alt="Perfil" />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                  MJ
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-pink-500 hover:bg-pink-600"
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
            <h3 className="text-2xl font-bold mb-1">{userProfile?.name || 'Usuária'}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{userProfile?.age} anos</p>
            {userProfile && (
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
                {getLifePhaseLabel(userProfile.lifePhase)}
              </p>
            )}
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">34</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Treinos</p>
              </div>
              <div className="w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">23</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Dias Ativos</p>
              </div>
              <div className="w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userProfile ? (userProfile.weight - userProfile.goalWeight).toFixed(1) : '0'}kg
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Restantes</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-pink-500" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input id="name" defaultValue={userProfile?.name} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input id="age" type="number" defaultValue={userProfile?.age} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lifePhase">Fase da Vida</Label>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
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
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
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
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                onClick={handleSaveProfile}
              >
                <Save className="w-4 h-4 mr-2" />
                Atualizar Metas
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Nível de Atividade: Moderado</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Baseado na sua frequência de treino de 5 dias por semana
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-gray-500">Receba notificações no dispositivo</p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lembrete de Treino</Label>
                  <p className="text-sm text-gray-500">Notificação diária às 18h</p>
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
                  <p className="text-sm text-gray-500">Notificações nos horários das refeições</p>
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
                  <p className="text-sm text-gray-500">Notificação a cada 2 horas</p>
                </div>
                <Switch
                  checked={waterReminders}
                  onCheckedChange={setWaterReminders}
                  disabled={!notificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-gray-500">Ativar tema escuro</p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="w-4 h-4 mr-2" />
                Sair da Conta
              </Button>
            </CardContent>
          </Card>

          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            onClick={handleSaveSettings}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </TabsContent>
      </Tabs>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6 text-center text-sm text-gray-500">
          <p className="mb-1">Elas Fit - Fitness Adaptado Para Você</p>
          <p>Versão 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  )
}
