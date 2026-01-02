import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar as CalendarIcon, Heart, Activity, Droplets, Sun, Moon, Sparkles } from 'lucide-react'
import { format, differenceInDays, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

interface DailyLog {
  date: string
  feeling: string
  symptoms: string[]
}

export default function CycleTracking() {
  const [lastPeriod, setLastPeriod] = useState<Date | undefined>(undefined)
  const [cycleLength, setCycleLength] = useState(28)
  const [dailyFeeling, setDailyFeeling] = useState('')
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cycleData')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.lastPeriod) setLastPeriod(new Date(data.lastPeriod))
      if (data.cycleLength) setCycleLength(data.cycleLength)
      if (data.logs) setLogs(data.logs)
    }
  }, [])

  useEffect(() => {
    if (lastPeriod) {
      localStorage.setItem('cycleData', JSON.stringify({
        lastPeriod: lastPeriod.toISOString(),
        cycleLength,
        logs
      }))
    }
  }, [lastPeriod, cycleLength, logs])

  const getCurrentPhase = () => {
    if (!lastPeriod) return null

    const daysSinceStart = differenceInDays(new Date(), lastPeriod)
    const currentDay = daysSinceStart % cycleLength

    if (currentDay >= 0 && currentDay <= 5) {
      return {
        name: 'Menstrual',
        icon: Droplets,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-200 dark:border-red-800',
        description: 'Fase de menstruação',
        tips: [
          'Foque em treinos leves como yoga e caminhada',
          'Hidrate-se bem e descanse',
          'É normal sentir-se mais cansada'
        ],
        workoutAdjustment: 'Reduzir intensidade em 40-50%. Priorizar alongamentos e mobilidade.'
      }
    } else if (currentDay >= 6 && currentDay <= 13) {
      return {
        name: 'Folicular',
        icon: Sparkles,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950',
        borderColor: 'border-green-200 dark:border-green-800',
        description: 'Fase de renovação e energia',
        tips: [
          'Ótimo momento para treinos intensos',
          'Energia alta e recuperação rápida',
          'Ideal para novos desafios'
        ],
        workoutAdjustment: 'Intensidade máxima! Aproveite para treinos pesados e HIIT.'
      }
    } else if (currentDay >= 14 && currentDay <= 16) {
      return {
        name: 'Ovulação',
        icon: Sun,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        description: 'Pico de energia',
        tips: [
          'Máxima força e resistência',
          'Ótimo para bater recordes',
          'Aproveite a motivação natural'
        ],
        workoutAdjustment: 'Intensidade máxima! Melhor fase para performance.'
      }
    } else {
      return {
        name: 'Lútea',
        icon: Moon,
        color: 'text-[var(--lilac)]',
        bgColor: 'bg-[var(--tiffany-light)] dark:bg-purple-950',
        borderColor: 'border-[var(--tiffany)] dark:border-purple-800',
        description: 'Fase de preparação',
        tips: [
          'Energia começa a diminuir',
          'Foque em treinos moderados',
          'Aumente o descanso entre séries'
        ],
        workoutAdjustment: 'Reduzir intensidade em 20-30%. Mais descanso entre exercícios.'
      }
    }
  }

  const saveDailyLog = () => {
    if (!dailyFeeling.trim()) return

    const newLog: DailyLog = {
      date: new Date().toISOString(),
      feeling: dailyFeeling,
      symptoms: []
    }

    const updatedLogs = [newLog, ...logs].slice(0, 30)
    setLogs(updatedLogs)

    // Salvar no localStorage antes de recarregar
    if (lastPeriod) {
      localStorage.setItem('cycleData', JSON.stringify({
        lastPeriod: lastPeriod.toISOString(),
        cycleLength,
        logs: updatedLogs
      }))
    }

    // Recarregar a página para voltar ao início
    window.location.reload()
  }

  const startNewPeriod = () => {
    const today = new Date()
    setLastPeriod(today)

    // Salvar no localStorage
    localStorage.setItem('cycleData', JSON.stringify({
      lastPeriod: today.toISOString(),
      cycleLength,
      logs
    }))

    // Recarregar a página para atualizar tudo
    window.location.reload()
  }

  const phase = getCurrentPhase()
  const nextPeriod = lastPeriod ? addDays(lastPeriod, cycleLength) : null
  const daysUntilNextPeriod = nextPeriod ? differenceInDays(nextPeriod, new Date()) : null
  const currentDayInCycle = lastPeriod ? (differenceInDays(new Date(), lastPeriod) % cycleLength) : 0
  const cycleProgress = (currentDayInCycle / cycleLength) * 100

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Acompanhamento do Ciclo</h1>
          <p className="text-muted-foreground">Monitore seu ciclo e adapte seus treinos</p>
        </div>
      </div>

      {/* Configuração inicial */}
      {!lastPeriod && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Configure seu ciclo
            </CardTitle>
            <CardDescription>
              Para começar, informe a data do primeiro dia da sua última menstruação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Calendar
                mode="single"
                selected={lastPeriod}
                onSelect={setLastPeriod}
                locale={ptBR}
                className="rounded-md border"
              />
              {lastPeriod && (
                <Button onClick={() => setShowCalendar(false)} className="w-full">
                  Confirmar Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fase atual */}
      {phase && lastPeriod && (
        <>
          <Card className={`border-2 ${phase.borderColor} ${phase.bgColor}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <phase.icon className={`h-8 w-8 ${phase.color}`} />
                  <div>
                    <CardTitle>Fase {phase.name}</CardTitle>
                    <CardDescription>{phase.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Dia {currentDayInCycle + 1}/{cycleLength}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso do ciclo</span>
                  <span className="font-medium">{Math.round(cycleProgress)}%</span>
                </div>
                <Progress value={cycleProgress} className="h-2" />
              </div>

              {daysUntilNextPeriod !== null && daysUntilNextPeriod > 0 && (
                <div className="flex items-center gap-2 text-sm bg-background/50 p-3 rounded-lg">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    Próxima menstruação prevista em <strong>{daysUntilNextPeriod} dias</strong>
                    ({format(nextPeriod!, 'dd/MM/yyyy', { locale: ptBR })})
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Adaptação do Treino
                </h4>
                <p className="text-sm bg-background/50 p-3 rounded-lg">
                  {phase.workoutAdjustment}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Dicas para esta fase
                </h4>
                <ul className="space-y-1">
                  {phase.tips.map((tip, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Botão para registrar nova menstruação */}
          <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-red-500" />
                Sua menstruação desceu?
              </CardTitle>
              <CardDescription>
                Clique abaixo para registrar o início de um novo ciclo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={startNewPeriod}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Registrar Menstruação de Hoje
              </Button>
            </CardContent>
          </Card>

          {/* Diário de sentimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Como você está se sentindo hoje?
              </CardTitle>
              <CardDescription>
                Registre seus sintomas e emoções para acompanhar padrões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base">Selecione seus sentimentos e sintomas de hoje:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Energizada', 'Cansada', 'Animada', 'Desmotivada',
                    'Feliz', 'Irritada', 'Ansiosa', 'Calma',
                    'Com foco', 'Dispersa', 'Confiante', 'Insegura',
                    'Dor de cabeça', 'Cólica', 'Dor nas costas', 'Inchaço',
                    'Fome excessiva', 'Sem apetite', 'Insônia', 'Sono normal'
                  ].map((feeling) => {
                    const isSelected = dailyFeeling.includes(feeling)
                    return (
                      <button
                        key={feeling}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setDailyFeeling(dailyFeeling.split(', ').filter(f => f !== feeling).join(', '))
                          } else {
                            setDailyFeeling(dailyFeeling ? `${dailyFeeling}, ${feeling}` : feeling)
                          }
                        }}
                        className={`p-3 text-sm rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-pink-100 border-pink-500 dark:bg-pink-900/40 dark:border-pink-600 font-medium'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-pink-300'
                        }`}
                      >
                        {feeling}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Observações adicionais (opcional)</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Adicione qualquer outra informação que queira registrar..."
                  rows={2}
                  onChange={(e) => {
                    const base = dailyFeeling.split('|')[0] || ''
                    if (e.target.value.trim()) {
                      setDailyFeeling(`${base} | ${e.target.value}`)
                    } else {
                      setDailyFeeling(base)
                    }
                  }}
                />
              </div>

              <Button onClick={saveDailyLog} disabled={!dailyFeeling.trim()} className="w-full">
                Salvar Registro de Hoje
              </Button>
            </CardContent>
          </Card>

          {/* Histórico */}
          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Registros</CardTitle>
                <CardDescription>Seus últimos 30 dias de acompanhamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.map((log, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {format(new Date(log.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.feeling}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botão para alterar data */}
          <Button
            variant="outline"
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full"
          >
            Alterar Data da Última Menstruação
          </Button>

          {showCalendar && (
            <Card>
              <CardContent className="pt-6">
                <Calendar
                  mode="single"
                  selected={lastPeriod}
                  onSelect={(date) => {
                    setLastPeriod(date)
                    setShowCalendar(false)
                  }}
                  locale={ptBR}
                  className="rounded-md border mx-auto"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
