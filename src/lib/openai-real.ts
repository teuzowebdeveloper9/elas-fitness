import OpenAI from 'openai'

// Tentar com prefixo VITE_ primeiro, depois sem prefixo como fallback
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY

// Log para debug
console.log('[OpenAI Config] Verificando chave...')
console.log('[OpenAI Config] VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? '✓ Presente' : '✗ Faltando')
console.log('[OpenAI Config] OPENAI_API_KEY:', import.meta.env.OPENAI_API_KEY ? '✓ Presente' : '✗ Faltando')
console.log('[OpenAI Config] Chave final:', OPENAI_API_KEY ? 'Sim ✓' : 'Não ✗')

// Inicializar cliente OpenAI apenas se a chave existir
const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Necessário para uso no navegador
}) : null

// Flag para saber se a OpenAI está disponível
export const hasOpenAI = !!OPENAI_API_KEY

if (!hasOpenAI) {
  console.warn('⚠️ VITE_OPENAI_API_KEY não configurada. Usando cálculos locais sem IA.')
  console.warn('📝 Adicione VITE_OPENAI_API_KEY no arquivo .env.local')
} else {
  console.log('✅ OpenAI configurada e pronta para uso!')
}

export interface BioimpedanceData {
  weight: number
  height: number
  age: number
  gender: 'female'
  activityLevel: string
  goals: string[]
}

export interface NutritionData {
  idealWeight: number
  dailyCalories: number
  protein: number
  carbs: number
  fats: number
  bmi: number
  bodyFatPercentage?: number
  waterGoal?: number // Meta de água em litros
}

/**
 * Calcula dados de bioimpedância usando IA + fórmulas nutricionais
 */
export async function calculateBioimpedance(data: BioimpedanceData): Promise<NutritionData> {
  const heightInMeters = data.height / 100
  const bmi = data.weight / (heightInMeters * heightInMeters)

  // Cálculo do peso ideal usando fórmula de Robinson
  const idealWeight = 49 + (1.7 * (data.height - 152.4) / 2.54)

  // Fator de atividade
  const activityFactors: Record<string, number> = {
    'sedentaria': 1.2,
    'leve': 1.375,
    'moderada': 1.55,
    'intensa': 1.725,
    'muito-intensa': 1.9
  }
  const activityFactor = activityFactors[data.activityLevel] || 1.375

  // TMB (Taxa Metabólica Basal) - Fórmula Mifflin-St Jeor para mulheres
  const tmb = (10 * data.weight) + (6.25 * data.height) - (5 * data.age) - 161

  // Calorias diárias baseadas em atividade
  let dailyCalories = Math.round(tmb * activityFactor)

  // Ajuste MODERADO baseado nos objetivos (sem radicalismos)
  if (data.goals.includes('perder-peso')) {
    dailyCalories -= 300 // Déficit MODERADO para perda de peso saudável
  } else if (data.goals.includes('ganhar-massa')) {
    dailyCalories += 300 // Superávit para ganho muscular
  }

  // Garantir mínimo de calorias para saúde (nunca abaixo de 1200 kcal)
  dailyCalories = Math.max(1200, dailyCalories)

  // Calcular meta de água baseada em peso e atividade
  // Fórmula: 35ml por kg de peso corporal + ajuste por atividade
  let waterGoal = (data.weight * 35) / 1000 // Converte ml para litros

  // Ajuste baseado no nível de atividade
  const activityWaterBonus: Record<string, number> = {
    'sedentaria': 0,
    'leve': 0.3,
    'moderada': 0.5,
    'intensa': 0.8,
    'muito-intensa': 1.0
  }
  waterGoal += activityWaterBonus[data.activityLevel] || 0.3

  // Arredondar para 1 casa decimal
  waterGoal = Math.round(waterGoal * 10) / 10

  // Cálculos nutricionais baseados em fórmulas científicas
  const protein = Math.round(data.weight * 1.6) // 1.6g por kg para mulheres ativas
  const fats = Math.round((dailyCalories * 0.25) / 9) // 25% das calorias em gorduras
  const carbs = Math.round((dailyCalories - (protein * 4) - (fats * 9)) / 4) // Restante em carboidratos

  const result = {
    idealWeight: parseFloat(idealWeight.toFixed(1)),
    dailyCalories,
    protein,
    carbs,
    fats,
    bmi: parseFloat(bmi.toFixed(1)),
    bodyFatPercentage: parseFloat(((1.2 * bmi) + (0.23 * data.age) - 5.4).toFixed(1)),
    waterGoal
  }

  // Tentar usar IA para refinar recomendações (se disponível)
  if (hasOpenAI && openai) {
    try {
      const prompt = `Como nutricionista especializada em mulheres, analise estes dados:
- Peso: ${data.weight}kg, Altura: ${data.height}cm, Idade: ${data.age} anos
- Nível de atividade: ${data.activityLevel}
- Objetivos: ${data.goals.join(', ')}
- TMB calculada: ${tmb} kcal
- Calorias diárias: ${dailyCalories} kcal
- Meta de água calculada: ${waterGoal}L

DIRETRIZES OBRIGATÓRIAS:
1. MODERAÇÃO CALÓRICA: Crie um plano EQUILIBRADO e SUSTENTÁVEL
2. NUNCA sugerir déficits extremos (mínimo 1200 kcal)
3. INCLUIR carboidratos em níveis saudáveis (não restringir)
4. Garantir energia suficiente para o dia todo
5. Foco em saúde, não em restrições radicais

Responda APENAS com JSON:
{"protein": número, "carbs": número, "fats": número, "adjustedCalories": número, "waterGoal": número_em_litros}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      })

      const aiResponse = JSON.parse(completion.choices[0].message.content || '{}')

      // Atualizar com valores refinados pela IA
      if (aiResponse.protein) result.protein = aiResponse.protein
      if (aiResponse.carbs) result.carbs = aiResponse.carbs
      if (aiResponse.fats) result.fats = aiResponse.fats
      if (aiResponse.adjustedCalories) result.dailyCalories = aiResponse.adjustedCalories
      if (aiResponse.waterGoal) result.waterGoal = aiResponse.waterGoal

      console.log('✅ Cálculos refinados com IA')
    } catch (error) {
      console.warn('⚠️ Erro ao usar IA, usando cálculos locais:', error)
    }
  } else {
    console.log('✅ Usando cálculos nutricionais (sem IA)')
  }

  return result
}

export interface DietGenerationData {
  userProfile: {
    name: string
    age: number
    weight: number
    height: number
    goalWeight: number
    goals: string[]
    lifePhase: string
    fitnessLevel: string
  }
  nutritionData: NutritionData
  foodPreferences: {
    dietaryRestrictions: string[]
    favoriteFoods?: string[]
    dislikedFoods?: string[]
    mealsPerDay: number
    cookingSkill?: string
    timeForCooking?: number
  }
}

/**
 * Gera plano alimentar personalizado usando OpenAI com fallback
 */
export async function generatePersonalizedDiet(data: DietGenerationData) {
  // Se OpenAI não estiver configurada, pular direto para fallback
  if (!hasOpenAI || !openai) {
    console.log('📝 Gerando plano alimentar básico (OpenAI não configurada)')
    throw new Error('OpenAI not configured - usando fallback')
  }

  // Tentar gerar com IA
  try {
    // Preparar lista de restrições de forma clara
    const restrictions = data.foodPreferences.dietaryRestrictions || []
    const restrictionsText = restrictions.length > 0
      ? restrictions.join(', ')
      : 'Nenhuma'

    // Criar lista de alimentos a evitar com base nas restrições
    const foodsToAvoid: string[] = []
    if (restrictions.includes('intolerancia-lactose') ||
        restrictions.includes('lactose')) {
      foodsToAvoid.push('leite', 'iogurte comum', 'queijo comum', 'creme de leite', 'manteiga', 'produtos lácteos')
    }
    if (restrictions.includes('vegetariana') ||
        restrictions.includes('vegetarian')) {
      foodsToAvoid.push('carne', 'frango', 'peixe', 'porco', 'qualquer proteína animal')
    }
    if (restrictions.includes('vegana') ||
        restrictions.includes('vegan')) {
      foodsToAvoid.push('carne', 'frango', 'peixe', 'ovos', 'leite', 'queijo', 'mel', 'qualquer produto de origem animal')
    }

    const avoidText = foodsToAvoid.length > 0
      ? `\n\n🚫 ALIMENTOS PROIBIDOS (NUNCA incluir): ${foodsToAvoid.join(', ')}`
      : ''

    const prompt = `Crie um plano alimentar de 7 dias PERSONALIZADO em JSON para:

PERFIL:
- Nome: ${data.userProfile.name}
- Calorias: ${data.nutritionData.dailyCalories} kcal/dia
- Proteína: ${data.nutritionData.protein}g
- Carboidratos: ${data.nutritionData.carbs}g
- Gorduras: ${data.nutritionData.fats}g

RESTRIÇÕES ALIMENTARES: ${restrictionsText}${avoidText}

🎯 DIRETRIZES OBRIGATÓRIAS:
1. MODERAÇÃO CALÓRICA: Plano equilibrado, NUNCA muito restritivo
2. INCLUIR carboidratos em TODAS as refeições (sem low carb radical)
3. RESPEITAR TOTALMENTE as restrições alimentares (NUNCA incluir alimentos proibidos)
4. Se intolerância à lactose: usar alternativas sem lactose (leite sem lactose, iogurte sem lactose, queijos sem lactose)
5. Plano ACOLHEDOR e SUSTENTÁVEL (não radical)
6. Refeições variadas e saborosas
7. Porções realistas e satisfatórias

Formato JSON (sem texto extra):
{
  "diet_name": "string",
  "description": "string",
  "meal_plan": {
    "monday": {
      "breakfast": {"name": "string", "foods": ["string"], "calories": number, "protein": number, "carbs": number, "fats": number},
      "lunch": {"name": "string", "foods": ["string"], "calories": number, "protein": number, "carbs": number, "fats": number},
      "dinner": {"name": "string", "foods": ["string"], "calories": number, "protein": number, "carbs": number, "fats": number},
      "snacks": [{"name": "string", "calories": number}]
    }
  },
  "shopping_list": ["string"],
  "tips": ["string"]
}
Repita para tuesday, wednesday, thursday, friday, saturday, sunday.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é uma nutricionista especializada. Respeite TOTALMENTE as restrições alimentares. Nunca inclua alimentos que a pessoa não pode comer. Responda APENAS com JSON válido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3500,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0].message.content || '{}'
    const response = JSON.parse(content)

    if (!response.meal_plan) {
      throw new Error('Resposta inválida')
    }

    return response
  } catch (error) {
    console.error('Erro ao gerar dieta com IA, usando fallback:', error)
    return generateDietFallback(data)
  }
}

/**
 * Fallback para geração de dieta
 */
function generateDietFallback(data: DietGenerationData) {
  const caloriesPerMeal = Math.round(data.nutritionData.dailyCalories / 3)
  const proteinPerMeal = Math.round(data.nutritionData.protein / 3)

  return {
    diet_name: `Plano ${data.userProfile.name}`,
    description: `${data.nutritionData.dailyCalories} kcal • ${data.nutritionData.protein}g proteína`,
    meal_plan: {
      monday: {
        breakfast: {
          name: "Omelete com Aveia",
          foods: ["2 ovos", "3 col aveia", "Frutas"],
          calories: Math.round(caloriesPerMeal * 0.3),
          protein: Math.round(proteinPerMeal * 0.3),
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        lunch: {
          name: "Frango Grelhado com Arroz Integral",
          foods: ["150g frango", "1 xíc arroz integral", "Salada", "Legumes"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.4),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        dinner: {
          name: "Salmão com Batata Doce",
          foods: ["150g salmão", "150g batata doce", "Brócolis"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.4)
        },
        snacks: [
          { name: "Iogurte grego", calories: 150 },
          { name: "Castanhas", calories: 100 }
        ]
      },
      tuesday: {
        breakfast: {
          name: "Tapioca com Queijo",
          foods: ["2 col tapioca", "Queijo branco", "Mamão"],
          calories: Math.round(caloriesPerMeal * 0.3),
          protein: Math.round(proteinPerMeal * 0.3),
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        lunch: {
          name: "Carne Moída com Quinoa",
          foods: ["150g carne moída", "1 xíc quinoa", "Salada"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.4),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        dinner: {
          name: "Tilápia com Legumes",
          foods: ["150g tilápia", "Legumes assados", "Salada"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.4)
        },
        snacks: [
          { name: "Whey protein", calories: 120 },
          { name: "Banana", calories: 90 }
        ]
      },
      wednesday: {
        breakfast: {
          name: "Panqueca Proteica",
          foods: ["2 ovos", "Banana", "Aveia"],
          calories: Math.round(caloriesPerMeal * 0.3),
          protein: Math.round(proteinPerMeal * 0.3),
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        lunch: {
          name: "Frango com Batata Doce",
          foods: ["150g frango", "200g batata doce", "Salada"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.4),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        dinner: {
          name: "Omelete com Salada",
          foods: ["3 ovos", "Queijo", "Salada verde"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.4)
        },
        snacks: [
          { name: "Maçã com pasta amendoim", calories: 180 },
          { name: "Queijo cottage", calories: 90 }
        ]
      },
      thursday: {
        breakfast: {
          name: "Vitamina Proteica",
          foods: ["Whey", "Banana", "Aveia", "Leite"],
          calories: Math.round(caloriesPerMeal * 0.3),
          protein: Math.round(proteinPerMeal * 0.3),
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        lunch: {
          name: "Carne com Arroz e Feijão",
          foods: ["150g carne", "Arroz", "Feijão", "Salada"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.4),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        dinner: {
          name: "Frango com Legumes",
          foods: ["150g frango", "Mix de legumes", "Salada"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.4)
        },
        snacks: [
          { name: "Iogurte com granola", calories: 150 },
          { name: "Frutas", calories: 80 }
        ]
      },
      friday: {
        breakfast: {
          name: "Pão Integral com Ovo",
          foods: ["2 fatias pão integral", "2 ovos", "Abacate"],
          calories: Math.round(caloriesPerMeal * 0.3),
          protein: Math.round(proteinPerMeal * 0.3),
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        lunch: {
          name: "Salmão com Arroz",
          foods: ["150g salmão", "Arroz integral", "Brócolis"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.4),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        dinner: {
          name: "Wrap de Frango",
          foods: ["Wrap integral", "Frango", "Salada"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.4)
        },
        snacks: [
          { name: "Castanhas", calories: 140 },
          { name: "Iogurte", calories: 100 }
        ]
      },
      saturday: {
        breakfast: {
          name: "Açaí Bowl",
          foods: ["100g açaí", "Banana", "Granola", "Mel"],
          calories: Math.round(caloriesPerMeal * 0.3),
          protein: Math.round(proteinPerMeal * 0.3),
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        lunch: {
          name: "Frango Assado com Mandioca",
          foods: ["150g frango", "Mandioca", "Salada"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.4),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        dinner: {
          name: "Pizza Fit",
          foods: ["Massa integral", "Frango", "Queijo", "Vegetais"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.4)
        },
        snacks: [
          { name: "Pipoca", calories: 100 },
          { name: "Chocolate 70%", calories: 100 }
        ]
      },
      sunday: {
        breakfast: {
          name: "Crepioca",
          foods: ["1 ovo", "Tapioca", "Queijo", "Peito peru"],
          calories: Math.round(caloriesPerMeal * 0.3),
          protein: Math.round(proteinPerMeal * 0.3),
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        lunch: {
          name: "Churrasco Fit",
          foods: ["150g carne magra", "Farofa", "Vinagrete"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.4),
          fats: Math.round(data.nutritionData.fats * 0.3)
        },
        dinner: {
          name: "Sopa de Legumes",
          foods: ["Frango", "Legumes", "Batata", "Caldo"],
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(data.nutritionData.carbs * 0.3),
          fats: Math.round(data.nutritionData.fats * 0.4)
        },
        snacks: [
          { name: "Frutas variadas", calories: 120 },
          { name: "Queijo cottage", calories: 90 }
        ]
      }
    },
    shopping_list: [
      "Frango (1kg)", "Ovos (dúzia)", "Salmão (500g)", "Carne moída (500g)",
      "Arroz integral", "Batata doce", "Aveia", "Tapioca", "Quinoa",
      "Frutas variadas", "Vegetais", "Saladas", "Queijo branco", "Iogurte grego"
    ],
    tips: [
      "Beba 2-3L de água por dia",
      "Faça refeições a cada 3-4 horas",
      "Prepare as marmitas no domingo",
      "Ajuste porções conforme sua fome"
    ]
  }
}

export interface WorkoutGenerationData {
  userProfile: {
    name: string
    age: number
    fitnessLevel: string
    goals: string[]
    lifePhase: string
    exerciseFrequency: number
    challenges: string[]
    healthConditions: string[]
    usesDailyFeedback?: boolean // TRUE para DIU e ciclo irregular
  }
  workoutPreferences: {
    workoutType: string
    mobilityType: string
    availableTime: number
    muscleGroup?: string
    equipmentAvailable?: string[]
  }
  dailyFeedback?: {
    // Feedback diário para personalização (usado quando usesDailyFeedback = true)
    energyLevel?: 'low' | 'medium' | 'high' // Nível de energia hoje
    mood?: 'sad' | 'neutral' | 'happy' // Humor
    physicalFeeling?: 'pain' | 'tired' | 'good' | 'great' // Como está se sentindo fisicamente
    sleepQuality?: 'poor' | 'ok' | 'good' | 'excellent' // Qualidade do sono
    stressLevel?: 'low' | 'medium' | 'high' // Nível de estresse
  }
}

/**
 * Gera treino personalizado usando OpenAI com fallback
 */
export async function generatePersonalizedWorkout(data: WorkoutGenerationData, _userId?: string) {
  // Tentar gerar com IA primeiro
  try {
    const muscleGroupText = data.workoutPreferences.muscleGroup && data.workoutPreferences.muscleGroup !== 'nenhum'
      ? `\n- Foco muscular: ${data.workoutPreferences.muscleGroup}`
      : ''

    // Preparar texto sobre personalização baseada em ciclo ou feedback diário
    let personalizationText = ''
    if (data.userProfile.usesDailyFeedback && data.dailyFeedback) {
      // Usar feedback diário para personalizar (DIU ou ciclo irregular)
      personalizationText = `

🎯 PERSONALIZAÇÃO BASEADA EM FEEDBACK DIÁRIO (NÃO usar ciclo hormonal):
- Energia hoje: ${data.dailyFeedback.energyLevel || 'não informada'}
- Humor: ${data.dailyFeedback.mood || 'não informado'}
- Sentindo-se: ${data.dailyFeedback.physicalFeeling || 'não informado'}
- Qualidade do sono: ${data.dailyFeedback.sleepQuality || 'não informada'}
- Nível de estresse: ${data.dailyFeedback.stressLevel || 'não informado'}

⚠️ IMPORTANTE: Esta usuária usa DIU ou tem ciclo irregular. NÃO faça adaptações baseadas em fases hormonais.
ADAPTE o treino EXCLUSIVAMENTE com base no feedback diário acima sobre como ela está se sentindo HOJE.

REGRAS DE ADAPTAÇÃO:
- Energia baixa → Treino mais leve, menos séries, mais descanso
- Energia alta → Pode aumentar intensidade
- Dor/cansaço físico → Foco em mobilidade e alongamento, evitar sobrecarga
- Estresse alto → Priorizar exercícios relaxantes, yoga, alongamento
- Sono ruim → Treino moderado, não forçar`
    } else {
      // Usar ciclo hormonal tradicional
      personalizationText = `

📅 PERSONALIZAÇÃO BASEADA EM CICLO HORMONAL:
- Fase da vida: ${data.userProfile.lifePhase}
- Adapte considerando as fases hormonais naturais da mulher`
    }

    // Mapear nível para português
    const nivelMap: Record<string, string> = {
      'beginner': 'INICIANTE',
      'intermediate': 'INTERMEDIÁRIO',
      'advanced': 'AVANÇADO'
    }
    const nivelAtual = nivelMap[data.userProfile.fitnessLevel] || 'INICIANTE'

    // Exercícios apropriados por nível
    const exerciciosPorNivel = {
      'INICIANTE': `
EXERCÍCIOS PERMITIDOS PARA INICIANTE (escolha APENAS destes):
- Agachamento livre (sem peso ou com barra leve)
- Leg Press 45° (carga leve)
- Cadeira extensora
- Cadeira flexora (mesa flexora)
- Elevação pélvica (ponte de glúteo)
- Panturrilha em pé
- Remada sentada na máquina
- Pulldown (puxada na polia)
- Supino na máquina ou com halteres leves
- Crucifixo na máquina
- Desenvolvimento com halteres leves
- Elevação lateral (halteres leves)
- Rosca direta com barra ou halteres
- Tríceps na polia (corda)
- Abdominal reto (crunch)
- Prancha (30-45 segundos)
- Esteira (caminhada/trote leve)
- Bicicleta ergométrica

IMPORTANTE PARA INICIANTE:
- Use APENAS exercícios da lista acima
- Máximo 3-4 séries por exercício
- Repetições: 12-15 (nunca menos)
- Descanso: 60-90 segundos entre séries
- Cargas LEVES (foco na técnica)
- Movimentos simples e seguros
- Evitar exercícios complexos ou com muita técnica`,

      'INTERMEDIÁRIO': `
EXERCÍCIOS PERMITIDOS PARA INTERMEDIÁRIO (escolha APENAS destes):
- Agachamento livre com barra
- Leg Press 45° (carga moderada)
- Agachamento sumô
- Stiff (barra ou halteres)
- Avanço (afundo com halteres)
- Cadeira abdutora/adutora
- Mesa flexora
- Panturrilha no leg press
- Remada curvada com barra
- Remada sentada no cabo
- Pulldown pegada aberta
- Barra fixa assistida
- Supino reto com barra
- Supino inclinado com halteres
- Crucifixo no banco
- Desenvolvimento militar
- Elevação lateral + frontal
- Rosca direta + alternada
- Rosca martelo
- Tríceps testa (francês)
- Tríceps na polia
- Abdominal bicicleta
- Prancha (45-60 segundos)
- Elevação de pernas

IMPORTANTE PARA INTERMEDIÁRIO:
- 3-4 séries por exercício
- Repetições: 10-15
- Descanso: 45-60 segundos
- Cargas moderadas (pode aumentar gradualmente)
- Pode fazer exercícios compostos`,

      'AVANÇADO': `
EXERCÍCIOS PERMITIDOS PARA AVANÇADO (escolha APENAS destes):
- Agachamento livre (barra alta/baixa)
- Agachamento búlgaro
- Leg Press 45° (carga alta)
- Hack squat
- Stiff com barra
- Levantamento terra (deadlift)
- Avanço com barra
- Hip thrust (elevação pélvica com carga)
- Remada curvada (pegadas variadas)
- Remada cavalinho
- Barra fixa
- Pullover
- Supino reto/inclinado/declinado
- Supino com halteres
- Crucifixo (variações)
- Desenvolvimento militar/Arnold press
- Elevação lateral + frontal + posterior
- Rosca 21
- Rosca concentrada
- Tríceps testa com barra
- Mergulho (dips)
- Abdominal completo
- Prancha (60+ segundos)
- Elevação de pernas suspensa

IMPORTANTE PARA AVANÇADO:
- 4-5 séries por exercício
- Repetições: 8-12 (força) ou 12-15 (hipertrofia)
- Descanso: 45-60 segundos
- Cargas desafiadoras
- Pode fazer drop sets ou supersets`
    }

    const exerciciosNivel = exerciciosPorNivel[nivelAtual]

    const prompt = `Você é uma personal trainer brasileira especializada em treinos femininos. Crie um treino SIMPLES e REALISTA para academia brasileira.

PERFIL:
- Nome: ${data.userProfile.name}
- Idade: ${data.userProfile.age} anos
- Nível: ${nivelAtual}
- Fase da vida: ${data.userProfile.lifePhase}
- Objetivos: ${data.userProfile.goals.join(', ')}

TREINO:
- Tipo: ${data.workoutPreferences.workoutType}
- Tempo: ${data.workoutPreferences.availableTime} minutos${muscleGroupText}
${personalizationText}

${exerciciosNivel}

🎯 REGRAS OBRIGATÓRIAS:
1. Use APENAS exercícios da lista acima para o nível ${nivelAtual}
2. Respeite RIGOROSAMENTE as diretrizes de séries, reps e descanso do nível
3. Exercícios CONHECIDOS e SIMPLES que todo mundo faz na academia brasileira
4. Nomes em PORTUGUÊS (sem termos técnicos em inglês)
5. O treino deve ser APROPRIADO e SEGURO para o nível ${nivelAtual}
6. ${data.workoutPreferences.availableTime <= 30 ? 'Treino CURTO - máximo 5-6 exercícios' : data.workoutPreferences.availableTime <= 45 ? 'Treino médio - máximo 7-8 exercícios' : 'Treino completo - 8-10 exercícios'}
7. FACILITAR, não dificultar! O conceito é treino que funciona e é sustentável

${muscleGroupText ? 'IMPORTANTE: Priorize exercícios para o grupo muscular escolhido, mas use APENAS exercícios permitidos para o nível.' : ''}

Responda APENAS com JSON válido (sem texto adicional):
{
  "workout_name": "string",
  "description": "string",
  "duration_minutes": number,
  "estimated_calories": number,
  "workout_plan": {
    "warmup": [{"name": "string", "duration": "string", "description": "string"}],
    "main_exercises": [{"name": "string", "sets": "string", "reps": "string", "rest": "string", "description": "string", "calories": number}],
    "mobility_exercises": [],
    "cooldown": [{"name": "string", "duration": "string", "description": "string"}]
  },
  "equipment_needed": ["string"],
  "tips": ["string"],
  "adaptations": ["string"]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é uma personal trainer especializada. Responda APENAS com JSON válido, sem texto adicional.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0].message.content || '{}'
    const response = JSON.parse(content)

    // Validar resposta
    if (!response.workout_name || !response.workout_plan) {
      throw new Error('Resposta inválida da IA')
    }

    return response
  } catch (error) {
    console.error('Erro ao gerar treino com IA, usando fallback:', error)

    // FALLBACK: Usar templates locais
    return generateWorkoutFallback(data)
  }
}

/**
 * Fallback para geração de treino quando IA falha
 */
function generateWorkoutFallback(data: WorkoutGenerationData) {
  const estimatedCalories = Math.round((data.workoutPreferences.availableTime / 60) * 300)
  const isIniciante = data.userProfile.fitnessLevel === 'beginner'
  const isIntermediario = data.userProfile.fitnessLevel === 'intermediate'

  // Templates adaptados por nível
  const workoutTemplates: Record<string, any> = {
    musculacao: {
      warmup: [
        { name: "Esteira leve", duration: "5 min", description: "Caminhada ou trote leve para aquecer" },
        { name: "Alongamento dinâmico", duration: "3 min", description: "Movimentos de braços e pernas" }
      ],
      main_exercises: isIniciante ? [
        { name: "Leg Press 45°", sets: "3", reps: "15", rest: "90s", description: "Carga leve, empurre com os calcanhares", calories: 45 },
        { name: "Cadeira extensora", sets: "3", reps: "15", rest: "60s", description: "Trabalha frente da coxa", calories: 35 },
        { name: "Mesa flexora", sets: "3", reps: "12", rest: "60s", description: "Trabalha parte de trás da coxa", calories: 30 },
        { name: "Elevação pélvica", sets: "3", reps: "15", rest: "60s", description: "Ponte de glúteo, aperte no topo", calories: 35 },
        { name: "Remada sentada na máquina", sets: "3", reps: "12", rest: "60s", description: "Puxe até o peito, costas retas", calories: 30 },
        { name: "Abdominal crunch", sets: "3", reps: "15", rest: "45s", description: "Suba apenas até meia altura", calories: 25 }
      ] : isIntermediario ? [
        { name: "Agachamento livre", sets: "4", reps: "12", rest: "60s", description: "Com barra, desça até 90 graus", calories: 50 },
        { name: "Leg Press 45°", sets: "3", reps: "15", rest: "60s", description: "Carga moderada, amplitude completa", calories: 45 },
        { name: "Stiff", sets: "3", reps: "12", rest: "60s", description: "Barra ou halteres, trabalha posterior", calories: 40 },
        { name: "Remada curvada", sets: "4", reps: "12", rest: "60s", description: "Barra, costas retas, puxe até o abdômen", calories: 40 },
        { name: "Supino reto", sets: "3", reps: "12", rest: "60s", description: "Barra ou halteres, desça até o peito", calories: 35 },
        { name: "Desenvolvimento com halteres", sets: "3", reps: "12", rest: "60s", description: "Suba acima da cabeça", calories: 30 },
        { name: "Abdominal bicicleta", sets: "3", reps: "20", rest: "45s", description: "Cotovelo toca joelho oposto", calories: 25 }
      ] : [
        { name: "Agachamento livre", sets: "4", reps: "10", rest: "60s", description: "Barra alta, carga desafiadora", calories: 60 },
        { name: "Stiff com barra", sets: "4", reps: "10", rest: "60s", description: "Barra rente às pernas", calories: 50 },
        { name: "Leg Press 45°", sets: "4", reps: "12", rest: "45s", description: "Carga alta, amplitude completa", calories: 50 },
        { name: "Hip thrust", sets: "4", reps: "12", rest: "60s", description: "Elevação pélvica com barra", calories: 45 },
        { name: "Remada curvada", sets: "4", reps: "10", rest: "60s", description: "Barra, pegada supinada", calories: 40 },
        { name: "Supino reto", sets: "4", reps: "10", rest: "60s", description: "Barra, desça controlado", calories: 40 },
        { name: "Desenvolvimento militar", sets: "4", reps: "10", rest: "60s", description: "Barra em pé ou sentada", calories: 35 }
      ],
      cooldown: [
        { name: "Alongamento posterior", duration: "3 min", description: "Alongar pernas e glúteos" },
        { name: "Alongamento superior", duration: "2 min", description: "Braços, ombros e costas" }
      ]
    },
    casa: {
      warmup: [
        { name: "Polichinelos", duration: "2 min", description: "Pular abrindo e fechando pernas e braços" },
        { name: "Joelho alto", duration: "2 min", description: "Correr no lugar levantando os joelhos" }
      ],
      main_exercises: isIniciante ? [
        { name: "Agachamento", sets: "3", reps: "15", rest: "60s", description: "Peso corporal, desça devagar", calories: 35 },
        { name: "Flexão nos joelhos", sets: "3", reps: "10", rest: "60s", description: "Apoiando os joelhos no chão", calories: 25 },
        { name: "Prancha", sets: "3", reps: "30s", rest: "60s", description: "Segure a posição estática", calories: 20 },
        { name: "Ponte de glúteo", sets: "3", reps: "15", rest: "45s", description: "Deitada, eleve o quadril", calories: 30 },
        { name: "Abdominal crunch", sets: "3", reps: "15", rest: "45s", description: "Suba só até meia altura", calories: 20 }
      ] : [
        { name: "Agachamento", sets: "4", reps: "20", rest: "45s", description: "Peso corporal, amplitude completa", calories: 45 },
        { name: "Flexão", sets: "4", reps: "15", rest: "45s", description: "Pode variar a largura das mãos", calories: 40 },
        { name: "Afundo alternado", sets: "3", reps: "12 cada perna", rest: "45s", description: "Passos largos para frente", calories: 40 },
        { name: "Prancha", sets: "3", reps: "45-60s", rest: "30s", description: "Corpo reto, aperte o abdômen", calories: 30 },
        { name: "Burpee", sets: "3", reps: "10", rest: "60s", description: "Movimento completo, pode pular no final", calories: 50 },
        { name: "Mountain climbers", sets: "3", reps: "20", rest: "45s", description: "Escalador, alterne as pernas rápido", calories: 35 }
      ],
      cooldown: [
        { name: "Alongamento de pernas", duration: "3 min", description: "Alongar frente e trás das coxas" },
        { name: "Alongamento geral", duration: "2 min", description: "Braços, costas e quadril" }
      ]
    },
    abdominal: {
      warmup: [
        { name: "Rotação de tronco", duration: "2 min", description: "Girar o corpo para os lados" },
        { name: "Prancha leve", duration: "30s-1min", description: "Aquecer o abdômen" }
      ],
      main_exercises: isIniciante ? [
        { name: "Abdominal crunch", sets: "3", reps: "15", rest: "45s", description: "Subir só até meia altura", calories: 20 },
        { name: "Prancha frontal", sets: "3", reps: "30s", rest: "45s", description: "Segure a posição", calories: 15 },
        { name: "Elevação de pernas (joelhos flexionados)", sets: "3", reps: "12", rest: "45s", description: "Deitada, eleve as pernas com joelhos dobrados", calories: 20 },
        { name: "Prancha lateral", sets: "2", reps: "20s cada lado", rest: "30s", description: "Trabalha os oblíquos", calories: 15 }
      ] : [
        { name: "Abdominal tradicional", sets: "4", reps: "20", rest: "30s", description: "Subir o tronco completamente", calories: 30 },
        { name: "Prancha frontal", sets: "3", reps: "45-60s", rest: "30s", description: "Corpo reto e firme", calories: 25 },
        { name: "Bicicleta", sets: "4", reps: "20 cada lado", rest: "30s", description: "Cotovelo toca joelho oposto", calories: 35 },
        { name: "Elevação de pernas", sets: "3", reps: "15", rest: "30s", description: "Pernas retas, suba devagar", calories: 30 },
        { name: "Prancha lateral", sets: "3", reps: "30s cada lado", rest: "30s", description: "Segure firme de lado", calories: 20 }
      ],
      cooldown: [
        { name: "Gato e vaca", duration: "2 min", description: "Alongamento da coluna" },
        { name: "Alongamento de quadril", duration: "2 min", description: "Relaxar a lombar" }
      ]
    },
    funcional: {
      warmup: [
        { name: "Polichinelos", duration: "2 min", description: "Aquecer corpo todo" },
        { name: "Mobilidade articular", duration: "2 min", description: "Girar braços, pernas e quadril" }
      ],
      main_exercises: isIniciante ? [
        { name: "Agachamento", sets: "3", reps: "15", rest: "60s", description: "Movimento básico funcional", calories: 35 },
        { name: "Flexão nos joelhos", sets: "3", reps: "10", rest: "60s", description: "Força de empurrar", calories: 25 },
        { name: "Prancha", sets: "3", reps: "30s", rest: "45s", description: "Core estável", calories: 20 },
        { name: "Afundo estático", sets: "3", reps: "10 cada perna", rest: "60s", description: "Sem alternar, uma perna de cada vez", calories: 30 }
      ] : [
        { name: "Burpee", sets: "4", reps: "12", rest: "60s", description: "Movimento explosivo completo", calories: 55 },
        { name: "Agachamento com salto", sets: "3", reps: "15", rest: "60s", description: "Pular no topo do agachamento", calories: 50 },
        { name: "Mountain climbers", sets: "4", reps: "20", rest: "45s", description: "Escalador rápido", calories: 40 },
        { name: "Afundo com salto", sets: "3", reps: "10 cada perna", rest: "60s", description: "Trocar de perna no ar", calories: 45 },
        { name: "Prancha com toque no ombro", sets: "3", reps: "20", rest: "45s", description: "Na prancha, toque ombro oposto", calories: 30 }
      ],
      cooldown: [
        { name: "Caminhada leve", duration: "3 min", description: "Baixar batimentos cardíacos" },
        { name: "Alongamento dinâmico", duration: "2 min", description: "Movimentos suaves" }
      ]
    },
    danca: {
      warmup: [
        { name: "Marcha no lugar", duration: "2 min", description: "Começar devagar" },
        { name: "Giros e movimentos de braço", duration: "2 min", description: "Soltar o corpo" }
      ],
      main_exercises: [
        { name: "Sequência de dança cardio", sets: "3", reps: "5 min", rest: "90s", description: "Ritmo que você goste", calories: 60 },
        { name: "Passos laterais com agachamento", sets: "4", reps: "20", rest: "45s", description: "Lateral com descida", calories: 40 },
        { name: "Giros e saltos", sets: "3", reps: "1 min", rest: "60s", description: "Movimentos livres", calories: 35 }
      ],
      cooldown: [
        { name: "Dança suave", duration: "2 min", description: "Ritmo lento para desacelerar" },
        { name: "Alongamento dinâmico", duration: "3 min", description: "Movimentos amplos e lentos" }
      ]
    }
  }

  const template = workoutTemplates[data.workoutPreferences.workoutType] || workoutTemplates.musculacao

  return {
    workout_name: `Treino ${data.workoutPreferences.workoutType.charAt(0).toUpperCase() + data.workoutPreferences.workoutType.slice(1)} - ${data.userProfile.name}`,
    description: `Treino personalizado para ${data.userProfile.fitnessLevel === 'beginner' ? 'iniciante' : data.userProfile.fitnessLevel === 'intermediate' ? 'intermediário' : 'avançado'}`,
    duration_minutes: data.workoutPreferences.availableTime,
    estimated_calories: estimatedCalories,
    workout_plan: {
      warmup: template.warmup,
      main_exercises: template.main_exercises.slice(0, Math.ceil(data.workoutPreferences.availableTime / 10)),
      mobility_exercises: [],
      cooldown: template.cooldown
    },
    equipment_needed: data.workoutPreferences.workoutType === 'casa' ? ['Nenhum'] : ['Academia completa'],
    tips: [
      'Mantenha a forma correta em todos os exercícios',
      'Hidrate-se durante o treino',
      'Respeite seus limites e descanse quando necessário'
    ],
    adaptations: [
      data.userProfile.fitnessLevel === 'beginner' ? 'Comece com cargas leves e foque na técnica' : 'Aumente a intensidade gradualmente',
      'Ajuste o peso conforme sua evolução'
    ]
  }
}

/**
 * Analisa imagem de comida usando OpenAI Vision
 */
export async function analyzeFoodImage(imageBase64: string) {
  const prompt = `Analise esta imagem de comida e identifique todos os alimentos presentes.

Forneça as informações nutricionais TOTAIS do prato completo em JSON:
{
  "meal_name": "nome do prato/refeição completa",
  "meal_type": "cafe-da-manha|almoco|jantar|lanche",
  "foods_detected": ["alimento1", "alimento2", "alimento3"],
  "nutrition": {
    "calories": número_total,
    "protein": número_total_em_gramas,
    "carbs": número_total_em_gramas,
    "fats": número_total_em_gramas,
    "fiber": número_total_em_gramas
  }
}

IMPORTANTE:
- Os valores nutricionais devem ser do PRATO COMPLETO (soma de todos alimentos)
- Use estimativas realistas baseadas nas porções visíveis
- Seja preciso nos valores numéricos
- Liste todos os alimentos detectados no array foods_detected`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: imageBase64 }
            }
          ]
        }
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')

    // Validar resposta
    if (!response.meal_name || !response.nutrition) {
      throw new Error('Resposta inválida da IA')
    }

    return response
  } catch (error) {
    console.error('Erro ao analisar imagem:', error)
    throw new Error('Não foi possível analisar a imagem. Tente novamente.')
  }
}

/**
 * Analisa respostas do onboarding e fornece insights personalizados
 */
export async function analyzeOnboardingResponses(userProfile: any) {
  const prompt = `Como especialista em saúde feminina, analise este perfil:

${JSON.stringify(userProfile, null, 2)}

Forneça:
1. Análise personalizada do perfil
2. Principais desafios identificados
3. Recomendações específicas para fase da vida
4. Motivação personalizada

Responda em JSON:
{
  "analysis": "texto de análise",
  "key_challenges": ["desafio1", "desafio2"],
  "recommendations": ["rec1", "rec2"],
  "motivation": "mensagem motivacional"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')
    return response
  } catch (error) {
    console.error('Erro ao analisar perfil:', error)
    return null
  }
}
