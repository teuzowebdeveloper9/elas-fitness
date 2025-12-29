import OpenAI from 'openai'

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your_openai_api_key_here',
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
 * Calcula dados de bioimpedância usando OpenAI
 */
export async function calculateBioimpedance(data: BioimpedanceData): Promise<NutritionData> {
  try {
    const prompt = `Como especialista em nutrição e bioimpedância, calcule os seguintes dados para uma mulher:

Dados fornecidos:
- Idade: ${data.age} anos
- Peso atual: ${data.weight} kg
- Altura: ${data.height} cm
- Nível de atividade: ${data.activityLevel}
- Objetivos: ${data.goals.join(', ')}

Por favor, calcule e retorne APENAS um JSON válido com os seguintes campos (sem texto adicional):
{
  "idealWeight": peso ideal em kg (número),
  "dailyCalories": calorias diárias recomendadas (número inteiro),
  "protein": proteína diária em gramas (número inteiro),
  "carbs": carboidratos diários em gramas (número inteiro),
  "fats": gorduras diárias em gramas (número inteiro),
  "bmi": índice de massa corporal (número com 1 casa decimal),
  "bodyFatPercentage": percentual de gordura corporal estimado (número com 1 casa decimal)
}

Importante: Retorne APENAS o JSON, sem markdown, sem explicações.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em nutrição e composição corporal. Retorne apenas JSON válido, sem formatação markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Resposta vazia da OpenAI')
    }

    // Remove markdown se houver
    const jsonString = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(jsonString)

    return result
  } catch (error) {
    console.error('Erro ao calcular bioimpedância:', error)
    // Retornar valores default em caso de erro
    const heightInMeters = data.height / 100
    const bmi = data.weight / (heightInMeters * heightInMeters)

    return {
      idealWeight: data.weight * 0.95,
      dailyCalories: 1800,
      protein: 120,
      carbs: 180,
      fats: 60,
      bmi: parseFloat(bmi.toFixed(1)),
      bodyFatPercentage: 25
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
 * Gera um plano alimentar completo personalizado usando OpenAI
 */
export async function generatePersonalizedDiet(data: DietGenerationData) {
  try {
    const prompt = `Como nutricionista especializada em saúde feminina, crie um plano alimentar semanal COMPLETO e DETALHADO para:

**Perfil:**
- Nome: ${data.userProfile.name}
- Idade: ${data.userProfile.age} anos
- Peso atual: ${data.userProfile.weight} kg
- Peso ideal: ${data.userProfile.goalWeight} kg
- Altura: ${data.userProfile.height} cm
- Fase da vida: ${data.userProfile.lifePhase}
- Objetivos: ${data.userProfile.goals.join(', ')}

**Metas Nutricionais Diárias:**
- Calorias: ${data.nutritionData.dailyCalories} kcal
- Proteínas: ${data.nutritionData.protein}g
- Carboidratos: ${data.nutritionData.carbs}g
- Gorduras: ${data.nutritionData.fats}g

**Preferências:**
- Restrições: ${data.foodPreferences.dietaryRestrictions.join(', ') || 'Nenhuma'}
- Refeições por dia: ${data.foodPreferences.mealsPerDay}
${data.foodPreferences.favoriteFoods?.length ? `- Alimentos favoritos: ${data.foodPreferences.favoriteFoods.join(', ')}` : ''}
${data.foodPreferences.dislikedFoods?.length ? `- Alimentos que não gosta: ${data.foodPreferences.dislikedFoods.join(', ')}` : ''}

Crie um plano semanal COMPLETO (7 dias) com refeições detalhadas, quantidades e prepare um JSON no formato:

{
  "diet_name": "Nome do plano",
  "description": "Descrição breve do plano",
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
  "shopping_list": ["item 1", "item 2", ...],
  "tips": ["dica 1", "dica 2", ...]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem markdown, sem explicações adicionais.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é uma nutricionista especializada em saúde feminina e hormonal. Retorne apenas JSON válido, sem formatação markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Resposta vazia da OpenAI')
    }

    const jsonString = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Erro ao gerar dieta:', error)
    throw error
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
    workoutType: 'musculacao' | 'casa' | 'abdominal' | 'funcional' | 'danca'
    mobilityType: 'inferior' | 'superior' | 'completa' | 'none'
    availableTime: number // em minutos
    equipmentAvailable?: string[]
  }
}

/**
 * Gera um treino personalizado usando OpenAI
 */
export async function generatePersonalizedWorkout(data: WorkoutGenerationData) {
  try {
    const prompt = `Como personal trainer especializada em treino feminino, crie um treino COMPLETO e DETALHADO para:

**Perfil:**
- Nome: ${data.userProfile.name}
- Idade: ${data.userProfile.age} anos
- Nível: ${data.userProfile.fitnessLevel}
- Fase da vida: ${data.userProfile.lifePhase}
- Objetivos: ${data.userProfile.goals.join(', ')}
- Frequência semanal: ${data.userProfile.exerciseFrequency}x
- Desafios: ${data.userProfile.challenges.join(', ')}
${data.userProfile.healthConditions.length > 0 ? `- Condições de saúde: ${data.userProfile.healthConditions.join(', ')}` : ''}

**Preferências do Treino:**
- Tipo: ${data.workoutPreferences.workoutType}
- Mobilidade: ${data.workoutPreferences.mobilityType}
- Tempo disponível: ${data.workoutPreferences.availableTime} minutos
${data.workoutPreferences.equipmentAvailable?.length ? `- Equipamentos disponíveis: ${data.workoutPreferences.equipmentAvailable.join(', ')}` : ''}

Crie um treino completo adaptado à fase hormonal dela, com exercícios detalhados em JSON:

{
  "workout_name": "Nome do treino",
  "description": "Descrição do treino",
  "duration_minutes": ${data.workoutPreferences.availableTime},
  "estimated_calories": 0,
  "workout_plan": {
    "warmup": [
      {"name": "...", "duration": "...", "description": "...", "reps": "..."}
    ],
    "main_exercises": [
      {"name": "...", "sets": "...", "reps": "...", "rest": "...", "description": "...", "calories": 0, "adaptations": "..."}
    ],
    "mobility_exercises": [
      {"name": "...", "duration": "...", "description": "...", "focus_area": "..."}
    ],
    "cooldown": [
      {"name": "...", "duration": "...", "description": "..."}
    ]
  },
  "equipment_needed": ["..."],
  "tips": ["dica 1", "dica 2", ...],
  "adaptations": ["adaptação para ${data.userProfile.lifePhase}", ...]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem markdown, sem explicações.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é uma personal trainer especializada em treino feminino e adaptações hormonais. Retorne apenas JSON válido, sem formatação markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Resposta vazia da OpenAI')
    }

    const jsonString = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Erro ao gerar treino:', error)
    throw error
  }
}
