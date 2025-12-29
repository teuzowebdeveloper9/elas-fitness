import { supabase } from './supabase'

// Grupos musculares e suas relações
export const MUSCLE_GROUPS = {
  'quadriceps': ['agachamento', 'leg press', 'cadeira extensora', 'afundo'],
  'gluteos': ['gluteo na máquina', 'elevação pelvica', 'stiff', 'agachamento sumô'],
  'isquiotibiais': ['mesa flexora', 'stiff', 'agachamento', 'leg press'],
  'panturrilha': ['panturrilha em pé', 'panturrilha sentada'],
  'peito': ['supino', 'crucifixo', 'flexão', 'peck deck'],
  'costas': ['puxada', 'remada', 'barra fixa', 'pull down'],
  'ombros': ['desenvolvimento', 'elevação lateral', 'elevação frontal'],
  'biceps': ['rosca direta', 'rosca alternada', 'rosca martelo'],
  'triceps': ['tríceps corda', 'tríceps francês', 'mergulho'],
  'abdomen': ['abdominal', 'prancha', 'crunch', 'elevação de pernas'],
  'cardio': ['esteira', 'bicicleta', 'elíptico', 'pular corda']
} as const

export type MuscleGroup = keyof typeof MUSCLE_GROUPS

// Mapear exercício para grupo muscular
export function detectMuscleGroups(exerciseName: string): MuscleGroup[] {
  const lowerName = exerciseName.toLowerCase()
  const groups: MuscleGroup[] = []

  for (const [group, keywords] of Object.entries(MUSCLE_GROUPS)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      groups.push(group as MuscleGroup)
    }
  }

  return groups.length > 0 ? groups : ['cardio'] // Default to cardio if no match
}

// Buscar treinos recentes do usuário
export async function getRecentWorkouts(userId: string, days: number = 7) {
  const { data, error } = await supabase
    .from('workouts')
    .select('id, workout_name, workout_data, muscle_groups, created_at, status')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar treinos recentes:', error)
    return []
  }

  return data || []
}

// Verificar quais grupos musculares foram trabalhados recentemente
export async function getTrainedMuscleGroups(userId: string, days: number = 7): Promise<MuscleGroup[]> {
  const workouts = await getRecentWorkouts(userId, days)
  const trainedGroups = new Set<MuscleGroup>()

  workouts.forEach(workout => {
    if (workout.muscle_groups && Array.isArray(workout.muscle_groups)) {
      workout.muscle_groups.forEach((group: string) => trainedGroups.add(group as MuscleGroup))
    }
  })

  return Array.from(trainedGroups)
}

// Sugerir foco para o próximo treino (evitar repetir grupos musculares)
export async function suggestWorkoutFocus(userId: string): Promise<{
  focusGroups: MuscleGroup[]
  avoidGroups: MuscleGroup[]
  reasoning: string
}> {
  const trainedGroups = await getTrainedMuscleGroups(userId, 3) // Últimos 3 dias
  const allGroups = Object.keys(MUSCLE_GROUPS) as MuscleGroup[]

  // Grupos não treinados recentemente
  const availableGroups = allGroups.filter(group => !trainedGroups.includes(group))

  // Se todos foram treinados, priorizar os que foram treinados há mais tempo
  const focusGroups = availableGroups.length > 0
    ? availableGroups.slice(0, 2)
    : allGroups.filter(g => !['cardio'].includes(g)).slice(0, 2)

  const reasoning = availableGroups.length > 0
    ? `Você não treinou ${focusGroups.join(' e ')} nos últimos dias. Vamos focar neles hoje!`
    : 'Você tem treinado de forma consistente! Vamos variar o treino para estimular novos ganhos.'

  return {
    focusGroups,
    avoidGroups: trainedGroups,
    reasoning
  }
}

// Calcular ciclo de treino baseado na consistência
export async function calculateTrainingCycle(userId: string): Promise<{
  currentCycle: number
  workoutsThisMonth: number
  needsProgression: boolean
  daysUntilProgression: number
}> {
  const { data: stats } = await supabase
    .from('user_progress_stats')
    .select('workouts_this_month')
    .eq('user_id', userId)
    .single()

  const workoutsThisMonth = stats?.workouts_this_month || 0

  // Progressão acontece a cada 30 treinos no mês (aproximadamente 1 mês consistente)
  const cycleThreshold = 30
  const currentCycle = Math.floor(workoutsThisMonth / cycleThreshold) + 1
  const needsProgression = workoutsThisMonth >= cycleThreshold
  const daysUntilProgression = Math.max(0, cycleThreshold - (workoutsThisMonth % cycleThreshold))

  return {
    currentCycle,
    workoutsThisMonth,
    needsProgression,
    daysUntilProgression
  }
}

// Gerar prompt inteligente para a IA baseado no histórico
export async function generateIntelligentWorkoutPrompt(
  userId: string,
  baseWorkoutType: string,
  userPreferences: any
): Promise<string> {
  const { focusGroups, avoidGroups, reasoning } = await suggestWorkoutFocus(userId)
  const { currentCycle, needsProgression, daysUntilProgression } = await calculateTrainingCycle(userId)

  let prompt = `${reasoning}\n\n`

  // Foco em grupos musculares
  if (focusGroups.length > 0) {
    prompt += `FOCO PRIORITÁRIO: ${focusGroups.join(', ')}\n`
  }

  if (avoidGroups.length > 0) {
    prompt += `EVITAR (treinados recentemente): ${avoidGroups.join(', ')}\n`
  }

  // Progressão de dificuldade
  if (needsProgression) {
    prompt += `\n🔥 TREINO DE PROGRESSÃO - Nível ${currentCycle}+1\n`
    prompt += `A usuária completou ${currentCycle * 30}+ treinos! Aumente a intensidade:\n`
    prompt += `- Adicione 10-15% mais peso sugerido\n`
    prompt += `- Inclua exercícios mais desafiadores\n`
    prompt += `- Reduza o tempo de descanso em 10 segundos\n`
    prompt += `- Adicione variações avançadas dos exercícios\n`
  } else {
    prompt += `\nCICLO ATUAL: Nível ${currentCycle}\n`
    prompt += `Progresso: Faltam ${daysUntilProgression} treinos para o próximo nível\n`
  }

  // Contexto de tipo de treino
  prompt += `\nTIPO DE TREINO: ${baseWorkoutType}\n`

  return prompt
}

// Salvar grupos musculares no treino gerado
export async function saveWorkoutMuscleGroups(
  workoutId: string,
  exercises: Array<{ name: string }>
) {
  const muscleGroups = new Set<MuscleGroup>()

  exercises.forEach(exercise => {
    const groups = detectMuscleGroups(exercise.name)
    groups.forEach(g => muscleGroups.add(g))
  })

  const { error } = await supabase
    .from('workouts')
    .update({
      muscle_groups: Array.from(muscleGroups),
      week_day: new Date().getDay() // 0 = domingo, 1 = segunda, etc
    })
    .eq('id', workoutId)

  if (error) {
    console.error('Erro ao salvar grupos musculares:', error)
  }

  return Array.from(muscleGroups)
}
