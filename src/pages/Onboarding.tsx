import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useUser, UserProfile, LifePhase, FitnessLevel, Goal } from '@/contexts/UserContext'
import { Heart, ArrowRight, ArrowLeft, Sparkles, HeartCrack } from 'lucide-react'

const TOTAL_STEPS = 11

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
  })

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
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
      onboardingCompleted: true,
    }
    setUserProfile(profile)
    navigate('/')
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
                  <Label htmlFor="goalWeight">Qual seu peso ideal? (kg)</Label>
                  <Input
                    id="goalWeight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 60.0"
                    value={formData.goalWeight}
                    onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                    className="mt-2"
                  />
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
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 4: Menstrual Details (only if menstrual) */}
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
                    <strong>😋 Suas preferências:</strong> Conte o que você AMA comer e o que não gosta. Vamos criar uma dieta deliciosa!
                  </p>
                </div>

                <div>
                  <Label htmlFor="favoriteFoods" className="text-base mb-2 block">
                    Quais alimentos você ADORA? (separe por vírgula)
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">Ex: frango, batata doce, abacate, chocolate amargo</p>
                  <Input
                    id="favoriteFoods"
                    placeholder="Digite os alimentos que você ama..."
                    value={formData.favoriteFoods.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      favoriteFoods: e.target.value.split(',').map(f => f.trim()).filter(f => f.length > 0)
                    })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="dislikedFoods" className="text-base mb-2 block">
                    Quais alimentos você NÃO GOSTA? (separe por vírgula)
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">Ex: brócolis, peixe, iogurte</p>
                  <Input
                    id="dislikedFoods"
                    placeholder="Digite os alimentos que você não gosta..."
                    value={formData.dislikedFoods.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      dislikedFoods: e.target.value.split(',').map(f => f.trim()).filter(f => f.length > 0)
                    })}
                    className="mt-2"
                  />
                </div>

                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    <strong>Quase lá!</strong> Com todas essas informações, vamos criar um plano completamente personalizado para você, usando inteligência artificial para gerar dietas e treinos reais e eficazes!
                  </p>
                </div>
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
                disabled={!isStepValid(currentStep, formData)}
              >
                {currentStep === TOTAL_STEPS ? 'Finalizar' : 'Próximo'}
                {currentStep < TOTAL_STEPS && <ArrowRight className="w-4 h-4 ml-2" />}
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
    default:
      return false
  }
}
