/**
 * Serviço de integração com YouTube Data API v3
 * Busca vídeos de execução de exercícios para os treinos
 */

export interface YouTubeVideo {
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
  embedUrl: string
}

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyAMXQlOmy0Z0UF3hNqnbYYHiI4ARymrYGY'
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

// Canais priorizados para padronização (adicione IDs de canais específicos aqui)
const PREFERRED_CHANNELS = [
  'UCqjwF8rxRsotnojGl4gM0Zw', // Exemplo: Treino Feminino
  // Adicione mais IDs de canais aqui
]

/**
 * Busca vídeos de exercício no YouTube
 * Prioriza canais específicos se configurados
 */
export async function searchExerciseVideo(
  exerciseName: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  try {
    // Primeira tentativa: buscar em canais priorizados
    if (PREFERRED_CHANNELS.length > 0) {
      const preferredResults = await searchInPreferredChannels(exerciseName, maxResults)
      if (preferredResults.length > 0) {
        return preferredResults
      }
    }

    // Segunda tentativa: busca geral com melhor relevância
    return await searchGeneralVideos(exerciseName, maxResults)
  } catch (error) {
    console.error('Erro ao buscar vídeo do YouTube:', error)
    return []
  }
}

/**
 * Busca vídeos em canais priorizados
 */
async function searchInPreferredChannels(
  exerciseName: string,
  maxResults: number
): Promise<YouTubeVideo[]> {
  try {
    // Buscar em cada canal prioritário
    for (const channelId of PREFERRED_CHANNELS) {
      const query = buildSearchQuery(exerciseName)
      const url = `${YOUTUBE_API_BASE}/search?` + new URLSearchParams({
        part: 'snippet',
        channelId: channelId,
        q: query,
        type: 'video',
        maxResults: String(maxResults),
        order: 'relevance',
        key: YOUTUBE_API_KEY,
        relevanceLanguage: 'pt',
        regionCode: 'BR'
      })

      const response = await fetch(url)

      if (!response.ok) {
        console.warn(`Erro ao buscar no canal ${channelId}:`, response.status)
        continue
      }

      const data = await response.json()

      if (data.items && data.items.length > 0) {
        return parseYouTubeResponse(data)
      }
    }

    return []
  } catch (error) {
    console.error('Erro ao buscar em canais priorizados:', error)
    return []
  }
}

/**
 * Busca geral de vídeos (quando não encontra em canais priorizados)
 */
async function searchGeneralVideos(
  exerciseName: string,
  maxResults: number
): Promise<YouTubeVideo[]> {
  try {
    const query = buildSearchQuery(exerciseName)
    const url = `${YOUTUBE_API_BASE}/search?` + new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: String(maxResults),
      order: 'relevance',
      key: YOUTUBE_API_KEY,
      relevanceLanguage: 'pt',
      regionCode: 'BR',
      videoDuration: 'short', // Preferir vídeos curtos (demonstrações)
      videoDefinition: 'high' // Preferir HD
    })

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    return parseYouTubeResponse(data)
  } catch (error) {
    console.error('Erro ao buscar vídeos gerais:', error)
    return []
  }
}

/**
 * Constrói query de busca otimizada
 */
function buildSearchQuery(exerciseName: string): string {
  // Adicionar palavras-chave para melhorar relevância
  const keywords = [
    'como fazer',
    'execução',
    'técnica',
    'tutorial',
    'exercício'
  ]

  // Escolher uma palavra-chave aleatória para variar resultados
  const keyword = keywords[Math.floor(Math.random() * keywords.length)]

  return `${exerciseName} ${keyword}`
}

/**
 * Parseia resposta da API do YouTube
 */
function parseYouTubeResponse(data: any): YouTubeVideo[] {
  if (!data.items || data.items.length === 0) {
    return []
  }

  return data.items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium.url,
    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
  }))
}

/**
 * Busca múltiplos vídeos para uma lista de exercícios
 */
export async function searchMultipleExercises(
  exerciseNames: string[]
): Promise<Map<string, YouTubeVideo[]>> {
  const results = new Map<string, YouTubeVideo[]>()

  // Buscar em lote com delay para não exceder rate limits
  for (const exerciseName of exerciseNames) {
    const videos = await searchExerciseVideo(exerciseName, 3)
    results.set(exerciseName, videos)

    // Pequeno delay entre requisições
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  return results
}

/**
 * Obtém o melhor vídeo para um exercício
 */
export async function getBestVideoForExercise(
  exerciseName: string
): Promise<YouTubeVideo | null> {
  const videos = await searchExerciseVideo(exerciseName, 1)
  return videos.length > 0 ? videos[0] : null
}

/**
 * Valida se a API Key está configurada
 */
export function isYouTubeConfigured(): boolean {
  return !!YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'YOUR_API_KEY'
}
