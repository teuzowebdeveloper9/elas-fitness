import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Droplets, Pill, Bell, Plus, Trash2, Clock } from 'lucide-react'

interface Supplement {
  id: string
  name: string
  time: string
  frequency: string
  taken: boolean
}

interface CustomReminder {
  id: string
  title: string
  time: string
  days: string[]
  completed: boolean
}

export default function Routine() {
  const [waterGoal, setWaterGoal] = useState(2500) // ml
  const [waterIntake, setWaterIntake] = useState(0)
  const [supplements, setSupplements] = useState<Supplement[]>(() => {
    const stored = localStorage.getItem('supplements')
    return stored ? JSON.parse(stored) : []
  })
  const [reminders, setReminders] = useState<CustomReminder[]>(() => {
    const stored = localStorage.getItem('customReminders')
    return stored ? JSON.parse(stored) : []
  })
  const [newSupplement, setNewSupplement] = useState({ name: '', time: '', frequency: 'daily' })
  const [newReminder, setNewReminder] = useState({ title: '', time: '', days: [] as string[] })
  const [openSupplementDialog, setOpenSupplementDialog] = useState(false)
  const [openReminderDialog, setOpenReminderDialog] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('waterIntake')
    if (stored) {
      const data = JSON.parse(stored)
      const today = new Date().toDateString()
      if (data.date === today) {
        setWaterIntake(data.amount)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('supplements', JSON.stringify(supplements))
  }, [supplements])

  useEffect(() => {
    localStorage.setItem('customReminders', JSON.stringify(reminders))
  }, [reminders])

  const addWater = (amount: number) => {
    const newAmount = Math.min(waterIntake + amount, waterGoal)
    setWaterIntake(newAmount)
    localStorage.setItem('waterIntake', JSON.stringify({
      date: new Date().toDateString(),
      amount: newAmount
    }))
  }

  const addSupplement = () => {
    if (!newSupplement.name || !newSupplement.time) return

    const supplement: Supplement = {
      id: Date.now().toString(),
      name: newSupplement.name,
      time: newSupplement.time,
      frequency: newSupplement.frequency,
      taken: false
    }

    setSupplements([...supplements, supplement])
    setNewSupplement({ name: '', time: '', frequency: 'daily' })
    setOpenSupplementDialog(false)
  }

  const toggleSupplement = (id: string) => {
    setSupplements(supplements.map(s =>
      s.id === id ? { ...s, taken: !s.taken } : s
    ))
  }

  const deleteSupplement = (id: string) => {
    setSupplements(supplements.filter(s => s.id !== id))
  }

  const addReminder = () => {
    if (!newReminder.title || !newReminder.time) return

    const reminder: CustomReminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      time: newReminder.time,
      days: newReminder.days.length > 0 ? newReminder.days : ['Todos os dias'],
      completed: false
    }

    setReminders([...reminders, reminder])
    setNewReminder({ title: '', time: '', days: [] })
    setOpenReminderDialog(false)
  }

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    ))
  }

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id))
  }

  const waterProgress = (waterIntake / waterGoal) * 100
  const glassSize = 250 // ml por copo

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Minha Rotina</h1>
        <p className="text-blue-100">
          Organize sua rotina e não perca nenhum compromisso com sua saúde
        </p>
      </div>

      <Tabs defaultValue="water" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="water">Hidratação</TabsTrigger>
          <TabsTrigger value="supplements">Suplementos</TabsTrigger>
          <TabsTrigger value="reminders">Lembretes</TabsTrigger>
        </TabsList>

        {/* Aba Hidratação */}
        <TabsContent value="water" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Meta de Hidratação
              </CardTitle>
              <CardDescription>Mantenha-se hidratada ao longo do dia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso de Hoje</span>
                  <span className="text-sm text-gray-500">{waterIntake}ml / {waterGoal}ml</span>
                </div>
                <Progress value={waterProgress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {waterProgress >= 100 ? '🎉 Meta atingida!' : `Faltam ${waterGoal - waterIntake}ml para sua meta`}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => addWater(glassSize)}
                  className="flex flex-col h-20 bg-blue-500 hover:bg-blue-600"
                  disabled={waterIntake >= waterGoal}
                >
                  <Droplets className="w-5 h-5 mb-1" />
                  <span className="text-xs">1 Copo</span>
                  <span className="text-xs">({glassSize}ml)</span>
                </Button>
                <Button
                  onClick={() => addWater(glassSize * 2)}
                  className="flex flex-col h-20 bg-blue-500 hover:bg-blue-600"
                  disabled={waterIntake >= waterGoal}
                >
                  <Droplets className="w-6 h-6 mb-1" />
                  <span className="text-xs">Garrafa</span>
                  <span className="text-xs">({glassSize * 2}ml)</span>
                </Button>
                <Button
                  onClick={() => addWater(glassSize * 4)}
                  className="flex flex-col h-20 bg-blue-500 hover:bg-blue-600"
                  disabled={waterIntake >= waterGoal}
                >
                  <Droplets className="w-7 h-7 mb-1" />
                  <span className="text-xs">Garrafa G</span>
                  <span className="text-xs">({glassSize * 4}ml)</span>
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterGoal">Ajustar meta diária (ml)</Label>
                <Input
                  id="waterGoal"
                  type="number"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(parseInt(e.target.value) || 2500)}
                  step="100"
                />
              </div>

              {waterIntake > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setWaterIntake(0)
                    localStorage.removeItem('waterIntake')
                  }}
                  className="w-full"
                >
                  Resetar Hoje
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Suplementos */}
        <TabsContent value="supplements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-purple-500" />
                    Suplementação
                  </CardTitle>
                  <CardDescription>Gerencie seus suplementos e vitaminas</CardDescription>
                </div>
                <Dialog open={openSupplementDialog} onOpenChange={setOpenSupplementDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Suplemento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="suppName">Nome do suplemento</Label>
                        <Input
                          id="suppName"
                          placeholder="Ex: Vitamina D3, Ômega 3, Whey Protein..."
                          value={newSupplement.name}
                          onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="suppTime">Horário</Label>
                        <Input
                          id="suppTime"
                          type="time"
                          value={newSupplement.time}
                          onChange={(e) => setNewSupplement({ ...newSupplement, time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="suppFreq">Frequência</Label>
                        <Select
                          value={newSupplement.frequency}
                          onValueChange={(value) => setNewSupplement({ ...newSupplement, frequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Todos os dias</SelectItem>
                            <SelectItem value="morning">Apenas pela manhã</SelectItem>
                            <SelectItem value="night">Apenas à noite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addSupplement} className="w-full">
                        Adicionar Suplemento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {supplements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum suplemento adicionado ainda</p>
                  <p className="text-sm">Clique em "Adicionar" para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {supplements.map((supplement) => (
                    <div
                      key={supplement.id}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        supplement.taken
                          ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={supplement.taken}
                            onCheckedChange={() => toggleSupplement(supplement.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className={`font-semibold ${supplement.taken ? 'line-through opacity-70' : ''}`}>
                              {supplement.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {supplement.time}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {supplement.frequency === 'daily' && 'Diário'}
                                {supplement.frequency === 'morning' && 'Manhã'}
                                {supplement.frequency === 'night' && 'Noite'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSupplement(supplement.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Lembretes Personalizados */}
        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-500" />
                    Lembretes Personalizados
                  </CardTitle>
                  <CardDescription>Crie lembretes para sua rotina</CardDescription>
                </div>
                <Dialog open={openReminderDialog} onOpenChange={setOpenReminderDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Lembrete</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="reminderTitle">Título do lembrete</Label>
                        <Input
                          id="reminderTitle"
                          placeholder="Ex: Tomar café da manhã, Alongamento, Meditar..."
                          value={newReminder.title}
                          onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reminderTime">Horário</Label>
                        <Input
                          id="reminderTime"
                          type="time"
                          value={newReminder.time}
                          onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dias da semana (opcional)</Label>
                        <div className="grid grid-cols-7 gap-2">
                          {weekDays.map((day) => {
                            const isSelected = newReminder.days.includes(day)
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setNewReminder({
                                      ...newReminder,
                                      days: newReminder.days.filter(d => d !== day)
                                    })
                                  } else {
                                    setNewReminder({
                                      ...newReminder,
                                      days: [...newReminder.days, day]
                                    })
                                  }
                                }}
                                className={`p-2 text-xs rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? 'bg-orange-100 border-orange-500 dark:bg-orange-900/40 dark:border-orange-600 font-medium'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                {day}
                              </button>
                            )
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Deixe em branco para todos os dias
                        </p>
                      </div>
                      <Button onClick={addReminder} className="w-full">
                        Criar Lembrete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum lembrete criado ainda</p>
                  <p className="text-sm">Personalize sua rotina com lembretes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        reminder.completed
                          ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={reminder.completed}
                            onCheckedChange={() => toggleReminder(reminder.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className={`font-semibold ${reminder.completed ? 'line-through opacity-70' : ''}`}>
                              {reminder.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{reminder.time}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {reminder.days.map((day) => (
                                <Badge key={day} variant="outline" className="text-xs">
                                  {day}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
