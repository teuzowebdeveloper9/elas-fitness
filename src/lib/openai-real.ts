import OpenAI from 'openai'

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Necessário para uso no navegador
})

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

  // Usar IA para refinar recomendações
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

Forneça ajustes finos para proteína, carboidratos, gorduras (em gramas) e água (em litros) considerando:
1. Fase hormonal feminina
2. Necessidades de recuperação muscular
3. Energia sustentável ao longo do dia
4. Hidratação adequada para atividade física
5. Plano acolhedor e realista (não radical)

Responda APENAS com JSON no formato:
{"protein": número, "carbs": número, "fats": número, "adjustedCalories": número, "waterGoal": número_em_litros}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    })

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}')

    return {
      idealWeight: parseFloat(idealWeight.toFixed(1)),
      dailyCalories: aiResponse.adjustedCalories || dailyCalories,
      protein: aiResponse.protein || Math.round(data.weight * 1.6),
      carbs: aiResponse.carbs || Math.round((dailyCalories - (Math.round(data.weight * 1.6) * 4) - (Math.round((dailyCalories * 0.25) / 9) * 9)) / 4),
      fats: aiResponse.fats || Math.round((dailyCalories * 0.25) / 9),
      bmi: parseFloat(bmi.toFixed(1)),
      bodyFatPercentage: parseFloat(((1.2 * bmi) + (0.23 * data.age) - 5.4).toFixed(1)),
      waterGoal: aiResponse.waterGoal || waterGoal
    }
  } catch (error) {
    console.error('Erro ao usar IA:', error)
    // Fallback para cálculos manuais
    const protein = Math.round(data.weight * 1.6)
    const fats = Math.round((dailyCalories * 0.25) / 9)
    const carbs = Math.round((dailyCalories - (protein * 4) - (fats * 9)) / 4)

    return {
      idealWeight: parseFloat(idealWeight.toFixed(1)),
      dailyCalories,
      protein,
      carbs,
      fats,
      bmi: parseFloat(bmi.toFixed(1)),
      bodyFatPercentage: parseFloat(((1.2 * bmi) + (0.23 * data.age) - 5.4).toFixed(1)),
      waterGoal
    }
  }
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
  }
  workoutPreferences: {
    workoutType: string
    mobilityType: string
    availableTime: number
    muscleGroup?: string
    equipmentAvailable?: string[]
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

    const prompt = `Você é uma personal trainer especializada em treinos femininos. Crie um treino completo personalizado.

PERFIL:
- Nome: ${data.userProfile.name}
- Idade: ${data.userProfile.age} anos
- Nível: ${data.userProfile.fitnessLevel}
- Fase da vida: ${data.userProfile.lifePhase}
- Objetivos: ${data.userProfile.goals.join(', ')}

TREINO:
- Tipo: ${data.workoutPreferences.workoutType}
- Tempo: ${data.workoutPreferences.availableTime} minutos${muscleGroupText}

${muscleGroupText ? 'IMPORTANTE: Priorize exercícios para o grupo muscular escolhido, mas mantenha o treino balanceado.' : ''}

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

  const workoutTemplates: Record<string, any> = {
    musculacao: {
      warmup: [
        { name: "Esteira leve", duration: "5 min", description: "Caminhar ou correr leve" },
        { name: "Alongamento dinâmico", duration: "3 min", description: "Movimentos amplos" }
      ],
      main_exercises: [
        { name: "Agachamento livre", sets: "4", reps: "12-15", rest: "60s", description: "Pés na largura dos ombros", calories: 50 },
        { name: "Leg Press 45°", sets: "3", reps: "15", rest: "60s", description: "Empurrar com calcanhares", calories: 45 },
        { name: "Stiff", sets: "3", reps: "12", rest: "60s", description: "Trabalha posterior de coxa", calories: 40 },
        { name: "Remada curvada", sets: "4", reps: "12", rest: "60s", description: "Costas retas", calories: 35 },
        { name: "Supino reto", sets: "3", reps: "12", rest: "60s", description: "Trabalha peitoral", calories: 40 }
      ],
      cooldown: [
        { name: "Alongamento posterior", duration: "2 min", description: "Alongar pernas e costas" },
        { name: "Alongamento superior", duration: "2 min", description: "Braços e ombros" }
      ]
    },
    casa: {
      warmup: [
        { name: "Polichinelos", duration: "2 min", description: "Saltar abrindo pernas" },
        { name: "Joelho alto", duration: "2 min", description: "Correr no lugar" }
      ],
      main_exercises: [
        { name: "Agachamento", sets: "4", reps: "15-20", rest: "45s", description: "Peso corporal", calories: 40 },
        { name: "Flexão", sets: "3", reps: "10-15", rest: "45s", description: "Pode ser no joelho", calories: 35 },
        { name: "Afundo", sets: "3", reps: "12 cada", rest: "45s", description: "Passos largos", calories: 40 },
        { name: "Prancha", sets: "3", reps: "30-45s", rest: "30s", description: "Posição estática", calories: 30 }
      ],
      cooldown: [
        { name: "Alongamento geral", duration: "5 min", description: "Todas as articulações" }
      ]
    },
    abdominal: {
      warmup: [
        { name: "Rotação de tronco", duration: "2 min", description: "Girar o corpo" },
        { name: "Prancha leve", duration: "1 min", description: "Aquecer o core" }
      ],
      main_exercises: [
        { name: "Abdominal tradicional", sets: "4", reps: "20", rest: "30s", description: "Subir o tronco", calories: 25 },
        { name: "Prancha frontal", sets: "3", reps: "45s", rest: "30s", description: "Posição estática", calories: 20 },
        { name: "Bicicleta", sets: "4", reps: "20x", rest: "30s", description: "Cotovelo toca joelho", calories: 35 }
      ],
      cooldown: [
        { name: "Gato e vaca", duration: "2 min", description: "Mobilidade da coluna" }
      ]
    },
    funcional: {
      warmup: [
        { name: "Caminhada rápida", duration: "3 min", description: "Aumentar frequência" },
        { name: "Mobilidade articular", duration: "2 min", description: "Círculos nas articulações" }
      ],
      main_exercises: [
        { name: "Burpee", sets: "3", reps: "10", rest: "60s", description: "Movimento completo", calories: 50 },
        { name: "Agachamento com salto", sets: "3", reps: "12", rest: "60s", description: "Explosivo", calories: 45 },
        { name: "Mountain climbers", sets: "3", reps: "20x", rest: "45s", description: "Escalador", calories: 40 }
      ],
      cooldown: [
        { name: "Caminhada leve", duration: "3 min", description: "Baixar frequência" }
      ]
    },
    danca: {
      warmup: [
        { name: "Marcha no lugar", duration: "2 min", description: "Aquecer corpo" },
        { name: "Giros suaves", duration: "2 min", description: "Soltar articulações" }
      ],
      main_exercises: [
        { name: "Sequência de dança", sets: "3", reps: "5 min", rest: "60s", description: "Coreografia", calories: 60 },
        { name: "Passos laterais", sets: "4", reps: "20x", rest: "30s", description: "Movimentos ritmados", calories: 40 }
      ],
      cooldown: [
        { name: "Alongamento dinâmico", duration: "3 min", description: "Movimentos suaves" }
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
