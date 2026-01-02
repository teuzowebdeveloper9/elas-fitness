import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useUser, UserProfile, LifePhase, FitnessLevel, Goal, DietType } from '@/contexts/UserContext'
import { Heart, ArrowRight, ArrowLeft, Sparkles, HeartCrack, Calendar, Utensils } from 'lucide-react'

const TOTAL_STEPS = 13

export default function Onboarding() {
  const navigate = useNavigate()
  const { setUserProfile } = useUser()
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    goalWeight: '',
    neck: '',
    waist: '',
    hips: '',
    activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active',
    lifePhase: 'menstrual' as LifePhase,
    hasMenstrualCycle: true,
    cycleRegular: true,
    irregularCycleReason: '' as 'iud' | 'pcos' | 'stress' | 'health-condition' | 'other' | '',
    fitnessLevel: 'beginner' as FitnessLevel,
    goals: [] as Goal[],
    challenges: [] as string[],
    exerciseFrequency: 3,
    dietaryRestrictions: [] as string[],
    healthConditions: [] as string[],
    favoriteFoods: [] as string[],
    dislikedFoods: [] as string[],
    mealsPerDay: 3,
    cookingSkill: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    timeForCooking: 30,
    eatsOutFrequency: 'sometimes' as 'never' | 'rarely' | 'sometimes' | 'often' | 'daily',
    goalDeadlineWeeks: 12,
    selectedDietType: '' as DietType | '',
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    } else {
      await completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    try {
      setIsSaving(true)

      // Determinar se deve usar feedback diário (ciclo irregular)
      const usesDailyFeedback = formData.lifePhase === 'irregular-cycle'

      const profile: UserProfile = {
        name: formData.name,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        goalWeight: parseFloat(formData.goalWeight),
        neck: formData.neck ? parseFloat(formData.neck) : undefined,
        waist: formData.waist ? parseFloat(formData.waist) : undefined,
        hips: formData.hips ? parseFloat(formData.hips) : undefined,
        activityLevel: formData.activityLevel,
        lifePhase: formData.lifePhase,
        hasMenstrualCycle: formData.hasMenstrualCycle,
        cycleRegular: formData.cycleRegular,
        usesDailyFeedback: usesDailyFeedback,
        irregularCycleReason: formData.irregularCycleReason || undefined,
        fitnessLevel: formData.fitnessLevel,
        goals: formData.goals,
        challenges: formData.challenges,
        exerciseFrequency: formData.exerciseFrequency,
        dietaryRestrictions: formData.dietaryRestrictions,
        healthConditions: formData.healthConditions,
        favoriteFoods: formData.favoriteFoods,
        dislikedFoods: formData.dislikedFoods,
        mealsPerDay: formData.mealsPerDay,
        cookingSkill: formData.cookingSkill,
        timeForCooking: formData.timeForCooking,
        eatsOutFrequency: formData.eatsOutFrequency,
        goalDeadlineWeeks: formData.goalDeadlineWeeks,
        selectedDietType: formData.selectedDietType as DietType,
        onboardingCompleted: true,
      }
      await setUserProfile(profile)
      navigate('/')
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error)
      const errorMessage = error?.message || 'Erro desconhecido'
      alert(`Erro ao salvar: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item]
  }

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Elas Fit
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vamos conhecer você melhor para personalizar sua experiência
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Etapa {currentStep} de {TOTAL_STEPS}</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-6 h-6 text-pink-500" />
              {getStepTitle(currentStep)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Como você gostaria de ser chamada?</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Qual sua idade?</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 28"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Body Measurements */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weight">Qual seu peso atual? (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 65.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Qual sua altura? (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Ex: 165"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="goalWeight">Qual seu peso desejado? (kg)</Label>
                  <Input
                    id="goalWeight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 60.0"
                    value={formData.goalWeight}
                    onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Após a bioimpedância, você terá mais clareza sobre seu peso ideal</p>
                </div>
              </div>
            )}

            {/* Step 3: Life Phase */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base mb-4 block">Em que fase da vida você está?</Label>
                  <RadioGroup
                    value={formData.lifePhase}
                    onValueChange={(value) => setFormData({ ...formData, lifePhase: value as LifePhase })}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <RadioGroupItem value="menstrual" id="menstrual" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="menstrual" className="font-medium cursor-pointer">
                          Período Menstrual Regular
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Menstruação regular, ciclos previsíveis
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <RadioGroupItem value="pre-menopause" id="pre-menopause" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="pre-menopause" className="font-medium cursor-pointer">
                          Pré-Menopausa
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Ciclos irregulares, sintomas iniciais (geralmente 40-50 anos)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <RadioGroupItem value="menopause" id="menopause" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="menopause" className="font-medium cursor-pointer">
                          Menopausa
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          12 meses sem menstruação, sintomas mais intensos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <RadioGroupItem value="post-menopause" id="post-menopause" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="post-menopause" className="font-medium cursor-pointer">
                          Pós-Menopausa
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Após a menopausa, novo equilíbrio hormonal
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                      <RadioGroupItem value="irregular-cycle" id="irregular-cycle" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="irregular-cycle" className="font-medium cursor-pointer">
                          Ciclo Irregular / Sem Menstruação
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Ciclos imprevisíveis ou ausência de menstruação
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 4: Menstrual Details or Irregular Cycle Reason */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {formData.lifePhase === 'menstrual' ? (
                  <>
                    <div>
                      <Label className="text-base mb-4 block">Seu ciclo menstrual é regular?</Label>
                      <RadioGroup
                        value={formData.cycleRegular ? 'yes' : 'no'}
                        onValueChange={(value) => setFormData({ ...formData, cycleRegular: value === 'yes' })}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-4 border-2 rounded-lg">
                          <RadioGroupItem value="yes" id="cycle-yes" />
                          <Label htmlFor="cycle-yes" className="cursor-pointer">
                            Sim, meu ciclo é regular (21-35 dias)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border-2 rounded-lg">
                          <RadioGroupItem value="no" id="cycle-no" />
                          <Label htmlFor="cycle-no" className="cursor-pointer">
                            Não, meu ciclo é irregular
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Por que perguntamos?</strong> Vamos adaptar seus treinos de acordo com as fases do seu ciclo menstrual, respeitando os momentos de mais e menos energia.
                      </p>
                    </div>
                  </>
                ) : formData.lifePhase === 'irregular-cycle' ? (
                  <>
                    <div>
                      <Label className="text-base mb-4 block">O que pode estar causando a irregularidade?</Label>
                      <RadioGroup
                        value={formData.irregularCycleReason}
                        onValueChange={(value) => setFormData({ ...formData, irregularCycleReason: value as any })}
                        className="space-y-3"
                      >
                        <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                          <RadioGroupItem value="iud" id="reason-iud" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="reason-iud" className="font-medium cursor-pointer">
                              Uso DIU (hormonal ou cobre)
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Dispositivo intrauterino pode alterar ou interromper o ciclo
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                          <RadioGroupItem value="pcos" id="reason-pcos" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="reason-pcos" className="font-medium cursor-pointer">
                              SOP (Síndrome dos Ovários Policísticos)
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Condição hormonal que afeta os ciclos menstruais
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                          <RadioGroupItem value="stress" id="reason-stress" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="reason-stress" className="font-medium cursor-pointer">
                              Estresse / Mudanças na Rotina
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Fatores emocionais e mudanças podem alterar o ciclo
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                          <RadioGroupItem value="health-condition" id="reason-health" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="reason-health" className="font-medium cursor-pointer">
                              Condição de Saúde
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Problemas de tireoide, endometriose, ou outras condições
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                          <RadioGroupItem value="other" id="reason-other" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="reason-other" className="font-medium cursor-pointer">
                              Outro motivo / Não sei
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Outros fatores ou ainda em investigação
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Personalização Especial:</strong> Vamos adaptar seus treinos e dieta com base em como você se sente a cada dia, sem depender de fases do ciclo hormonal.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                      <h3 className="font-medium mb-2">Treinos Adaptados para Você</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vamos criar treinos específicos para sua fase da vida, focando em:
                      </p>
                      <ul className="text-sm text-left mt-3 space-y-1 text-gray-700 dark:text-gray-300">
                        <li>• Fortalecimento ósseo</li>
                        <li>• Equilíbrio hormonal</li>
                        <li>• Redução de sintomas</li>
                        <li>• Manutenção muscular</li>
                        <li>• Bem-estar emocional</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Fitness Level & Goals */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base mb-4 block">Qual seu nível de condicionamento físico?</Label>
                  <RadioGroup
                    value={formData.fitnessLevel}
                    onValueChange={(value) => setFormData({ ...formData, fitnessLevel: value as FitnessLevel })}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-4 border-2 rounded-lg">
                      <RadioGroupItem value="beginner" id="beginner" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="beginner" className="font-medium cursor-pointer">Iniciante</Label>
                        <p className="text-sm text-gray-500">Sedentária ou pouca experiência com exercícios</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border-2 rounded-lg">
                      <RadioGroupItem value="intermediate" id="intermediate" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="intermediate" className="font-medium cursor-pointer">Intermediário</Label>
                        <p className="text-sm text-gray-500">Treina regularmente há alguns meses</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border-2 rounded-lg">
                      <RadioGroupItem value="advanced" id="advanced" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="advanced" className="font-medium cursor-pointer">Avançado</Label>
                        <p className="text-sm text-gray-500">Treina consistentemente há mais de um ano</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base mb-4 block">Quais são seus objetivos? (Pode escolher mais de um)</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <Checkbox
                        id="lose-weight"
                        checked={formData.goals.includes('lose-weight')}
                        onCheckedChange={() =>
                          setFormData({
                            ...formData,
                            goals: formData.goals.includes('lose-weight')
                              ? formData.goals.filter(g => g !== 'lose-weight')
                              : [...formData.goals, 'lose-weight']
                          })
                        }
                      />
                      <Label htmlFor="lose-weight" className="cursor-pointer flex-1 font-medium">
                        Perder peso e definir
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <Checkbox
                        id="gain-muscle"
                        checked={formData.goals.includes('gain-muscle')}
                        onCheckedChange={() =>
                          setFormData({
                            ...formData,
                            goals: formData.goals.includes('gain-muscle')
                              ? formData.goals.filter(g => g !== 'gain-muscle')
                              : [...formData.goals, 'gain-muscle']
                          })
                        }
                      />
                      <Label htmlFor="gain-muscle" className="cursor-pointer flex-1 font-medium">
                        Ganhar massa muscular
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <Checkbox
                        id="tone"
                        checked={formData.goals.includes('tone')}
                        onCheckedChange={() =>
                          setFormData({
                            ...formData,
                            goals: formData.goals.includes('tone')
                              ? formData.goals.filter(g => g !== 'tone')
                              : [...formData.goals, 'tone']
                          })
                        }
                      />
                      <Label htmlFor="tone" className="cursor-pointer flex-1 font-medium">
                        Tonificar o corpo
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <Checkbox
                        id="health"
                        checked={formData.goals.includes('health')}
                        onCheckedChange={() =>
                          setFormData({
                            ...formData,
                            goals: formData.goals.includes('health')
                              ? formData.goals.filter(g => g !== 'health')
                              : [...formData.goals, 'health']
                          })
                        }
                      />
                      <Label htmlFor="health" className="cursor-pointer flex-1 font-medium">
                        Saúde e bem-estar geral
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <Checkbox
                        id="flexibility"
                        checked={formData.goals.includes('flexibility')}
                        onCheckedChange={() =>
                          setFormData({
                            ...formData,
                            goals: formData.goals.includes('flexibility')
                              ? formData.goals.filter(g => g !== 'flexibility')
                              : [...formData.goals, 'flexibility']
                          })
                        }
                      />
                      <Label htmlFor="flexibility" className="cursor-pointer flex-1 font-medium">
                        Melhorar flexibilidade e mobilidade
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <Checkbox
                        id="energy"
                        checked={formData.goals.includes('energy')}
                        onCheckedChange={() =>
                          setFormData({
                            ...formData,
                            goals: formData.goals.includes('energy')
                              ? formData.goals.filter(g => g !== 'energy')
                              : [...formData.goals, 'energy']
                          })
                        }
                      />
                      <Label htmlFor="energy" className="cursor-pointer flex-1 font-medium">
                        Aumentar energia e disposição
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <Checkbox
                        id="reduce-stress"
                        checked={formData.goals.includes('reduce-stress')}
                        onCheckedChange={() =>
                          setFormData({
                            ...formData,
                            goals: formData.goals.includes('reduce-stress')
                              ? formData.goals.filter(g => g !== 'reduce-stress')
                              : [...formData.goals, 'reduce-stress']
                          })
                        }
                      />
                      <Label htmlFor="reduce-stress" className="cursor-pointer flex-1 font-medium">
                        Reduzir estresse e ansiedade
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <Checkbox
                        id="posture"
                        checked={formData.goals.includes('posture')}
                        onCheckedChange={() =>
                          setFormData({
                            ...formData,
                            goals: formData.goals.includes('posture')
                              ? formData.goals.filter(g => g !== 'posture')
                              : [...formData.goals, 'posture']
                          })
                        }
                      />
                      <Label htmlFor="posture" className="cursor-pointer flex-1 font-medium">
                        Melhorar postura
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                      <Checkbox
                        id="maintain"
                        checked={formData.goals.includes('maintain')}
                        onCheckedChange={() =>
                          setFormData({
                            ...formData,
                            goals: formData.goals.includes('maintain')
                              ? formData.goals.filter(g => g !== 'maintain')
                              : [...formData.goals, 'maintain']
                          })
                        }
                      />
                      <Label htmlFor="maintain" className="cursor-pointer flex-1 font-medium">
                        Manter forma atual
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Challenges */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <HeartCrack className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                  <h3 className="text-lg font-medium mb-2">Você não está sozinha</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Queremos entender suas dificuldades para te apoiar melhor
                  </p>
                </div>
                <div>
                  <Label className="text-base mb-4 block">Quais são suas principais dificuldades? (Pode escolher mais de uma)</Label>
                  <div className="space-y-3">
                    {[
                      'Falta de tempo para treinar',
                      'Dificuldade em manter a constância',
                      'Falta de motivação',
                      'Não sei por onde começar',
                      'Dificuldade em controlar a alimentação',
                      'Cansaço e falta de energia',
                      'Dores ou limitações físicas',
                      'Ansiedade ou compulsão alimentar',
                      'Alterações hormonais afetando o corpo',
                      'Pressão estética ou autoestima baixa'
                    ].map((challenge) => (
                      <div key={challenge} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <Checkbox
                          id={challenge}
                          checked={formData.challenges.includes(challenge)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              challenges: toggleArrayItem(formData.challenges, challenge)
                            })
                          }
                          className="mt-1"
                        />
                        <Label htmlFor={challenge} className="cursor-pointer flex-1 text-sm">{challenge}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>💜 Estamos aqui para você:</strong> Vamos personalizar seu plano considerando essas dificuldades, tornando sua jornada mais leve e real.
                  </p>
                </div>
              </div>
            )}

            {/* Step 7: Exercise Frequency */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base mb-4 block">
                    Quantos dias por semana você pode treinar?
                  </Label>
                  <RadioGroup
                    value={formData.exerciseFrequency.toString()}
                    onValueChange={(value) => setFormData({ ...formData, exerciseFrequency: parseInt(value) })}
                    className="space-y-3"
                  >
                    {[2, 3, 4, 5, 6, 7].map((days) => (
                      <div key={days} className="flex items-center space-x-3 p-4 border-2 rounded-lg">
                        <RadioGroupItem value={days.toString()} id={`days-${days}`} />
                        <Label htmlFor={`days-${days}`} className="cursor-pointer">
                          {days} {days === 1 ? 'dia' : 'dias'} por semana
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Dica:</strong> Seja realista! É melhor treinar menos vezes com constância do que se comprometer com muitos dias e desistir.
                  </p>
                </div>
              </div>
            )}

            {/* Step 8: Bioimpedância - Medidas Adicionais */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>📊 Dados para Bioimpedância:</strong> Essas medidas nos ajudam a calcular sua composição corporal ideal e criar um plano mais preciso.
                  </p>
                </div>
                <div>
                  <Label htmlFor="neck">Circunferência do pescoço (cm) - Opcional</Label>
                  <Input
                    id="neck"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 32"
                    value={formData.neck}
                    onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="waist">Circunferência da cintura (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 75"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="hips">Circunferência do quadril (cm)</Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 95"
                    value={formData.hips}
                    onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-base mb-4 block">Qual seu nível de atividade diária?</Label>
                  <RadioGroup
                    value={formData.activityLevel}
                    onValueChange={(value: any) => setFormData({ ...formData, activityLevel: value })}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="sedentary" id="sedentary" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="sedentary" className="font-medium cursor-pointer">Sedentária</Label>
                        <p className="text-sm text-gray-500">Pouco ou nenhum exercício</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="light" id="light" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="light" className="font-medium cursor-pointer">Levemente ativa</Label>
                        <p className="text-sm text-gray-500">Exercício leve 1-3 dias/semana</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="moderate" id="moderate" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="moderate" className="font-medium cursor-pointer">Moderadamente ativa</Label>
                        <p className="text-sm text-gray-500">Exercício moderado 3-5 dias/semana</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="active" id="active" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="active" className="font-medium cursor-pointer">Muito ativa</Label>
                        <p className="text-sm text-gray-500">Exercício intenso 6-7 dias/semana</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="very-active" id="very-active" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="very-active" className="font-medium cursor-pointer">Extremamente ativa</Label>
                        <p className="text-sm text-gray-500">Exercício muito intenso diariamente ou trabalho físico</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 9: Restrições Alimentares */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base mb-4 block">Você tem alguma restrição alimentar?</Label>
                  <div className="space-y-3">
                    {['Vegetariana', 'Vegana', 'Sem Lactose', 'Sem Glúten', 'Diabética', 'Nenhuma'].map((restriction) => (
                      <div key={restriction} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={restriction}
                          checked={formData.dietaryRestrictions.includes(restriction)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              dietaryRestrictions: toggleArrayItem(formData.dietaryRestrictions, restriction)
                            })
                          }
                        />
                        <Label htmlFor={restriction} className="cursor-pointer flex-1">{restriction}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Label htmlFor="customRestrictions" className="text-sm">Outras restrições (opcional)</Label>
                    <Input
                      id="customRestrictions"
                      placeholder="Ex: alergia a frutos do mar, intolerância a ovo..."
                      className="mt-2"
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          const newRestrictions = e.target.value.split(',').map(r => r.trim()).filter(r => r.length > 0)
                          setFormData({
                            ...formData,
                            dietaryRestrictions: [...new Set([...formData.dietaryRestrictions, ...newRestrictions])]
                          })
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base mb-4 block">Alguma condição de saúde que devemos saber?</Label>
                  <div className="space-y-3">
                    {['Hipertensão', 'Problemas articulares', 'Lesão recente', 'Problemas cardíacos', 'Nenhuma'].map((condition) => (
                      <div key={condition} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={condition}
                          checked={formData.healthConditions.includes(condition)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              healthConditions: toggleArrayItem(formData.healthConditions, condition)
                            })
                          }
                        />
                        <Label htmlFor={condition} className="cursor-pointer flex-1">{condition}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Label htmlFor="customConditions" className="text-sm">Outras condições (opcional)</Label>
                    <Input
                      id="customConditions"
                      placeholder="Ex: hipotireoidismo, asma, fibromialgia..."
                      className="mt-2"
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          const newConditions = e.target.value.split(',').map(c => c.trim()).filter(c => c.length > 0)
                          setFormData({
                            ...formData,
                            healthConditions: [...new Set([...formData.healthConditions, ...newConditions])]
                          })
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Importante:</strong> Essas informações nos ajudam a personalizar seus treinos. Sempre consulte um médico antes de iniciar qualquer programa de exercícios.
                  </p>
                </div>
              </div>
            )}

            {/* Step 10: Hábitos Alimentares */}
            {currentStep === 10 && (
              <div className="space-y-6">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>🍽️ Sobre sua alimentação:</strong> Vamos entender seus hábitos para criar uma dieta que funcione para VOCÊ!
                  </p>
                </div>
                <div>
                  <Label className="text-base mb-4 block">Quantas refeições você faz por dia?</Label>
                  <RadioGroup
                    value={formData.mealsPerDay.toString()}
                    onValueChange={(value) => setFormData({ ...formData, mealsPerDay: parseInt(value) })}
                    className="space-y-3"
                  >
                    {[3, 4, 5, 6].map((meals) => (
                      <div key={meals} className="flex items-center space-x-3 p-3 border-2 rounded-lg">
                        <RadioGroupItem value={meals.toString()} id={`meals-${meals}`} />
                        <Label htmlFor={`meals-${meals}`} className="cursor-pointer">
                          {meals} refeições por dia
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base mb-4 block">Como você classifica sua habilidade na cozinha?</Label>
                  <RadioGroup
                    value={formData.cookingSkill}
                    onValueChange={(value: any) => setFormData({ ...formData, cookingSkill: value })}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="beginner" id="cook-beginner" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="cook-beginner" className="font-medium cursor-pointer">Iniciante</Label>
                        <p className="text-sm text-gray-500">Prefiro receitas simples e rápidas</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="intermediate" id="cook-intermediate" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="cook-intermediate" className="font-medium cursor-pointer">Intermediário</Label>
                        <p className="text-sm text-gray-500">Me viro bem na cozinha</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="advanced" id="cook-advanced" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="cook-advanced" className="font-medium cursor-pointer">Avançado</Label>
                        <p className="text-sm text-gray-500">Adoro cozinhar e fazer receitas elaboradas</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="timeForCooking">Quanto tempo tem disponível para cozinhar cada refeição? (minutos)</Label>
                  <Input
                    id="timeForCooking"
                    type="number"
                    placeholder="Ex: 30"
                    value={formData.timeForCooking}
                    onChange={(e) => setFormData({ ...formData, timeForCooking: parseInt(e.target.value) || 30 })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base mb-4 block">Com que frequência você come fora?</Label>
                  <RadioGroup
                    value={formData.eatsOutFrequency}
                    onValueChange={(value: any) => setFormData({ ...formData, eatsOutFrequency: value })}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="never" id="never" />
                      <Label htmlFor="never" className="cursor-pointer">Nunca ou quase nunca</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="rarely" id="rarely" />
                      <Label htmlFor="rarely" className="cursor-pointer">Raramente (1-2x por mês)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="sometimes" id="sometimes" />
                      <Label htmlFor="sometimes" className="cursor-pointer">Às vezes (1-2x por semana)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="often" id="often" />
                      <Label htmlFor="often" className="cursor-pointer">Frequentemente (3-4x por semana)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-2 rounded-lg">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily" className="cursor-pointer">Diariamente</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 11: Preferências Alimentares */}
            {currentStep === 11 && (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>😋 Suas preferências:</strong> Selecione os alimentos que você AMA comer em cada categoria!
                  </p>
                </div>

                {/* Categoria: Grãos e Carboidratos */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    🌾 Grãos e Carboidratos
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Arroz branco', 'Arroz integral', 'Feijão carioca', 'Feijão preto', 'Feijão fradinho', 'Lentilha', 'Grão-de-bico', 'Milho', 'Cuscuz de milho', 'Aveia', 'Trigo (farinha de trigo)', 'Pão francês', 'Macarrão', 'Batata inglesa', 'Batata-doce', 'Mandioca (aipim/macaxeira)', 'Tapioca', 'Quinoa', 'Inhame', 'Fubá (farinha de milho)'].map((food) => (
                      <div
                        key={food}
                        onClick={() => setFormData({
                          ...formData,
                          favoriteFoods: toggleArrayItem(formData.favoriteFoods, food)
                        })}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          formData.favoriteFoods.includes(food)
                            ? 'bg-amber-100 border-amber-500 dark:bg-amber-900/40 dark:border-amber-600'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-300'
                        }`}
                      >
                        <p className="text-sm font-medium text-center">{food}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categoria: Proteínas */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                    🍗 Proteínas
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Ovo', 'Peito de frango', 'Frango desfiado', 'Carne bovina (patinho)', 'Carne bovina (acém)', 'Carne moída', 'Peixe', 'Sardinha', 'Atum', 'Salmão', 'Carne suína (lombo)', 'Presunto', 'Peito de peru', 'Queijo branco (minas/ricota)', 'Queijo muçarela', 'Leite', 'Iogurte natural', 'Grão-de-bico (proteína vegetal)', 'Lentilha (proteína vegetal)', 'Feijão (proteína vegetal)'].map((food) => (
                      <div
                        key={food}
                        onClick={() => setFormData({
                          ...formData,
                          favoriteFoods: toggleArrayItem(formData.favoriteFoods, food)
                        })}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          formData.favoriteFoods.includes(food)
                            ? 'bg-red-100 border-red-500 dark:bg-red-900/40 dark:border-red-600'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300'
                        }`}
                      >
                        <p className="text-sm font-medium text-center">{food}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categoria: Legumes e Verduras */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                    🥬 Legumes e Verduras
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Alface', 'Tomate', 'Cenoura', 'Batata', 'Cebola', 'Brócolis', 'Couve', 'Abobrinha', 'Berinjela', 'Chuchu', 'Pepino', 'Pimentão', 'Beterraba', 'Repolho', 'Espinafre', 'Vagem', 'Quiabo', 'Abóbora', 'Couve-flor', 'Agrião'].map((food) => (
                      <div
                        key={food}
                        onClick={() => setFormData({
                          ...formData,
                          favoriteFoods: toggleArrayItem(formData.favoriteFoods, food)
                        })}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          formData.favoriteFoods.includes(food)
                            ? 'bg-green-100 border-green-500 dark:bg-green-900/40 dark:border-green-600'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300'
                        }`}
                      >
                        <p className="text-sm font-medium text-center">{food}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categoria: Frutas */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-pink-700 dark:text-pink-400 flex items-center gap-2">
                    🍎 Frutas
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Banana', 'Maçã', 'Laranja', 'Mamão', 'Manga', 'Abacaxi', 'Uva', 'Melancia', 'Melão', 'Pera', 'Morango', 'Limão', 'Acerola', 'Goiaba', 'Abacate', 'Tangerina (mexerica/bergamota)', 'Maracujá', 'Kiwi', 'Ameixa', 'Coco'].map((food) => (
                      <div
                        key={food}
                        onClick={() => setFormData({
                          ...formData,
                          favoriteFoods: toggleArrayItem(formData.favoriteFoods, food)
                        })}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          formData.favoriteFoods.includes(food)
                            ? 'bg-pink-100 border-pink-500 dark:bg-pink-900/40 dark:border-pink-600'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-pink-300'
                        }`}
                      >
                        <p className="text-sm font-medium text-center">{food}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campo adicional para outros alimentos */}
                <div className="space-y-3">
                  <Label htmlFor="additionalFoods" className="text-base flex items-center gap-2">
                    ➕ Outros alimentos favoritos (opcional)
                  </Label>
                  <p className="text-sm text-gray-500">Adicione outros alimentos que você ama e não estão listados acima</p>
                  <Input
                    id="additionalFoods"
                    placeholder="Ex: chocolate amargo, pasta de amendoim, iogurte grego..."
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        const newFoods = e.target.value.split(',').map(f => f.trim()).filter(f => f.length > 0)
                        setFormData({
                          ...formData,
                          favoriteFoods: [...new Set([...formData.favoriteFoods, ...newFoods])]
                        })
                        e.target.value = ''
                      }
                    }}
                  />
                </div>

                {/* Alimentos que não gosta */}
                <div className="space-y-3 pt-4 border-t">
                  <Label htmlFor="dislikedFoods" className="text-base flex items-center gap-2">
                    ❌ Alimentos que você NÃO gosta (opcional)
                  </Label>
                  <p className="text-sm text-gray-500">Digite separado por vírgula</p>
                  <Input
                    id="dislikedFoods"
                    placeholder="Ex: brócolis, peixe, iogurte..."
                    value={formData.dislikedFoods.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      dislikedFoods: e.target.value.split(',').map(f => f.trim()).filter(f => f.length > 0)
                    })}
                  />
                </div>

                {/* Resumo das seleções */}
                {formData.favoriteFoods.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium mb-2">✨ Você selecionou {formData.favoriteFoods.length} alimentos favoritos:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.favoriteFoods.slice(0, 10).map((food, idx) => (
                        <span key={idx} className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">
                          {food}
                        </span>
                      ))}
                      {formData.favoriteFoods.length > 10 && (
                        <span className="text-xs text-gray-500">+{formData.favoriteFoods.length - 10} mais</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    <strong>Quase lá!</strong> Com todas essas informações, vamos criar um plano completamente personalizado para você!
                  </p>
                </div>
              </div>
            )}

            {/* Step 12: Prazo da Meta */}
            {currentStep === 12 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                  <h3 className="text-lg font-medium mb-2">Seu prazo para alcançar a meta</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vamos definir um prazo realista e saudável para você alcançar seu peso desejado
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">📊 Sua meta:</p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500">Peso Atual</p>
                        <p className="font-bold text-lg">{formData.weight} kg</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500">Peso Desejado</p>
                        <p className="font-bold text-lg">{formData.goalWeight} kg</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500">Diferença</p>
                        <p className="font-bold text-lg">{Math.abs(parseFloat(formData.weight) - parseFloat(formData.goalWeight)).toFixed(1)} kg</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="goalDeadlineWeeks" className="text-base mb-4 block">
                    Em quanto tempo você quer alcançar essa meta?
                  </Label>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Semanas</span>
                        <span className="text-lg font-bold text-purple-600">{formData.goalDeadlineWeeks} semanas</span>
                      </div>
                      <Input
                        id="goalDeadlineWeeks"
                        type="range"
                        min="4"
                        max="52"
                        step="1"
                        value={formData.goalDeadlineWeeks}
                        onChange={(e) => setFormData({ ...formData, goalDeadlineWeeks: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 mês</span>
                        <span>6 meses</span>
                        <span>1 ano</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>≈ <strong>{Math.floor(formData.goalDeadlineWeeks / 4)} meses</strong></p>
                    </div>
                  </div>
                </div>

                {(() => {
                  const weightDiff = Math.abs(parseFloat(formData.weight) - parseFloat(formData.goalWeight))
                  const weeksSelected = formData.goalDeadlineWeeks
                  const kgPerWeek = weightDiff / weeksSelected

                  let message = ''
                  let messageType: 'success' | 'danger' = 'success'

                  if (kgPerWeek > 1) {
                    message = `⚠️ Perder ${kgPerWeek.toFixed(2)} kg por semana pode ser muito rápido e prejudicial à saúde. Recomendamos um prazo maior (0,5-1 kg/semana é o ideal).`
                    messageType = 'danger'
                  } else if (kgPerWeek >= 0.5 && kgPerWeek <= 1) {
                    message = `✅ Perfeito! Perder ${kgPerWeek.toFixed(2)} kg por semana é um ritmo saudável e sustentável. Você está no caminho certo!`
                    messageType = 'success'
                  } else if (kgPerWeek < 0.5 && kgPerWeek > 0.3) {
                    message = `✨ Ótimo! Perder ${kgPerWeek.toFixed(2)} kg por semana é um ritmo tranquilo e muito saudável. Mantenha a consistência!`
                    messageType = 'success'
                  } else {
                    message = `💪 Seu prazo é bem tranquilo (${kgPerWeek.toFixed(2)} kg/semana). Isso é ótimo para manter hábitos sustentáveis!`
                    messageType = 'success'
                  }

                  return (
                    <div className={`p-4 rounded-lg ${
                      messageType === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                    }`}>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                    </div>
                  )
                })()}

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <strong>💡 Lembre-se:</strong> Uma perda de peso saudável é entre 0,5 a 1 kg por semana. Isso garante que você perca gordura e não músculo, além de ser mais sustentável a longo prazo.
                  </p>
                </div>
              </div>
            )}

            {/* Step 13: Escolha de Dieta */}
            {currentStep === 13 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <Utensils className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                  <h3 className="text-lg font-medium mb-2">Escolha sua dieta</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selecione o tipo de alimentação que mais combina com você ou deixe a IA criar algo totalmente personalizado
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Opção: Criar dieta personalizada (destaque) */}
                  <div
                    onClick={() => setFormData({ ...formData, selectedDietType: 'personalized' })}
                    className={`p-5 border-3 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                      formData.selectedDietType === 'personalized'
                        ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-purple-500 shadow-lg'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.selectedDietType === 'personalized'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedDietType === 'personalized' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          <h4 className="font-bold text-base">Criar a dieta que mais se encaixa para mim</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          Nossa IA vai criar um plano alimentar 100% personalizado baseado nos alimentos que você ama comer no dia a dia, suas restrições e seus objetivos.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">Totalmente personalizado</span>
                          <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-1 rounded">Com seus alimentos favoritos</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 text-gray-500">
                        Ou escolha uma dieta específica
                      </span>
                    </div>
                  </div>

                  {/* Dieta Mediterrânea */}
                  <div
                    onClick={() => setFormData({ ...formData, selectedDietType: 'mediterranean' })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.selectedDietType === 'mediterranean'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.selectedDietType === 'mediterranean'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedDietType === 'mediterranean' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">Dieta Mediterrânea</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          Rica em frutas, vegetais, grãos integrais, azeite de oliva, peixes e proteínas magras. Estilo equilibrado com benefícios para o coração e saúde geral.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Low Carb */}
                  <div
                    onClick={() => setFormData({ ...formData, selectedDietType: 'low-carb' })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.selectedDietType === 'low-carb'
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.selectedDietType === 'low-carb'
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedDietType === 'low-carb' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">Low Carb</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          Redução de carboidratos com foco em proteínas e gorduras saudáveis. Pode ajudar na perda de peso quando acompanhada de atenção nutricional.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DASH */}
                  <div
                    onClick={() => setFormData({ ...formData, selectedDietType: 'dash' })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.selectedDietType === 'dash'
                        ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.selectedDietType === 'dash'
                          ? 'border-teal-500 bg-teal-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedDietType === 'dash' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">Dieta DASH</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          Alimentos ricos em nutrientes, proteínas magras e redução do sódio. Ótima para controle da pressão arterial e saúde geral.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plant-Based */}
                  <div
                    onClick={() => setFormData({ ...formData, selectedDietType: 'plant-based' })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.selectedDietType === 'plant-based'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.selectedDietType === 'plant-based'
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedDietType === 'plant-based' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">Plant-Based (À base de plantas)</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          Foco em alimentos de origem vegetal, leguminosas, grãos, frutas e verduras. Pode ser vegetariana ou vegana conforme sua preferência.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hipocalórica */}
                  <div
                    onClick={() => setFormData({ ...formData, selectedDietType: 'hypocaloric' })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.selectedDietType === 'hypocaloric'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.selectedDietType === 'hypocaloric'
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedDietType === 'hypocaloric' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">Dieta Hipocalórica Equilibrada</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          Plano com foco na redução calórica moderada e sustentável para perda de peso, mantendo todos os nutrientes essenciais.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.selectedDietType && (
                  <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border-2 border-pink-200 dark:border-pink-800">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                          {formData.selectedDietType === 'personalized'
                            ? '✨ Perfeito! Vamos criar sua dieta personalizada'
                            : '✨ Ótima escolha! Seu plano será adaptado'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formData.selectedDietType === 'personalized'
                            ? 'A IA vai analisar todos os alimentos que você selecionou e criar um plano que você realmente vai conseguir seguir no dia a dia, com receitas práticas e gostosas.'
                            : 'Vamos adaptar este tipo de dieta com os alimentos que você gosta, seu prazo e suas necessidades nutricionais para criar um plano personalizado e realista.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={!isStepValid(currentStep, formData) || isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    {currentStep === TOTAL_STEPS ? 'Finalizar' : 'Próximo'}
                    {currentStep < TOTAL_STEPS && <ArrowRight className="w-4 h-4 ml-2" />}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getStepTitle(step: number): string {
  const titles = [
    'Prazer em conhecê-la!',
    'Suas medidas',
    'Sua fase da vida',
    'Sobre seu ciclo',
    'Seus objetivos',
    'Suas dificuldades',
    'Sua rotina',
    'Dados de bioimpedância',
    'Restrições alimentares',
    'Hábitos alimentares',
    'Preferências alimentares',
    'Prazo da sua meta',
    'Escolha sua dieta',
  ]
  return titles[step - 1]
}

function isStepValid(step: number, formData: any): boolean {
  switch (step) {
    case 1:
      return formData.name.length > 0 && formData.age.length > 0
    case 2:
      return formData.weight.length > 0 && formData.height.length > 0 && formData.goalWeight.length > 0
    case 3:
      return formData.lifePhase.length > 0
    case 4:
      return true // Always valid
    case 5:
      return formData.fitnessLevel.length > 0 && formData.goals.length > 0
    case 6:
      return true // Always valid (challenges are optional)
    case 7:
      return formData.exerciseFrequency > 0
    case 8:
      return formData.waist.length > 0 && formData.hips.length > 0 && formData.activityLevel.length > 0
    case 9:
      return true // Always valid (restrictions are optional)
    case 10:
      return formData.mealsPerDay > 0 && formData.cookingSkill.length > 0 && formData.timeForCooking > 0
    case 11:
      return true // Always valid (preferences are optional)
    case 12:
      return formData.goalDeadlineWeeks > 0
    case 13:
      return formData.selectedDietType.length > 0
    default:
      return false
  }
}
