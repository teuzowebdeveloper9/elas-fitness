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
const QUESLO_CHANNEL_ID = 'UCvzHO7SwGzOfO13cQI9YZ-Q' // ID do canal Queslo Sistemas (confirmado via API)

/**
 * Mapeamento de exercícios -> vídeo ID do YouTube
 * Todos os vídeos são do canal Queslo Sistemas
 * ✅ 100% dos exercícios mapeados (47/47)
 */
const EXERCISE_VIDEO_MAP: Record<string, string> = {
  'Remada na máquina pegada aberta': 'L1sj8Ujz6Ms',
  'Remada máquina articulada pegada fechada': 'z3Bqm1B9HUc',
  'Tríceps testa na máquina': '010bQQVTtno',
  'Peck deck voador': 'u0CUc0TKFDM',
  'Desenvolvimento de ombro máquina': 'wL41w-NRH6I',
  'Crucifixo invertido': 'wBfnhmNur6o',
  'Desenvolvimento de ombros máquina': 'oDrVvWwpTzI',
  'Supino inclinado máquina': '4E0mgSfgdfc',
  'Supino reto máquina': 'TrjXp1bP8-E',
  'Remada baixa máquina': 'FLT55fPkM_4',
  'Voador máquina': '8Q_VF29Ar-8',
  'Puxada articulada': 'PRQbKmWyabw',
  'Tríceps francês unilateral': 'fRyXgnMB1JM',
  'Tríceps francês com halter': '-kRgpfSEwaI',
  'Desenvolvimento com halteres': 'siwKSEHa3p4',
  'Puxada alta com triângulo': 'LrfNTLtHPiM',
  'Elevação frontal com halteres (ombros)': 'Kn_yTHD1qpM',
  'Remada baixa': 'xQ7gRdhBQI8',
  'Elevação lateral para ombros': 'q2p43F9gFwo',
  'Puxada aberta supinada': 'uBkXGSio4zk',
  'Rotação Interna com Polia para manguito rotador': 'b_tYLVYBIF8',
  'Remada curvada com barra': 'Vezbx6CAZzk',
  'Pull-down crossover corda': 'IMoigAzHT3E',
  'Pull-down no cross barra reta': '0StamgOvaKs',
  'Remada alta no pulley': 'w1kMQ5eR1ZU',
  'Stiff com barra reta': 'oIu-e_mHTPU',
  'Abdominal reto': '5RucMkRjTyE',
  'Prancha abdominal': 'WSirPHTOhx4',
  'Mesa flexora': 'pcsrb3kQwUY',
  'Panturrilha sentado na máquina': '-Ct3nbgrbcY',
  'Cadeira abdutora': 'ShCscfSkYEU',
  'Cadeira adutora': '1tnsk-j5CA0',
  'Puxada frontal fechada': 'W98phx1r2Yg',
  'Posterior de coxa máquina': '1WXL_oeypTk',
  'Bíceps na polia baixa': 'OnXIagSFoU8',
  'Desenvolvimento para ombros sentado com halteres': 'cl29pNd1E0Y',
  'Elevação frontal com halteres': 'O1aSEoHuxpQ',
  'Bíceps com halteres': 'Kg0SlkZjlTY',
  'Crucifixo no banco reto com halteres': 'pma0D65cKTk',
  'Tríceps cross barra v': 'tK3bolJca_4',
  'Tríceps corda': 'BCUmmZgW61M',
  'Tríceps pulley (na polia) com barra reta': 'zwhQg6oEgTU',
  'Leg press 180°': 'Wu-CQUYFYO0',
  'Agachamento livre barra': 'Rb1C_xGT51Y',
  'Cadeira flexora': 'mjCYcvs_BeY',
  'Cadeira extensora': 'kaFLb-jZ14w',
  'Leg press 45°': 'yuIdTWl3oJ8',
}

/**
 * Busca o vídeo correto do canal Queslo Sistemas para um exercício
 */
export function getQuesloVideo(exerciseName: string): ExerciseVideo | null {
  // Normalizar o nome do exercício (remover espaços extras, etc)
  const normalizedName = exerciseName.trim()

  const videoId = EXERCISE_VIDEO_MAP[normalizedName]

  if (!videoId) {
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
 * ✅ Todos os 47 exercícios têm vídeo mapeado!
 */
export function getAvailableExercises(): string[] {
  return Object.keys(EXERCISE_VIDEO_MAP)
}

/**
 * Verifica se um exercício tem vídeo disponível
 * ✅ Todos os 47 exercícios têm vídeo!
 */
export function hasQuesloVideo(exerciseName: string): boolean {
  const normalizedName = exerciseName.trim()
  const videoId = EXERCISE_VIDEO_MAP[normalizedName]
  return !!videoId
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
