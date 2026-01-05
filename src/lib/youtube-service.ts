/**
 * Serviço de integração com YouTube Data API v3
 * PRIORIZA vídeos do banco de dados (gerenciados pelo admin)
 *
 * Estratégia de busca:
 * 1. Primeiro tenta buscar no banco de dados (exercise_videos)
 * 2. Se não encontrar, busca no mapeamento estático do Queslo Sistemas
 * 3. Se não encontrar, busca dinamicamente no canal Queslo Sistemas
 * 4. Fallback para busca geral apenas se necessário
 */

import { getQuesloVideo } from './queslo-videos'
import { getVideoByExerciseName } from './video-database-service'

export interface YouTubeVideo {
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
  embedUrl: string
}

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyAMXQlOmy0Z0UF3hNqnbYYHiI4ARymrYGY'
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

// CANAL OFICIAL: Queslo Sistemas
const QUESLO_CHANNEL_ID = 'UCvzHO7SwGzOfO13cQI9YZ-Q' // ID do canal Queslo Sistemas (confirmado via API)

// Canal principal é QUESLO_CHANNEL_ID definido acima

/**
 * Busca vídeos de exercício no YouTube
 * PRIORIZA banco de dados > mapeamento estático > API YouTube
 */
export async function searchExerciseVideo(
  exerciseName: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  try {
    // PRIORIDADE 1: Buscar no banco de dados (gerenciado pelo admin)
    console.log(`🗄️ Buscando vídeo no banco de dados para: "${exerciseName}"`)
    try {
      const dbVideo = await getVideoByExerciseName(exerciseName)
      if (dbVideo) {
        console.log(`✅ Vídeo encontrado no banco: ${dbVideo.youtube_video_id}`)
        return [{
          videoId: dbVideo.youtube_video_id,
          title: dbVideo.exercise_name,
          channelTitle: dbVideo.channel_name,
          thumbnail: dbVideo.thumbnail_url,
          embedUrl: dbVideo.embed_url
        }]
      }
    } catch (dbError) {
      console.warn('⚠️ Erro ao buscar no banco, tentando fallback...', dbError)
    }

    // PRIORIDADE 2: Buscar no mapeamento estático do Queslo Sistemas
    console.log(`🎯 Buscando vídeo no mapeamento estático para: "${exerciseName}"`)
    const quesloVideo = getQuesloVideo(exerciseName)

    if (quesloVideo) {
      console.log(`✅ Vídeo do Queslo encontrado no mapeamento: ${quesloVideo.videoId}`)
      return [{
        videoId: quesloVideo.videoId,
        title: quesloVideo.exerciseName,
        channelTitle: quesloVideo.channelName,
        thumbnail: `https://img.youtube.com/vi/${quesloVideo.videoId}/mqdefault.jpg`,
        embedUrl: quesloVideo.embedUrl
      }]
    }

    // PRIORIDADE 3: Buscar dinamicamente no canal Queslo Sistemas
    console.log(`🔍 Buscando dinamicamente no canal Queslo Sistemas...`)
    const quesloResults = await searchInQuesloChannel(exerciseName, maxResults)
    if (quesloResults.length > 0) {
      console.log(`✅ Encontrado ${quesloResults.length} vídeo(s) do Queslo Sistemas`)
      return quesloResults
    }

    // FALLBACK: Busca geral (não recomendado)
    console.warn(`⚠️ Vídeo não encontrado no Queslo Sistemas. Usando busca geral...`)
    return await searchGeneralVideos(exerciseName, maxResults)
  } catch (error) {
    console.error('Erro ao buscar vídeo do YouTube:', error)
    return []
  }
}

/**
 * Busca vídeos ESPECIFICAMENTE no canal Queslo Sistemas
 */
async function searchInQuesloChannel(
  exerciseName: string,
  maxResults: number
): Promise<YouTubeVideo[]> {
  try {
    // Buscar usando o nome exato do exercício no canal Queslo Sistemas
    const query = exerciseName // Usar nome exato, sem adicionar termos extras
    const url = `${YOUTUBE_API_BASE}/search?` + new URLSearchParams({
      part: 'snippet',
      channelId: QUESLO_CHANNEL_ID,
      q: query,
      type: 'video',
      maxResults: String(maxResults * 2), // Buscar mais para filtrar Shorts
      order: 'relevance',
      key: YOUTUBE_API_KEY,
      relevanceLanguage: 'pt',
      regionCode: 'BR',
      videoDuration: 'short' // Priorizar Shorts
    })

    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Erro ao buscar no canal Queslo Sistemas:`, response.status)
      return []
    }

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      console.log(`📹 Encontrados ${data.items.length} vídeos do Queslo Sistemas`)
      const videos = parseYouTubeResponse(data)

      // Priorizar vídeos que contenham o nome do exercício no título
      const sortedVideos = videos.sort((a, b) => {
        const aHasExercise = a.title.toLowerCase().includes(exerciseName.toLowerCase())
        const bHasExercise = b.title.toLowerCase().includes(exerciseName.toLowerCase())

        if (aHasExercise && !bHasExercise) return -1
        if (!aHasExercise && bHasExercise) return 1
        return 0
      })

      return sortedVideos.slice(0, maxResults)
    }

    return []
  } catch (error) {
    console.error('Erro ao buscar no canal Queslo Sistemas:', error)
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
 * Constrói query de busca otimizada
 * Para o canal Queslo, usa o nome exato do exercício
 */
function buildSearchQuery(exerciseName: string, isQuesloChannel: boolean = false): string {
  // Se for busca no Queslo, usar apenas o nome do exercício
  if (isQuesloChannel) {
    return exerciseName
  }

  // Para busca geral, adicionar contexto
  const keywords = [
    'execução correta',
    'técnica correta',
    'como fazer musculação',
    'forma correta',
    'tutorial musculação feminina',
    'instrutora academia',
    'técnica oficial'
  ]

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
