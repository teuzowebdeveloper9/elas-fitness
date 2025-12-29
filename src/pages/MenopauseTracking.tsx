import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Flame,
  Moon,
  Heart,
  Brain,
  Activity,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Plus,
  Minus,
  type LucideIcon
} from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

interface Symptom {
  id: string
  name: string
  icon: LucideIcon
  active: boolean
  intensity: number
}

interface DailyLog {
  date: string
  symptoms: string[]
  feeling: string
  whatHelps: string
  whatMakesWorse: string
}

const commonSymptoms: Omit<Symptom, 'active' | 'intensity'>[] = [
  { id: 'hot-flashes', name: 'Ondas de calor', icon: Flame },
  { id: 'night-sweats', name: 'Suores noturnos', icon: Moon },
  { id: 'insomnia', name: 'Insônia', icon: Moon },
  { id: 'mood-swings', name: 'Mudanças de humor', icon: Brain },
  { id: 'anxiety', name: 'Ansiedade', icon: Brain },
  { id: 'fatigue', name: 'Fadiga', icon: Activity },
  { id: 'joint-pain', name: 'Dor nas articulações', icon: Activity },
  { id: 'weight-gain', name: 'Ganho de peso', icon: TrendingUp },
]

export default function MenopauseTracking() {
  const [phase, setPhase] = useState<'premenopausa' | 'menopausa' | 'posmenopausa'>('menopausa')
  const [symptoms, setSymptoms] = useState<Symptom[]>(
    commonSymptoms.map(s => ({ ...s, active: false, intensity: 3 }))
  )
  const [dailyFeeling, setDailyFeeling] = useState('')
  const [whatHelps, setWhatHelps] = useState('')
  const [whatMakesWorse, setWhatMakesWorse] = useState('')
  const [logs, setLogs] = useState<DailyLog[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('menopauseData')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.phase) setPhase(data.phase)
      if (data.symptoms) {
        // Restaurar sintomas mas manter os ícones do commonSymptoms
        const restoredSymptoms = data.symptoms.map((savedSymptom: any) => {
          const baseSymptom = commonSymptoms.find(cs => cs.id === savedSymptom.id)
          return {
            ...savedSymptom,
            icon: baseSymptom?.icon || Flame
          }
        })
        setSymptoms(restoredSymptoms)
      }
      if (data.logs) setLogs(data.logs)
    }
  }, [])

  useEffect(() => {
    // Salvar sintomas sem os ícones (que não podem ser serializados)
    const symptomsToSave = symptoms.map(({ icon, ...rest }) => rest)
    localStorage.setItem('menopauseData', JSON.stringify({
      phase,
      symptoms: symptomsToSave,
      logs
    }))
  }, [phase, symptoms, logs])

  const toggleSymptom = (id: string) => {
    setSymptoms(symptoms.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ))
  }

  const updateIntensity = (id: string, intensity: number) => {
    setSymptoms(symptoms.map(s =>
      s.id === id ? { ...s, intensity } : s
    ))
  }

  const saveDailyLog = () => {
    const activeSymptomNames = symptoms
      .filter(s => s.active)
      .map(s => `${s.name} (intensidade ${s.intensity}/5)`)

    const newLog: DailyLog = {
      date: new Date().toISOString(),
      symptoms: activeSymptomNames,
      feeling: dailyFeeling,
      whatHelps,
      whatMakesWorse
    }

    setLogs([newLog, ...logs].slice(0, 30))
    setDailyFeeling('')
    setWhatHelps('')
    setWhatMakesWorse('')
  }

  const getPhaseInfo = () => {
    switch (phase) {
      case 'premenopausa':
        return {
          title: 'Pré-menopausa',
          description: 'Transição para a menopausa',
          color: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-950',
          tips: [
            'Mantenha exercícios regulares para fortalecer ossos',
            'Alimentos ricos em cálcio são essenciais',
            'Considere suplementação de vitamina D'
          ]
        }
      case 'menopausa':
        return {
          title: 'Menopausa',
          description: 'Após 12 meses sem menstruação',
          color: 'text-purple-500',
          bgColor: 'bg-purple-50 dark:bg-purple-950',
          tips: [
            'Hidratação é fundamental',
            'Evite cafeína e álcool se tiver ondas de calor',
            'Pratique técnicas de relaxamento'
          ]
        }
      case 'posmenopausa':
        return {
          title: 'Pós-menopausa',
          description: 'Fase após a menopausa',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          tips: [
            'Foco em saúde cardiovascular',
            'Exercícios de força são cruciais',
            'Monitore saúde óssea regularmente'
          ]
        }
    }
  }

  const getWorkoutRecommendations = () => {
    const activeSymptoms = symptoms.filter(s => s.active)
    const hasFatigue = activeSymptoms.some(s => s.id === 'fatigue' && s.intensity >= 3)
    const hasJointPain = activeSymptoms.some(s => s.id === 'joint-pain')
    const hasHotFlashes = activeSymptoms.some(s => s.id === 'hot-flashes')

    const recommendations = []

    if (hasFatigue) {
      recommendations.push('Reduza a intensidade dos treinos em 30-40%')
      recommendations.push('Aumente os intervalos de descanso entre séries')
      recommendations.push('Considere dividir o treino em duas sessões curtas')
    }

    if (hasJointPain) {
      recommendations.push('Evite exercícios de alto impacto')
      recommendations.push('Foque em exercícios aquáticos ou pilates')
      recommendations.push('Faça aquecimento prolongado antes de treinar')
    }

    if (hasHotFlashes) {
      recommendations.push('Treine em ambiente fresco e bem ventilado')
      recommendations.push('Use roupas leves e respiráveis')
      recommendations.push('Tenha água gelada sempre disponível')
    }

    if (activeSymptoms.length === 0) {
      recommendations.push('Mantenha treinos regulares de força')
      recommendations.push('Inclua exercícios cardiovasculares moderados')
      recommendations.push('Pratique yoga ou alongamento para flexibilidade')
    }

    return recommendations
  }

  const getSymptomTips = () => {
    const activeSymptoms = symptoms.filter(s => s.active)
    const tips: { [key: string]: string[] } = {
      'hot-flashes': [
        'Vista-se em camadas para remover facilmente',
        'Mantenha o ambiente fresco',
        'Evite alimentos picantes e bebidas quentes'
      ],
      'insomnia': [
        'Mantenha horários regulares de sono',
        'Evite telas 1 hora antes de dormir',
        'Pratique meditação ou respiração profunda'
      ],
      'anxiety': [
        'Exercícios aeróbicos ajudam a reduzir ansiedade',
        'Considere mindfulness ou yoga',
        'Converse com pessoas próximas sobre seus sentimentos'
      ],
      'joint-pain': [
        'Suplementos de ômega-3 podem ajudar',
        'Pratique natação ou hidroginástica',
        'Alongue-se diariamente'
      ]
    }

    const relevantTips: string[] = []
    activeSymptoms.forEach(symptom => {
      if (tips[symptom.id]) {
        relevantTips.push(...tips[symptom.id])
      }
    })

    return relevantTips.length > 0 ? relevantTips : [
      'Mantenha uma dieta balanceada',
      'Exercite-se regularmente',
      'Durma bem e gerencie o estresse'
    ]
  }

  const phaseInfo = getPhaseInfo()
  const workoutRecs = getWorkoutRecommendations()
  const symptomTips = getSymptomTips()

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Acompanhamento da Menopausa</h1>
        <p className="text-muted-foreground">
          Monitore seus sintomas e adapte seu estilo de vida
        </p>
      </div>

      {/* Seleção de fase */}
      <Card>
        <CardHeader>
          <CardTitle>Em qual fase você está?</CardTitle>
          <CardDescription>Selecione a fase que melhor descreve sua situação atual</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={phase} onValueChange={(v: any) => setPhase(v)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="premenopausa" id="pre" />
                <Label htmlFor="pre" className="flex-1 cursor-pointer">
                  <div className="font-medium">Pré-menopausa</div>
                  <div className="text-sm text-muted-foreground">
                    Ciclos irregulares, sintomas começando
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="menopausa" id="meno" />
                <Label htmlFor="meno" className="flex-1 cursor-pointer">
                  <div className="font-medium">Menopausa</div>
                  <div className="text-sm text-muted-foreground">
                    12 meses sem menstruação
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="posmenopausa" id="pos" />
                <Label htmlFor="pos" className="flex-1 cursor-pointer">
                  <div className="font-medium">Pós-menopausa</div>
                  <div className="text-sm text-muted-foreground">
                    Após a menopausa
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Info da fase */}
      <Card className={phaseInfo.bgColor}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Heart className={`h-8 w-8 ${phaseInfo.color}`} />
            <div>
              <CardTitle>{phaseInfo.title}</CardTitle>
              <CardDescription>{phaseInfo.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="font-semibold">Dicas importantes:</h4>
            <ul className="space-y-1">
              {phaseInfo.tips.map((tip, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Sintomas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quais sintomas você está sentindo?
          </CardTitle>
          <CardDescription>
            Marque os sintomas atuais e indique a intensidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {symptoms.map((symptom) => {
            const Icon = symptom.icon
            return (
              <div key={symptom.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={symptom.id}
                      checked={symptom.active}
                      onCheckedChange={() => toggleSymptom(symptom.id)}
                    />
                    <Label htmlFor={symptom.id} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="h-4 w-4" />
                      {symptom.name}
                    </Label>
                  </div>
                  {symptom.active && (
                    <Badge variant="outline">
                      Intensidade: {symptom.intensity}/5
                    </Badge>
                  )}
                </div>
                {symptom.active && (
                  <div className="flex items-center gap-2 ml-9">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateIntensity(symptom.id, Math.max(1, symptom.intensity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded ${
                            level <= symptom.intensity
                              ? 'bg-primary'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateIntensity(symptom.id, Math.min(5, symptom.intensity + 1))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Adaptações de treino */}
      {symptoms.some(s => s.active) && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Adaptações de Treino para Você
            </CardTitle>
            <CardDescription>
              Baseado nos seus sintomas atuais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {workoutRecs.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 p-2 bg-accent/50 rounded">
                  <Activity className="h-4 w-4 mt-0.5 text-primary" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dicas personalizadas */}
      {symptoms.some(s => s.active) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Dicas Personalizadas
            </CardTitle>
            <CardDescription>
              Estratégias para aliviar seus sintomas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {symptomTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Diário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Diário de Bem-estar
          </CardTitle>
          <CardDescription>
            Registre como você está se sentindo e o que ajuda ou piora
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feeling">Como você está se sentindo hoje?</Label>
            <Textarea
              id="feeling"
              placeholder="Descreva como você está se sentindo fisicamente e emocionalmente..."
              value={dailyFeeling}
              onChange={(e) => setDailyFeeling(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="helps" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              O que está ajudando?
            </Label>
            <Textarea
              id="helps"
              placeholder="Ex: Caminhada pela manhã, chá de camomila, exercícios de respiração..."
              value={whatHelps}
              onChange={(e) => setWhatHelps(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="worse" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              O que está piorando?
            </Label>
            <Textarea
              id="worse"
              placeholder="Ex: Café, noites mal dormidas, estresse no trabalho..."
              value={whatMakesWorse}
              onChange={(e) => setWhatMakesWorse(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={saveDailyLog}
            disabled={!dailyFeeling.trim()}
            className="w-full"
          >
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
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {format(new Date(log.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>

                  {log.symptoms.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Sintomas:</p>
                      <div className="flex flex-wrap gap-1">
                        {log.symptoms.map((symptom, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.feeling && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Sentimentos:</p>
                      <p className="text-sm">{log.feeling}</p>
                    </div>
                  )}

                  {log.whatHelps && (
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Ajudou:</p>
                        <p className="text-sm">{log.whatHelps}</p>
                      </div>
                    </div>
                  )}

                  {log.whatMakesWorse && (
                    <div className="flex items-start gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Piorou:</p>
                        <p className="text-sm">{log.whatMakesWorse}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
