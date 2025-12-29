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

  // Ajuste baseado nos objetivos
  if (data.goals.includes('perder-peso')) {
    dailyCalories -= 500 // Déficit para perda de peso
  } else if (data.goals.includes('ganhar-massa')) {
    dailyCalories += 300 // Superávit para ganho muscular
  }

  // Usar IA para refinar recomendações
  try {
    const prompt = `Como nutricionista especializada em mulheres, analise estes dados:
- Peso: ${data.weight}kg, Altura: ${data.height}cm, Idade: ${data.age} anos
- Nível de atividade: ${data.activityLevel}
- Objetivos: ${data.goals.join(', ')}
- TMB calculada: ${tmb} kcal
- Calorias diárias: ${dailyCalories} kcal

Forneça ajustes finos para proteína, carboidratos e gorduras (em gramas) considerando:
1. Fase hormonal feminina
2. Necessidades de recuperação muscular
3. Energia sustentável ao longo do dia

Responda APENAS com JSON no formato:
{"protein": número, "carbs": número, "fats": número, "adjustedCalories": número}`

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
      bodyFatPercentage: parseFloat(((1.2 * bmi) + (0.23 * data.age) - 5.4).toFixed(1))
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
      bodyFatPercentage: parseFloat(((1.2 * bmi) + (0.23 * data.age) - 5.4).toFixed(1))
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
 * Gera plano alimentar personalizado usando OpenAI
 */
export async function generatePersonalizedDiet(data: DietGenerationData) {
  const prompt = `Você é uma nutricionista especializada em saúde feminina. Crie um plano alimentar semanal completo para:

**PERFIL:**
- Nome: ${data.userProfile.name}
- Idade: ${data.userProfile.age} anos
- Peso atual: ${data.userProfile.weight}kg → Meta: ${data.userProfile.goalWeight}kg
- Fase da vida: ${data.userProfile.lifePhase}
- Objetivos: ${data.userProfile.goals.join(', ')}

**NECESSIDADES NUTRICIONAIS:**
- Calorias diárias: ${data.nutritionData.dailyCalories} kcal
- Proteína: ${data.nutritionData.protein}g
- Carboidratos: ${data.nutritionData.carbs}g
- Gorduras: ${data.nutritionData.fats}g

**PREFERÊNCIAS:**
- Restrições: ${data.foodPreferences.dietaryRestrictions.join(', ') || 'Nenhuma'}
- Alimentos favoritos: ${data.foodPreferences.favoriteFoods?.join(', ') || 'Não especificado'}
- Alimentos evitados: ${data.foodPreferences.dislikedFoods?.join(', ') || 'Nenhum'}
- Refeições por dia: ${data.foodPreferences.mealsPerDay}
- Tempo para cozinhar: ${data.foodPreferences.timeForCooking || 30} minutos

Crie um plano de 7 dias com café da manhã, almoço, jantar e lanches. Use alimentos brasileiros, receitas práticas e inclua variedade.

Responda em JSON com esta estrutura exata:
{
  "diet_name": "Nome do Plano",
  "description": "Descrição em 1 linha",
  "meal_plan": {
    "monday": {
      "breakfast": {"name": "...", "foods": ["..."], "calories": 0, "protein": 0, "carbs": 0, "fats": 0},
      "lunch": {"name": "...", "foods": ["..."], "calories": 0, "protein": 0, "carbs": 0, "fats": 0},
      "dinner": {"name": "...", "foods": ["..."], "calories": 0, "protein": 0, "carbs": 0, "fats": 0},
      "snacks": [{"name": "...", "calories": 0}]
    },
    "tuesday": {...},
    "wednesday": {...},
    "thursday": {...},
    "friday": {...},
    "saturday": {...},
    "sunday": {...}
  },
  "shopping_list": ["item1", "item2"],
  "tips": ["dica1", "dica2"]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 4000
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')
    return response
  } catch (error) {
    console.error('Erro ao gerar dieta com IA:', error)
    throw new Error('Não foi possível gerar o plano alimentar. Tente novamente.')
  }
}

export interface WorkoutGenerationData {
  userProfile: {
    name: string
    age: number
    fitnessLevel: string
    goals: string[]
    lifePhase: string
    exerciseFrequency: string
    challenges: string[]
    healthConditions: string[]
  }
  workoutPreferences: {
    workoutType: string
    mobilityType: string
    availableTime: number
    equipmentAvailable?: string[]
  }
}

/**
 * Gera treino personalizado usando OpenAI
 */
export async function generatePersonalizedWorkout(data: WorkoutGenerationData, userId?: string) {
  const prompt = `Você é uma personal trainer especializada em treinos femininos. Crie um treino completo personalizado para:

**PERFIL:**
- Nome: ${data.userProfile.name}
- Idade: ${data.userProfile.age} anos
- Nível: ${data.userProfile.fitnessLevel}
- Fase da vida: ${data.userProfile.lifePhase}
- Objetivos: ${data.userProfile.goals.join(', ')}
- Frequência: ${data.userProfile.exerciseFrequency}
- Desafios: ${data.userProfile.challenges.join(', ') || 'Nenhum'}
- Condições de saúde: ${data.userProfile.healthConditions.join(', ') || 'Nenhuma'}

**PREFERÊNCIAS DO TREINO:**
- Tipo: ${data.workoutPreferences.workoutType}
- Mobilidade adicional: ${data.workoutPreferences.mobilityType}
- Tempo disponível: ${data.workoutPreferences.availableTime} minutos
- Equipamentos: ${data.workoutPreferences.equipmentAvailable?.join(', ') || 'Academia completa'}

IMPORTANTE:
- Adapte para a fase hormonal feminina (${data.userProfile.lifePhase})
- Se iniciante, priorize forma correta e cargas leves
- Inclua aquecimento, exercícios principais e alongamento
- Para mulheres: foco em glúteos, pernas, core e postura
- Exercícios funcionais e práticos

Responda em JSON com esta estrutura:
{
  "workout_name": "Nome do Treino",
  "description": "Descrição breve",
  "duration_minutes": ${data.workoutPreferences.availableTime},
  "estimated_calories": número,
  "workout_plan": {
    "warmup": [{"name": "...", "duration": "...", "description": "..."}],
    "main_exercises": [
      {"name": "...", "sets": "...", "reps": "...", "rest": "...", "description": "...", "calories": número}
    ],
    "mobility_exercises": [{"name": "...", "duration": "...", "description": "...", "focus_area": "..."}],
    "cooldown": [{"name": "...", "duration": "...", "description": "..."}]
  },
  "equipment_needed": ["..."],
  "tips": ["..."],
  "adaptations": ["..."]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 3000
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')
    return response
  } catch (error) {
    console.error('Erro ao gerar treino com IA:', error)
    throw new Error('Não foi possível gerar o treino. Tente novamente.')
  }
}

/**
 * Analisa imagem de comida usando OpenAI Vision
 */
export async function analyzeFoodImage(imageBase64: string) {
  const prompt = `Analise esta imagem de comida e forneça:
1. Nome do prato/alimento
2. Calorias estimadas
3. Proteínas (g)
4. Carboidratos (g)
5. Gorduras (g)
6. Avaliação nutricional (saudável, moderado, evitar)
7. Sugestões de melhoria

Responda em JSON:
{
  "food_name": "...",
  "calories": número,
  "protein": número,
  "carbs": número,
  "fats": número,
  "health_rating": "saudável|moderado|evitar",
  "analysis": "texto de análise",
  "suggestions": ["sugestão1", "sugestão2"]
}`

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
      max_tokens: 1000
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')
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
