// OpenAI integration removed - using local templates for workouts and diets
// If you need AI generation in the future, configure VITE_OPENAI_API_KEY in your .env file

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
 * Calcula dados de bioimpedância usando fórmulas nutricionais
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

  // Macronutrientes (proporções baseadas em evidências para mulheres)
  const protein = Math.round(data.weight * 1.6) // 1.6g por kg
  const fats = Math.round((dailyCalories * 0.25) / 9) // 25% das calorias
  const carbs = Math.round((dailyCalories - (protein * 4) - (fats * 9)) / 4)

  // Estimativa de gordura corporal baseada no IMC e idade
  const bodyFatPercentage = parseFloat(
    ((1.2 * bmi) + (0.23 * data.age) - 5.4).toFixed(1)
  )

  return {
    idealWeight: parseFloat(idealWeight.toFixed(1)),
    dailyCalories,
    protein,
    carbs,
    fats,
    bmi: parseFloat(bmi.toFixed(1)),
    bodyFatPercentage: Math.max(15, Math.min(40, bodyFatPercentage))
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
 * Gera um plano alimentar completo personalizado
 */
export async function generatePersonalizedDiet(data: DietGenerationData) {
  const { nutritionData } = data
  const caloriesPerMeal = Math.round(nutritionData.dailyCalories / 3)
  const proteinPerMeal = Math.round(nutritionData.protein / 3)

  // Template de plano alimentar balanceado
  const mealTemplate = {
    monday: {
      breakfast: {
        name: "Bowl de Iogurte com Frutas e Granola",
        foods: ["200g iogurte grego", "1 banana", "2 col sopa granola", "1 col chá mel"],
        calories: Math.round(caloriesPerMeal * 0.3),
        protein: Math.round(proteinPerMeal * 0.3),
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      lunch: {
        name: "Frango Grelhado com Batata Doce",
        foods: ["150g peito de frango grelhado", "150g batata doce", "Salada verde à vontade", "1 col sopa azeite"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.4),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      dinner: {
        name: "Salmão com Legumes",
        foods: ["120g salmão grelhado", "Brócolis e cenoura no vapor", "1 xíc arroz integral"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.4)
      },
      snacks: [
        { name: "Mix de castanhas (30g)", calories: 180 },
        { name: "Maçã com pasta de amendoim", calories: 150 }
      ]
    },
    tuesday: {
      breakfast: {
        name: "Panqueca de Aveia com Frutas",
        foods: ["2 ovos", "3 col sopa aveia", "1 banana amassada", "Mel a gosto"],
        calories: Math.round(caloriesPerMeal * 0.3),
        protein: Math.round(proteinPerMeal * 0.3),
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      lunch: {
        name: "Carne com Quinoa",
        foods: ["150g carne magra", "1 xíc quinoa", "Legumes refogados", "Salada"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.4),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      dinner: {
        name: "Omelete com Vegetais",
        foods: ["3 ovos", "Tomate, cebola, espinafre", "1 fatia pão integral"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.4)
      },
      snacks: [
        { name: "Iogurte com chia", calories: 120 },
        { name: "Barra de proteína", calories: 200 }
      ]
    },
    wednesday: {
      breakfast: {
        name: "Smoothie Proteico",
        foods: ["1 scoop whey", "1 banana", "200ml leite", "Aveia", "Pasta amendoim"],
        calories: Math.round(caloriesPerMeal * 0.3),
        protein: Math.round(proteinPerMeal * 0.3),
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      lunch: {
        name: "Peixe com Arroz Integral",
        foods: ["150g tilápia", "1 xíc arroz integral", "Legumes assados", "Salada"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.4),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      dinner: {
        name: "Frango com Abobrinha",
        foods: ["150g frango desfiado", "Abobrinha refogada", "1 batata média"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.4)
      },
      snacks: [
        { name: "Queijo cottage com tomate", calories: 100 },
        { name: "Frutas vermelhas", calories: 80 }
      ]
    },
    thursday: {
      breakfast: {
        name: "Tapioca com Queijo e Ovo",
        foods: ["2 col sopa tapioca", "1 ovo mexido", "30g queijo branco"],
        calories: Math.round(caloriesPerMeal * 0.3),
        protein: Math.round(proteinPerMeal * 0.3),
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      lunch: {
        name: "Peito de Peru com Inhame",
        foods: ["150g peito peru", "150g inhame", "Brócolis", "Salada verde"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.4),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      dinner: {
        name: "Sopa de Legumes com Frango",
        foods: ["Frango desfiado", "Legumes variados", "Batata", "Caldo caseiro"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.4)
      },
      snacks: [
        { name: "Shake de whey", calories: 150 },
        { name: "Biscoito integral", calories: 100 }
      ]
    },
    friday: {
      breakfast: {
        name: "Ovos Mexidos com Pão Integral",
        foods: ["2 ovos mexidos", "2 fatias pão integral", "Abacate"],
        calories: Math.round(caloriesPerMeal * 0.3),
        protein: Math.round(proteinPerMeal * 0.3),
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      lunch: {
        name: "Carne Moída com Lentilha",
        foods: ["120g carne moída", "1 xíc lentilha", "Arroz integral", "Salada"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.4),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      dinner: {
        name: "Wrap Integral com Frango",
        foods: ["1 wrap integral", "Frango grelhado", "Alface, tomate", "Molho iogurte"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.4)
      },
      snacks: [
        { name: "Vitamina de frutas", calories: 180 },
        { name: "Torrada com cottage", calories: 120 }
      ]
    },
    saturday: {
      breakfast: {
        name: "Açaí Bowl Proteico",
        foods: ["100g açaí puro", "Banana", "Granola", "Pasta amendoim"],
        calories: Math.round(caloriesPerMeal * 0.3),
        protein: Math.round(proteinPerMeal * 0.3),
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      lunch: {
        name: "Frango Assado com Mandioca",
        foods: ["150g frango assado", "150g mandioca", "Salada colorida", "Molho"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.4),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      dinner: {
        name: "Pizza Fitness Caseira",
        foods: ["Massa integral", "Frango desfiado", "Queijo light", "Vegetais"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.4)
      },
      snacks: [
        { name: "Pipoca caseira", calories: 100 },
        { name: "Chocolate 70% cacau (2 quadrados)", calories: 100 }
      ]
    },
    sunday: {
      breakfast: {
        name: "Crepioca Recheada",
        foods: ["1 ovo", "2 col tapioca", "Recheio de frango", "Queijo"],
        calories: Math.round(caloriesPerMeal * 0.3),
        protein: Math.round(proteinPerMeal * 0.3),
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      lunch: {
        name: "Salmão com Purê de Abóbora",
        foods: ["150g salmão", "Purê de abóbora", "Aspargos", "Salada"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.4),
        fats: Math.round(nutritionData.fats * 0.3)
      },
      dinner: {
        name: "Risoto de Frango Light",
        foods: ["Arroz integral", "Frango em cubos", "Legumes", "Queijo parmesão"],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: Math.round(nutritionData.carbs * 0.3),
        fats: Math.round(nutritionData.fats * 0.4)
      },
      snacks: [
        { name: "Iogurte com granola", calories: 150 },
        { name: "Fatia de bolo integral", calories: 180 }
      ]
    }
  }

  return {
    diet_name: `Plano Personalizado - ${data.userProfile.name}`,
    description: `Plano alimentar balanceado com ${nutritionData.dailyCalories} calorias diárias, focado em ${data.userProfile.goals.join(', ')}.`,
    meal_plan: mealTemplate,
    shopping_list: [
      "Frango (1kg)", "Salmão (500g)", "Ovos (dúzia)", "Iogurte grego",
      "Frutas variadas", "Vegetais diversos", "Batata doce", "Arroz integral",
      "Aveia", "Quinoa", "Granola", "Pasta de amendoim", "Azeite",
      "Temperos naturais", "Queijo cottage", "Whey protein"
    ],
    tips: [
      "Beba pelo menos 2L de água por dia",
      "Faça as refeições em horários regulares",
      "Mastigue bem os alimentos",
      "Evite pular refeições",
      "Prepare as marmitas no domingo para a semana",
      "Ajuste as porções conforme sua fome e saciedade"
    ]
  }
}

/**
 * Analisa uma imagem de refeição e retorna informações nutricionais
 */
export async function analyzeFoodImage(_imageBase64: string) {
  // Simulação de análise de imagem com dados realistas
  // Em produção, isso usaria uma API de visão computacional

  const foodExamples = [
    {
      meal_name: "Arroz com Frango e Salada",
      meal_type: "lunch",
      foods_detected: ["Arroz branco", "Peito de frango grelhado", "Alface", "Tomate", "Cenoura"],
      nutrition: {
        calories: 520,
        protein: 42,
        carbs: 58,
        fats: 10,
        fiber: 6
      }
    },
    {
      meal_name: "Omelete com Pão Integral",
      meal_type: "breakfast",
      foods_detected: ["Ovos", "Pão integral", "Queijo branco", "Tomate"],
      nutrition: {
        calories: 380,
        protein: 28,
        carbs: 35,
        fats: 14,
        fiber: 5
      }
    },
    {
      meal_name: "Salada com Atum",
      meal_type: "dinner",
      foods_detected: ["Atum", "Alface", "Tomate", "Pepino", "Azeite", "Limão"],
      nutrition: {
        calories: 280,
        protein: 32,
        carbs: 12,
        fats: 12,
        fiber: 4
      }
    },
    {
      meal_name: "Banana com Aveia",
      meal_type: "snack",
      foods_detected: ["Banana", "Aveia", "Mel"],
      nutrition: {
        calories: 220,
        protein: 6,
        carbs: 42,
        fats: 3,
        fiber: 5
      }
    },
    {
      meal_name: "Batata Doce com Carne",
      meal_type: "lunch",
      foods_detected: ["Batata doce", "Carne moída", "Brócolis", "Cenoura"],
      nutrition: {
        calories: 480,
        protein: 38,
        carbs: 52,
        fats: 12,
        fiber: 8
      }
    }
  ]

  // Simulação de delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Retorna um exemplo aleatório
  const result = foodExamples[Math.floor(Math.random() * foodExamples.length)]

  return result
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
 * Gera um treino personalizado
 */
export async function generatePersonalizedWorkout(data: WorkoutGenerationData, _userId?: string) {
  const estimatedCalories = Math.round((data.workoutPreferences.availableTime / 60) * 300)

  const workoutTemplates = {
    musculacao: {
      warmup: [
        { name: "Esteira leve", duration: "5 min", description: "Caminhar ou correr leve para aquecer", reps: "-" },
        { name: "Alongamento dinâmico", duration: "3 min", description: "Movimentos amplos de braços e pernas", reps: "10x" }
      ],
      main_exercises: [
        { name: "Agachamento livre", sets: "4", reps: "12-15", rest: "60s", description: "Pés na largura dos ombros, descer controlado", calories: 50, adaptations: "Use apenas o peso do corpo se iniciante" },
        { name: "Leg Press 45°", sets: "3", reps: "15", rest: "60s", description: "Empurrar com os calcanhares", calories: 45, adaptations: "Ajuste a carga gradualmente" },
        { name: "Stiff", sets: "3", reps: "12", rest: "60s", description: "Trabalha posterior de coxa", calories: 40, adaptations: "Pode usar halteres leves" },
        { name: "Remada curvada", sets: "4", reps: "12", rest: "60s", description: "Costas retas, puxar cotovelos para trás", calories: 35, adaptations: "Use barra ou halteres" },
        { name: "Supino reto", sets: "3", reps: "12", rest: "60s", description: "Trabalha peitoral", calories: 40, adaptations: "Comece com carga leve" },
        { name: "Desenvolvimento", sets: "3", reps: "12", rest: "60s", description: "Ombros - empurrar pesos para cima", calories: 35, adaptations: "Pode ser feito com halteres" },
        { name: "Rosca direta", sets: "3", reps: "12-15", rest: "45s", description: "Bíceps - curvar os braços", calories: 25, adaptations: "Controle o movimento" },
        { name: "Tríceps pulley", sets: "3", reps: "12-15", rest: "45s", description: "Empurrar corda para baixo", calories: 25, adaptations: "Mantenha cotovelos fixos" }
      ],
      mobility_exercises: [],
      cooldown: [
        { name: "Alongamento posterior", duration: "2 min", description: "Alongar pernas e costas" },
        { name: "Alongamento superior", duration: "2 min", description: "Braços, ombros e peito" }
      ]
    },
    casa: {
      warmup: [
        { name: "Polichinelos", duration: "2 min", description: "Saltar abrindo e fechando pernas e braços", reps: "30x" },
        { name: "Joelho alto", duration: "2 min", description: "Correr no lugar elevando joelhos", reps: "30x" }
      ],
      main_exercises: [
        { name: "Agachamento", sets: "4", reps: "15-20", rest: "45s", description: "Peso corporal", calories: 40, adaptations: "Adicione salto para mais intensidade" },
        { name: "Flexão", sets: "3", reps: "10-15", rest: "45s", description: "Pode ser no joelho se iniciante", calories: 35, adaptations: "Use parede se necessário" },
        { name: "Afundo", sets: "3", reps: "12 cada", rest: "45s", description: "Dar passos largos para frente", calories: 40, adaptations: "Segure em algo para equilibrar" },
        { name: "Prancha", sets: "3", reps: "30-45s", rest: "30s", description: "Posição de flexão estática", calories: 30, adaptations: "Comece com menos tempo" },
        { name: "Mountain climbers", sets: "3", reps: "20x", rest: "30s", description: "Escalador - prancha alternando joelhos", calories: 45, adaptations: "Faça devagar se iniciante" },
        { name: "Burpee", sets: "3", reps: "10-12", rest: "60s", description: "Agachar, prancha, pular", calories: 50, adaptations: "Tire o salto se for muito intenso" },
        { name: "Glúteo 4 apoios", sets: "3", reps: "15 cada", rest: "30s", description: "Elevar perna para trás", calories: 30, adaptations: "Aperte bem o glúteo no topo" }
      ],
      mobility_exercises: [],
      cooldown: [
        { name: "Alongamento geral", duration: "5 min", description: "Todas as articulações trabalhadas" }
      ]
    },
    abdominal: {
      warmup: [
        { name: "Rotação de tronco", duration: "2 min", description: "Girar o corpo de um lado para outro", reps: "20x" },
        { name: "Prancha leve", duration: "1 min", description: "Aquecer o core", reps: "2x30s" }
      ],
      main_exercises: [
        { name: "Abdominal tradicional", sets: "4", reps: "20", rest: "30s", description: "Subir o tronco até as escápulas", calories: 25, adaptations: "Mãos atrás da cabeça ou no peito" },
        { name: "Abdominal canivete", sets: "3", reps: "15", rest: "30s", description: "Subir pernas e tronco simultaneamente", calories: 30, adaptations: "Pode dobrar joelhos" },
        { name: "Prancha frontal", sets: "3", reps: "45s", rest: "30s", description: "Manter posição estática", calories: 20, adaptations: "Mantenha corpo reto" },
        { name: "Prancha lateral", sets: "3", reps: "30s cada", rest: "30s", description: "Apoiar em um braço de cada vez", calories: 25, adaptations: "Pode apoiar joelho" },
        { name: "Bicicleta", sets: "4", reps: "20x", rest: "30s", description: "Cotovelo toca joelho oposto", calories: 35, adaptations: "Movimentos controlados" },
        { name: "Elevação de pernas", sets: "3", reps: "15", rest: "30s", description: "Deitada, elevar pernas retas", calories: 30, adaptations: "Mãos sob o quadril para apoio" },
        { name: "Oblíquo no solo", sets: "3", reps: "15 cada", rest: "30s", description: "Lateral do abdômen", calories: 25, adaptations: "Sentir contração lateral" },
        { name: "Prancha com toque", sets: "3", reps: "12x", rest: "30s", description: "Tocar ombro alternado na prancha", calories: 30, adaptations: "Manter quadril estável" }
      ],
      mobility_exercises: [],
      cooldown: [
        { name: "Gato e vaca", duration: "2 min", description: "Mobilidade da coluna" },
        { name: "Alongamento lateral", duration: "2 min", description: "Inclinar corpo para os lados" }
      ]
    },
    funcional: {
      warmup: [
        { name: "Caminhada rápida", duration: "3 min", description: "Aumentar frequência cardíaca", reps: "-" },
        { name: "Mobilidade articular", duration: "2 min", description: "Círculos com todas as articulações", reps: "10x cada" }
      ],
      main_exercises: [
        { name: "Swing com peso", sets: "4", reps: "15", rest: "45s", description: "Balanço explosivo do quadril", calories: 50, adaptations: "Use garrafa com água se não tiver kettlebell" },
        { name: "Agachamento com salto", sets: "3", reps: "12", rest: "60s", description: "Agachar e saltar", calories: 45, adaptations: "Tire o salto se necessário" },
        { name: "Remada invertida", sets: "3", reps: "10", rest: "45s", description: "Puxar corpo com barra baixa", calories: 35, adaptations: "Use mesa resistente" },
        { name: "Farmer walk", sets: "3", reps: "30s", rest: "30s", description: "Caminhar com peso nas mãos", calories: 30, adaptations: "Use garrafas ou mochilas" },
        { name: "Box jump", sets: "3", reps: "10", rest: "60s", description: "Saltar em caixa ou degrau", calories: 40, adaptations: "Use step ou degrau baixo" },
        { name: "TRX row", sets: "3", reps: "12", rest: "45s", description: "Remada suspensa", calories: 35, adaptations: "Use qualquer ponto de ancoragem" }
      ],
      mobility_exercises: [
        { name: "Agachamento profundo", duration: "2 min", description: "Melhorar amplitude do quadril", focus_area: "Quadril e tornozelo" },
        { name: "Mobilidade torácica", duration: "2 min", description: "Rotações e extensões", focus_area: "Coluna torácica" }
      ],
      cooldown: [
        { name: "Caminhada leve", duration: "3 min", description: "Baixar frequência cardíaca" },
        { name: "Alongamento dinâmico", duration: "2 min", description: "Movimentos suaves" }
      ]
    },
    danca: {
      warmup: [
        { name: "Marcha no lugar", duration: "2 min", description: "Aquecer corpo todo", reps: "-" },
        { name: "Giros suaves", duration: "2 min", description: "Soltar as articulações", reps: "10x" }
      ],
      main_exercises: [
        { name: "Sequência de dança 1", sets: "3", reps: "5 min", rest: "60s", description: "Coreografia de aquecimento", calories: 60, adaptations: "No seu ritmo" },
        { name: "Passos laterais", sets: "4", reps: "20x", rest: "30s", description: "Movimentos laterais ritmados", calories: 40, adaptations: "Adicione braços" },
        { name: "Sequência cardio", sets: "3", reps: "3 min", rest: "45s", description: "Movimentos intensos com música", calories: 70, adaptations: "Mantenha a energia" },
        { name: "Giros e saltos", sets: "3", reps: "15x", rest: "30s", description: "Movimentos explosivos", calories: 50, adaptations: "Cuidado com equilíbrio" },
        { name: "Trabalho de quadril", sets: "4", reps: "20x", rest: "30s", description: "Movimentos isolados de quadril", calories: 45, adaptations: "Controle do core" },
        { name: "Freestyle", sets: "2", reps: "5 min", rest: "60s", description: "Dance livre com sua música favorita", calories: 80, adaptations: "Se divirta!" }
      ],
      mobility_exercises: [],
      cooldown: [
        { name: "Dança suave", duration: "3 min", description: "Movimentos lentos para relaxar" },
        { name: "Alongamento", duration: "2 min", description: "Focar em pernas e quadril" }
      ]
    }
  }

  const selectedWorkout = workoutTemplates[data.workoutPreferences.workoutType]

  // Adicionar exercícios de mobilidade específicos se solicitado
  if (data.workoutPreferences.mobilityType !== 'none' && selectedWorkout.mobility_exercises.length === 0) {
    const mobilityExercises = {
      inferior: [
        { name: "Agachamento profundo", duration: "2 min", description: "Manter posição baixa", focus_area: "Quadril e tornozelos" },
        { name: "Alongamento de quadríceps", duration: "1 min cada", description: "Puxar pé para trás", focus_area: "Parte frontal da coxa" },
        { name: "Alongamento de isquios", duration: "1 min cada", description: "Inclinar corpo à frente", focus_area: "Parte posterior da coxa" }
      ],
      superior: [
        { name: "Círculos de ombro", duration: "1 min", description: "Rotações amplas", focus_area: "Ombros" },
        { name: "Alongamento de peitoral", duration: "1 min", description: "Abrir braços na parede", focus_area: "Peito" },
        { name: "Rotação de punho", duration: "1 min", description: "Círculos com os punhos", focus_area: "Punhos" }
      ],
      completa: [
        { name: "Gato e vaca", duration: "2 min", description: "Mobilidade da coluna", focus_area: "Coluna toda" },
        { name: "Rotação de tronco", duration: "2 min", description: "Girar o corpo", focus_area: "Torso" },
        { name: "Alongamento global", duration: "2 min", description: "Todo o corpo", focus_area: "Corpo todo" }
      ]
    }
    selectedWorkout.mobility_exercises = mobilityExercises[data.workoutPreferences.mobilityType] || []
  }

  return {
    workout_name: `Treino ${data.workoutPreferences.workoutType} - ${data.userProfile.name}`,
    description: `Treino personalizado de ${data.workoutPreferences.workoutType} adaptado para ${data.userProfile.lifePhase}`,
    duration_minutes: data.workoutPreferences.availableTime,
    estimated_calories: estimatedCalories,
    workout_plan: selectedWorkout,
    equipment_needed: data.workoutPreferences.equipmentAvailable || ["Nenhum equipamento necessário"],
    tips: [
      "Mantenha-se hidratada durante todo o treino",
      "Respire corretamente em cada exercício",
      "Ouça seu corpo e respeite seus limites",
      "Aumente a intensidade gradualmente",
      "Faça os exercícios com técnica correta",
      "Descanse adequadamente entre os treinos"
    ],
    adaptations: [
      `Treino adaptado para ${data.userProfile.lifePhase}`,
      `Considerando nível ${data.userProfile.fitnessLevel}`,
      "Ajuste a intensidade conforme se sentir",
      "Foque em movimentos que se sinta confortável"
    ]
  }
}
