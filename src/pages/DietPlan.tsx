import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser, DietType } from '@/contexts/UserContext'
import { Utensils, Sparkles, Calendar, Target, AlertCircle, Check, TrendingDown, Scale, Clock, ChefHat } from 'lucide-react'

interface DietDescription {
  name: string
  icon: string
  description: string
  benefits: string[]
}

const dietDescriptions: Record<DietType, DietDescription> = {
  'personalized': {
    name: 'Dieta Personalizada',
    icon: '✨',
    description: 'Plano 100% personalizado baseado nos seus alimentos favoritos e preferências',
    benefits: [
      'Criado especialmente para você',
      'Usa seus alimentos favoritos',
      'Respeita suas restrições',
      'Adaptado ao seu estilo de vida'
    ]
  },
  'mediterranean': {
    name: 'Dieta Mediterrânea',
    icon: '🫒',
    description: 'Rica em frutas, vegetais, grãos integrais, azeite, peixes e proteínas magras',
    benefits: [
      'Benefícios para o coração',
      'Rica em antioxidantes',
      'Favorece longevidade',
      'Sabor e variedade'
    ]
  },
  'low-carb': {
    name: 'Low Carb',
    icon: '🥩',
    description: 'Redução de carboidratos com foco em proteínas e gorduras saudáveis',
    benefits: [
      'Controle de insulina',
      'Saciedade prolongada',
      'Perda de peso efetiva',
      'Energia estável'
    ]
  },
  'dash': {
    name: 'Dieta DASH',
    icon: '🥗',
    description: 'Alimentos ricos em nutrientes, proteínas magras e redução do sódio',
    benefits: [
      'Controle da pressão arterial',
      'Saúde cardiovascular',
      'Rica em nutrientes',
      'Equilibrada'
    ]
  },
  'plant-based': {
    name: 'Plant-Based',
    icon: '🌱',
    description: 'Foco em alimentos de origem vegetal, leguminosas, grãos e verduras',
    benefits: [
      'Rica em fibras',
      'Benefícios ambientais',
      'Saúde digestiva',
      'Variedade de nutrientes'
    ]
  },
  'hypocaloric': {
    name: 'Hipocalórica Equilibrada',
    icon: '⚖️',
    description: 'Redução calórica moderada e sustentável para perda de peso',
    benefits: [
      'Perda de peso gradual',
      'Todos os nutrientes',
      'Fácil de seguir',
      'Sustentável'
    ]
  }
}

export default function DietPlan() {
  const { userProfile, updateUserProfile } = useUser()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile?.customDietPlan) {
      setGeneratedPlan(userProfile.customDietPlan)
    }
  }, [userProfile])

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando perfil...</p>
      </div>
    )
  }

  const dietInfo = userProfile.selectedDietType && userProfile.selectedDietType in dietDescriptions
    ? dietDescriptions[userProfile.selectedDietType as DietType]
    : null

  const weightDiff = Math.abs(userProfile.weight - userProfile.goalWeight)
  const weeksToGoal = userProfile.goalDeadlineWeeks || 12
  const kgPerWeek = weightDiff / weeksToGoal

  // Validação de prazo saudável
  const isHealthyPace = kgPerWeek >= 0.3 && kgPerWeek <= 1
  const isTooFast = kgPerWeek > 1
  const recommendedWeeks = isTooFast ? Math.ceil(weightDiff / 0.75) : weeksToGoal

  const generateDietPlan = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Simular geração de plano personalizado
      // Em produção, aqui você chamaria a API da OpenAI ou Claude

      await new Promise(resolve => setTimeout(resolve, 2000)) // Simula processamento

      const plan = `# Seu Plano Alimentar Personalizado

## Informações da Sua Meta
- **Peso Atual:** ${userProfile.weight} kg
- **Peso Desejado:** ${userProfile.goalWeight} kg
- **Diferença:** ${weightDiff.toFixed(1)} kg
- **Prazo:** ${weeksToGoal} semanas (${Math.floor(weeksToGoal / 4)} meses)
- **Ritmo:** ${kgPerWeek.toFixed(2)} kg por semana ${isHealthyPace ? '✅' : isTooFast ? '⚠️' : '✨'}

${isTooFast ? `
### ⚠️ Ajuste Recomendado
Seu prazo pode ser muito curto para uma perda de peso saudável. Recomendamos estender para **${recommendedWeeks} semanas** (≈${Math.floor(recommendedWeeks / 4)} meses) para um ritmo de 0,5-0,75 kg por semana.
` : ''}

## Dieta Escolhida: ${dietInfo?.name}
${dietInfo?.description}

**Benefícios:**
${dietInfo?.benefits.map(b => `- ${b}`).join('\n')}

## Seus Alimentos Favoritos
${userProfile.favoriteFoods && userProfile.favoriteFoods.length > 0
  ? userProfile.favoriteFoods.slice(0, 20).map(f => `- ${f}`).join('\n')
  : 'Nenhum alimento favorito registrado'}

## Restrições Alimentares
${userProfile.dietaryRestrictions && userProfile.dietaryRestrictions.length > 0
  ? userProfile.dietaryRestrictions.map(r => `- ${r}`).join('\n')
  : 'Nenhuma restrição registrada'}

## Plano de Refeições Diário

### Café da Manhã (7h-8h)
- **Opção 1:** Ovo mexido (2 ovos) + Pão integral (2 fatias) + Abacate (1/4)
- **Opção 2:** Aveia (50g) + Banana (1 unidade) + Pasta de amendoim (1 colher)
- **Opção 3:** Tapioca (2 colheres de goma) + Queijo branco (30g) + Tomate

### Lanche da Manhã (10h)
- **Opção 1:** Iogurte natural (1 pote) + Morango (5 unidades)
- **Opção 2:** Castanhas (1 punhado - 30g)
- **Opção 3:** Maçã + Amendoim (10 unidades)

### Almoço (12h-13h)
- **Opção 1:** Arroz integral (4 colheres) + Feijão preto (1 concha) + Peito de frango grelhado (120g) + Salada verde à vontade
- **Opção 2:** Batata-doce (1 média) + Carne moída refogada (100g) + Brócolis + Cenoura
- **Opção 3:** Macarrão integral (3 colheres) + Atum (1 lata) + Legumes refogados

### Lanche da Tarde (16h)
- **Opção 1:** Pão integral com queijo branco
- **Opção 2:** Frutas variadas (mamão, banana, laranja)
- **Opção 3:** Cuscuz com ovo cozido

### Jantar (19h-20h)
- **Opção 1:** Omelete (2 ovos) + Salada verde + Batata inglesa cozida (1 média)
- **Opção 2:** Peixe grelhado (150g) + Quinoa (3 colheres) + Abobrinha refogada
- **Opção 3:** Frango desfiado (100g) + Arroz integral (3 colheres) + Vagem

### Ceia (antes de dormir - opcional)
- Iogurte natural ou chá calmante

## Macronutrientes Estimados (por dia)
- **Calorias:** ${userProfile.dailyCalories || 'Não calculado'} kcal
- **Proteínas:** ${userProfile.proteinGoal || 'Não calculado'} g
- **Carboidratos:** ${userProfile.carbsGoal || 'Não calculado'} g
- **Gorduras:** ${userProfile.fatsGoal || 'Não calculado'} g

## Dicas Importantes

### Hidratação 💧
- Beba pelo menos ${userProfile.waterGoal || 2.5} litros de água por dia
- Use a aba "Rotina" do app para controlar sua hidratação

### Consistência é a Chave 🔑
- Não precisa ser perfeito todos os dias
- O importante é manter uma rotina na maioria dos dias
- Permita-se refeições livres 1-2x por semana

### Atenção aos Sinais do Corpo 🎯
- Se sentir muita fome, aumente as porções de vegetais
- Se sentir fraqueza, reveja a quantidade de carboidratos
- Sempre priorize alimentos naturais e minimamente processados

### Acompanhamento 📊
- Registre seu peso semanalmente (sempre no mesmo dia e horário)
- Tire fotos mensais para acompanhar mudanças visuais
- Use a aba "Progresso" para ver sua evolução

## ⚠️ Importante
Este é um plano alimentar educativo e não substitui a consulta com um nutricionista. Para resultados otimizados e seguros, busque acompanhamento profissional.

---

**💜 Você consegue!** Lembre-se: mudanças sustentáveis levam tempo. Foque na consistência, não na perfeição.
`

      setGeneratedPlan(plan)
      await updateUserProfile({ customDietPlan: plan })

    } catch (err: any) {
      console.error('Erro ao gerar plano:', err)
      setError('Não foi possível gerar o plano. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--tiffany)] to-[var(--lilac)] rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Seu Plano Alimentar</h1>
        <p className="text-pink-100">
          Dieta personalizada para alcançar seus objetivos com saúde
        </p>
      </div>

      {/* Resumo da Meta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--lilac)]" />
            Resumo da Sua Meta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Scale className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xs text-gray-500">Peso Atual</p>
              <p className="text-xl font-bold">{userProfile.weight} kg</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Target className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-xs text-gray-500">Meta</p>
              <p className="text-xl font-bold">{userProfile.goalWeight} kg</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-xs text-gray-500">A perder</p>
              <p className="text-xl font-bold">{weightDiff.toFixed(1)} kg</p>
            </div>
            <div className="p-4 bg-[var(--tiffany-light)] dark:bg-purple-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-[var(--lilac)] mb-2" />
              <p className="text-xs text-gray-500">Prazo</p>
              <p className="text-xl font-bold">{Math.floor(weeksToGoal / 4)}m</p>
            </div>
          </div>

          {/* Validação do Prazo */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Ritmo de perda de peso</span>
              <span className="text-sm text-gray-500">{kgPerWeek.toFixed(2)} kg/semana</span>
            </div>
            <Progress value={Math.min((kgPerWeek / 1) * 100, 100)} className="h-2" />

            {isTooFast && (
              <Alert className="mt-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm">
                  <strong>Atenção:</strong> Seu prazo pode ser muito curto. Recomendamos estender para <strong>{recommendedWeeks} semanas</strong> (≈{Math.floor(recommendedWeeks / 4)} meses) para uma perda de peso mais saudável (0,5-0,75 kg/semana).
                </AlertDescription>
              </Alert>
            )}

            {isHealthyPace && (
              <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-900/20">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm">
                  <strong>Perfeito!</strong> Seu prazo está dentro do ritmo saudável recomendado de 0,5-1 kg por semana.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dieta Escolhida */}
      {dietInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[var(--coral)]" />
              Dieta Escolhida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="text-5xl">{dietInfo.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{dietInfo.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{dietInfo.description}</p>

                <div className="space-y-2">
                  <p className="font-semibold text-sm">Benefícios principais:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {dietInfo.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suas Preferências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-500" />
            Suas Preferências Alimentares
          </CardTitle>
          <CardDescription>
            {userProfile.favoriteFoods?.length || 0} alimentos favoritos • {userProfile.mealsPerDay || 3} refeições/dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="favorites">Favoritos</TabsTrigger>
              <TabsTrigger value="restrictions">Restrições</TabsTrigger>
              <TabsTrigger value="habits">Hábitos</TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="space-y-3">
              {userProfile.favoriteFoods && userProfile.favoriteFoods.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.favoriteFoods.slice(0, 30).map((food, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {food}
                    </Badge>
                  ))}
                  {userProfile.favoriteFoods.length > 30 && (
                    <Badge variant="outline" className="text-xs">
                      +{userProfile.favoriteFoods.length - 30} mais
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum alimento favorito registrado</p>
              )}
            </TabsContent>

            <TabsContent value="restrictions" className="space-y-3">
              {userProfile.dietaryRestrictions && userProfile.dietaryRestrictions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.dietaryRestrictions.map((restriction, idx) => (
                    <Badge key={idx} variant="destructive" className="text-xs">
                      {restriction}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhuma restrição alimentar</p>
              )}

              {userProfile.dislikedFoods && userProfile.dislikedFoods.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Alimentos que não gosta:</p>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.dislikedFoods.map((food, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="habits" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Refeições/dia</p>
                  <p className="text-lg font-bold">{userProfile.mealsPerDay || 3}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Habilidade culinária</p>
                  <p className="text-lg font-bold capitalize">{userProfile.cookingSkill || 'Intermediário'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Tempo para cozinhar</p>
                  <p className="text-lg font-bold">{userProfile.timeForCooking || 30} min</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Come fora</p>
                  <p className="text-lg font-bold capitalize">{userProfile.eatsOutFrequency || 'Às vezes'}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Botão de Gerar Plano */}
      {!generatedPlan && (
        <Card className="border-2 border-[var(--tiffany)] dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Sparkles className="w-16 h-16 mx-auto text-[var(--lilac)]" />
              <h3 className="text-xl font-bold">Pronta para o próximo passo?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Clique no botão abaixo para gerar seu plano alimentar personalizado completo
              </p>
              <Button
                onClick={generateDietPlan}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-[var(--tiffany)] to-[var(--lilac)] hover:from-pink-600 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando seu plano...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Meu Plano Alimentar
                  </>
                )}
              </Button>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plano Gerado */}
      {generatedPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--lilac)]" />
                Seu Plano Alimentar Completo
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={generateDietPlan}
                disabled={isGenerating}
              >
                {isGenerating ? 'Regenerando...' : 'Regenerar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-2">
              {generatedPlan.split('\n').map((line, idx) => {
                if (line.startsWith('# ')) {
                  return <h1 key={idx} className="text-2xl font-bold mt-6 mb-4">{line.substring(2)}</h1>
                } else if (line.startsWith('## ')) {
                  return <h2 key={idx} className="text-xl font-bold mt-5 mb-3">{line.substring(3)}</h2>
                } else if (line.startsWith('### ')) {
                  return <h3 key={idx} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>
                } else if (line.startsWith('- ')) {
                  return <p key={idx} className="ml-4 my-1 flex items-start gap-2"><span className="text-[var(--lilac)] font-bold">•</span><span>{line.substring(2)}</span></p>
                } else if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={idx} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>
                } else if (line.trim() === '---') {
                  return <hr key={idx} className="my-6 border-gray-300 dark:border-gray-700" />
                } else if (line.trim() === '') {
                  return <div key={idx} className="h-2" />
                } else {
                  return <p key={idx} className="my-2">{line}</p>
                }
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      {generatedPlan && (
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 border-[var(--lilac)] dark:border-pink-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-bold">🎉 Seu plano está pronto!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Agora é hora de colocar em prática. Lembre-se: consistência é mais importante que perfeição!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <Clock className="w-4 h-4 mr-2" />
                  Ver Plano Novamente
                </Button>
                <Button className="bg-gradient-to-r from-[var(--tiffany)] to-[var(--lilac)]">
                  <Target className="w-4 h-4 mr-2" />
                  Começar Agora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
