/**
 * Mapeamento de vídeos do canal Queslo Sistemas
 *
 * IMPORTANTE: Todos os vídeos são do canal "Queslo Sistemas"
 * Formato: YouTube Shorts demonstrando a execução correta dos exercícios
 *
 * Para adicionar novos vídeos:
 * 1. Acesse o canal Queslo Sistemas no YouTube
 * 2. Busque pelo nome exato do exercício
 * 3. Copie o ID do vídeo (parte após /shorts/ na URL)
 * 4. Adicione no objeto abaixo com o nome EXATO do exercício
 */

export interface ExerciseVideo {
  exerciseName: string
  videoId: string
  videoUrl: string
  embedUrl: string
  channelName: string
  videoType: 'exercise_execution'
  source: 'youtube'
}

// Canal oficial
const QUESLO_CHANNEL = 'Queslo Sistemas'
const QUESLO_CHANNEL_ID = 'UCyourChannelIdHere' // ID do canal (pode ser encontrado na URL do canal)

/**
 * Mapeamento de exercícios -> vídeo ID do YouTube
 * Os nomes dos exercícios devem ser EXATAMENTE como aparecem no app
 */
const EXERCISE_VIDEO_MAP: Record<string, string> = {
  // IMPORTANTE: Buscar os IDs reais dos vídeos do canal Queslo Sistemas
  // Formato: 'Nome do Exercício': 'ID_DO_VIDEO_YOUTUBE'

  'Remada na máquina pegada aberta': 'VIDEO_ID_AQUI',
  'Remada máquina articulada pegada fechada': 'VIDEO_ID_AQUI',
  'Tríceps testa na máquina': 'VIDEO_ID_AQUI',
  'Peck deck voador': 'VIDEO_ID_AQUI',
  'Desenvolvimento de ombro máquina': 'VIDEO_ID_AQUI',
  'Crucifixo invertido': 'VIDEO_ID_AQUI',
  'Desenvolvimento de ombros máquina': 'VIDEO_ID_AQUI',
  'Supino inclinado máquina': 'VIDEO_ID_AQUI',
  'Supino reto máquina': 'VIDEO_ID_AQUI',
  'Remada baixa máquina': 'VIDEO_ID_AQUI',
  'Voador máquina': 'VIDEO_ID_AQUI',
  'Puxada articulada': 'VIDEO_ID_AQUI',
  'Tríceps francês unilateral': 'VIDEO_ID_AQUI',
  'Tríceps francês com halter': 'VIDEO_ID_AQUI',
  'Desenvolvimento com halteres': 'VIDEO_ID_AQUI',
  'Puxada alta com triângulo': 'VIDEO_ID_AQUI',
  'Elevação frontal com halteres (ombros)': 'VIDEO_ID_AQUI',
  'Remada baixa': 'VIDEO_ID_AQUI',
  'Elevação lateral para ombros': 'VIDEO_ID_AQUI',
  'Puxada aberta supinada': 'VIDEO_ID_AQUI',
  'Rotação Interna com Polia para manguito rotador': 'VIDEO_ID_AQUI',
  'Remada curvada com barra': 'VIDEO_ID_AQUI',
  'Pull-down crossover corda': 'VIDEO_ID_AQUI',
  'Pull-down no cross barra reta': 'VIDEO_ID_AQUI',
  'Remada alta no pulley': 'VIDEO_ID_AQUI',
  'Stiff com barra reta': 'VIDEO_ID_AQUI',
  'Abdominal reto': 'VIDEO_ID_AQUI',
  'Prancha abdominal': 'VIDEO_ID_AQUI',
  'Mesa flexora': 'VIDEO_ID_AQUI',
  'Panturrilha sentado na máquina': 'VIDEO_ID_AQUI',
  'Cadeira abdutora': 'VIDEO_ID_AQUI',
  'Cadeira adutora': 'VIDEO_ID_AQUI',
  'Puxada frontal fechada': 'VIDEO_ID_AQUI',
  'Posterior de coxa máquina': 'VIDEO_ID_AQUI',
  'Bíceps na polia baixa': 'VIDEO_ID_AQUI',
  'Desenvolvimento para ombros sentado com halteres': 'VIDEO_ID_AQUI',
  'Elevação frontal com halteres': 'VIDEO_ID_AQUI',
  'Bíceps com halteres': 'VIDEO_ID_AQUI',
  'Crucifixo no banco reto com halteres': 'VIDEO_ID_AQUI',
  'Tríceps cross barra v': 'VIDEO_ID_AQUI',
  'Tríceps corda': 'VIDEO_ID_AQUI',
  'Tríceps pulley (na polia) com barra reta': 'VIDEO_ID_AQUI',
  'Leg press 180°': 'VIDEO_ID_AQUI',
  'Agachamento livre barra': 'VIDEO_ID_AQUI',
  'Cadeira flexora': 'VIDEO_ID_AQUI',
  'Cadeira extensora': 'VIDEO_ID_AQUI',
  'Leg press 45°': 'VIDEO_ID_AQUI',
}

/**
 * Busca o vídeo correto do canal Queslo Sistemas para um exercício
 */
export function getQuesloVideo(exerciseName: string): ExerciseVideo | null {
  // Normalizar o nome do exercício (remover espaços extras, etc)
  const normalizedName = exerciseName.trim()

  const videoId = EXERCISE_VIDEO_MAP[normalizedName]

  if (!videoId || videoId === 'VIDEO_ID_AQUI') {
    console.warn(`⚠️ Vídeo não encontrado para: "${normalizedName}"`)
    return null
  }

  return {
    exerciseName: normalizedName,
    videoId,
    videoUrl: `https://www.youtube.com/shorts/${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    channelName: QUESLO_CHANNEL,
    videoType: 'exercise_execution',
    source: 'youtube'
  }
}

/**
 * Busca vídeos para múltiplos exercícios
 */
export function getQuesloVideosForExercises(exerciseNames: string[]): Map<string, ExerciseVideo> {
  const results = new Map<string, ExerciseVideo>()

  for (const name of exerciseNames) {
    const video = getQuesloVideo(name)
    if (video) {
      results.set(name, video)
    }
  }

  return results
}

/**
 * Lista todos os exercícios disponíveis com vídeo
 */
export function getAvailableExercises(): string[] {
  return Object.keys(EXERCISE_VIDEO_MAP).filter(
    key => EXERCISE_VIDEO_MAP[key] !== 'VIDEO_ID_AQUI'
  )
}

/**
 * Verifica se um exercício tem vídeo disponível
 */
export function hasQuesloVideo(exerciseName: string): boolean {
  const normalizedName = exerciseName.trim()
  const videoId = EXERCISE_VIDEO_MAP[normalizedName]
  return !!videoId && videoId !== 'VIDEO_ID_AQUI'
}

/**
 * Busca vídeo do Queslo usando a API do YouTube (fallback)
 * Usa a API apenas se o ID ainda não estiver mapeado
 */
export async function searchQuesloVideoByAPI(exerciseName: string): Promise<string | null> {
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyAMXQlOmy0Z0UF3hNqnbYYHiI4ARymrYGY'

  try {
    // Buscar especificamente no canal Queslo Sistemas
    const query = encodeURIComponent(exerciseName)
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&channelId=${QUESLO_CHANNEL_ID}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`

    const response = await fetch(url)
    if (!response.ok) {
      console.error('Erro ao buscar vídeo na API do YouTube')
      return null
    }

    const data = await response.json()

    // Procurar o vídeo Short mais relevante
    if (data.items && data.items.length > 0) {
      // Priorizar Shorts
      const shortVideo = data.items.find((item: any) =>
        item.snippet.title.toLowerCase().includes('short') ||
        item.snippet.description?.toLowerCase().includes('short')
      )

      const bestMatch = shortVideo || data.items[0]
      return bestMatch.id.videoId
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error)
    return null
  }
}

/**
 * Exporta a lista completa de exercícios para referência
 */
export const EXERCISE_LIST = [
  'Remada na máquina pegada aberta',
  'Remada máquina articulada pegada fechada',
  'Tríceps testa na máquina',
  'Peck deck voador',
  'Desenvolvimento de ombro máquina',
  'Crucifixo invertido',
  'Desenvolvimento de ombros máquina',
  'Supino inclinado máquina',
  'Supino reto máquina',
  'Remada baixa máquina',
  'Voador máquina',
  'Puxada articulada',
  'Tríceps francês unilateral',
  'Tríceps francês com halter',
  'Desenvolvimento com halteres',
  'Puxada alta com triângulo',
  'Elevação frontal com halteres (ombros)',
  'Remada baixa',
  'Elevação lateral para ombros',
  'Puxada aberta supinada',
  'Rotação Interna com Polia para manguito rotador',
  'Remada curvada com barra',
  'Pull-down crossover corda',
  'Pull-down no cross barra reta',
  'Remada alta no pulley',
  'Stiff com barra reta',
  'Abdominal reto',
  'Prancha abdominal',
  'Mesa flexora',
  'Panturrilha sentado na máquina',
  'Cadeira abdutora',
  'Cadeira adutora',
  'Puxada frontal fechada',
  'Posterior de coxa máquina',
  'Bíceps na polia baixa',
  'Desenvolvimento para ombros sentado com halteres',
  'Elevação frontal com halteres',
  'Bíceps com halteres',
  'Crucifixo no banco reto com halteres',
  'Tríceps cross barra v',
  'Tríceps corda',
  'Tríceps pulley (na polia) com barra reta',
  'Leg press 180°',
  'Agachamento livre barra',
  'Cadeira flexora',
  'Cadeira extensora',
  'Leg press 45°',
] as const

export type ExerciseName = typeof EXERCISE_LIST[number]
