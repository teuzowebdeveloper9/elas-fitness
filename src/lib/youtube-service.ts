/**
 * Serviço de integração com YouTube Data API v3
 * Busca vídeos de execução CORRETA de exercícios de musculação
 *
 * Estratégia de busca:
 * - Prioriza vídeos com técnica correta e padronizada
 * - Foca em instrutoras femininas em academias
 * - Usa termos como "execução correta", "técnica oficial", "forma correta"
 * - Prefere vídeos curtos e instrucionais (sem distrações)
 * - Filtra por alta definição para melhor visualização da técnica
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

// Canais priorizados com conteúdo de musculação feminina com boa técnica
// Para adicionar mais canais: busque no YouTube e copie o ID do canal da URL
const PREFERRED_CHANNELS = [
  'UCqjwF8rxRsotnojGl4gM0Zw', // Treino Feminino (exemplo)
  'UC-pVYlGfYTTzW_g7nCzc7IQ', // Instrutora Carol Borba
  'UCcuWDWwKW2PzZvh2yKKHitg', // Treino em Foco
  // Adicione mais IDs de canais confiáveis aqui
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
 * Prioriza vídeos curtos, em HD, focados em demonstração técnica
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
      maxResults: String(maxResults * 2), // Buscar mais para filtrar depois
      order: 'relevance',
      key: YOUTUBE_API_KEY,
      relevanceLanguage: 'pt',
      regionCode: 'BR',
      videoDuration: 'short', // Preferir vídeos curtos (demonstrações técnicas)
      videoDefinition: 'high', // Preferir HD para ver a técnica claramente
      safeSearch: 'strict' // Filtrar conteúdo inadequado
    })

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    const videos = parseYouTubeResponse(data)

    // Filtrar vídeos por qualidade do título (priorizar vídeos instrucionais)
    const filteredVideos = filterQualityVideos(videos)

    return filteredVideos.slice(0, maxResults)
  } catch (error) {
    console.error('Erro ao buscar vídeos gerais:', error)
    return []
  }
}

/**
 * Constrói query de busca otimizada para vídeos de musculação
 * Prioriza vídeos com instrutoras femininas e técnica correta
 */
function buildSearchQuery(exerciseName: string): string {
  // Palavras-chave focadas em técnica correta e musculação feminina
  const keywords = [
    'execução correta',
    'técnica correta',
    'como fazer musculação',
    'forma correta',
    'tutorial musculação feminina',
    'instrutora academia',
    'técnica oficial'
  ]

  // Escolher uma palavra-chave aleatória para variar resultados
  const keyword = keywords[Math.floor(Math.random() * keywords.length)]

  const query = `${exerciseName} ${keyword} musculação`
  console.log('🔎 Query de busca:', query)

  return query
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
 * Filtra vídeos priorizando conteúdo instrucional de qualidade
 * Remove vídeos com termos não desejados e prioriza vídeos técnicos
 */
function filterQualityVideos(videos: YouTubeVideo[]): YouTubeVideo[] {
  console.log(`📊 Filtrando ${videos.length} vídeos...`)

  // Termos positivos que indicam conteúdo técnico/instrucional
  const positiveTerms = [
    'execução',
    'técnica',
    'como fazer',
    'tutorial',
    'forma correta',
    'correta',
    'passo a passo',
    'aprenda',
    'instrutora',
    'professora',
    'academia',
    'musculação',
    'treino'
  ]

  // Termos negativos a evitar
  const negativeTerms = [
    'vlog',
    'rotina',
    'dia de',
    'meu treino',
    'comigo',
    'motivação',
    'transformação',
    'antes e depois',
    'challenge',
    'desafio',
    'react',
    'reagindo'
  ]

  const filtered = videos
    .map(video => {
      const titleLower = video.title.toLowerCase()
      const channelLower = video.channelTitle.toLowerCase()

      // Calcular score do vídeo
      let score = 0

      // Pontos positivos
      positiveTerms.forEach(term => {
        if (titleLower.includes(term)) score += 2
        if (channelLower.includes(term)) score += 1
      })

      // Penalidades
      negativeTerms.forEach(term => {
        if (titleLower.includes(term)) score -= 3
      })

      console.log(`  ${score >= 0 ? '✅' : '❌'} [Score: ${score}] ${video.title}`)

      return { video, score }
    })
    .filter(item => item.score >= 0) // Remover vídeos com score negativo
    .sort((a, b) => b.score - a.score) // Ordenar por score
    .map(item => item.video)

  console.log(`✨ ${filtered.length} vídeos aprovados após filtragem`)

  return filtered
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
