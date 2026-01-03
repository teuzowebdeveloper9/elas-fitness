/**
 * Script para buscar automaticamente os vídeos do canal Queslo Sistemas
 * e gerar o mapeamento de exercícios -> IDs de vídeo
 *
 * Execute com: npx tsx scripts/buscar-videos-queslo.ts
 */

import { EXERCISE_LIST } from '../src/lib/queslo-videos'

const YOUTUBE_API_KEY = process.env.VITE_YOUTUBE_API_KEY || 'AIzaSyAMXQlOmy0Z0UF3hNqnbYYHiI4ARymrYGY'
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

// ID do canal Queslo Sistemas (precisa ser confirmado)
const QUESLO_CHANNEL_ID = 'UC3TlBoi5CrGaabOhAipWPsw'

interface VideoResult {
  exerciseName: string
  videoId: string | null
  videoTitle: string | null
  success: boolean
}

/**
 * Busca o ID do canal pelo handle (@QuesloSistemas)
 */
async function findChannelId(handle: string): Promise<string | null> {
  try {
    const url = `${YOUTUBE_API_BASE}/search?part=snippet&q=${handle}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.channelId
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar ID do canal:', error)
    return null
  }
}

/**
 * Busca vídeo para um exercício específico
 */
async function searchVideoForExercise(
  exerciseName: string,
  channelId: string
): Promise<{ videoId: string | null; title: string | null }> {
  try {
    const query = encodeURIComponent(exerciseName)
    const url = `${YOUTUBE_API_BASE}/search?` + new URLSearchParams({
      part: 'snippet',
      channelId: channelId,
      q: exerciseName,
      type: 'video',
      maxResults: '5',
      order: 'relevance',
      key: YOUTUBE_API_KEY,
      regionCode: 'BR',
      relevanceLanguage: 'pt'
    })

    const response = await fetch(url)
    const data = await response.json()

    if (data.items && data.items.length > 0) {
      // Procurar o melhor match
      const bestMatch = data.items.find((item: any) =>
        item.snippet.title.toLowerCase().includes(exerciseName.toLowerCase())
      ) || data.items[0]

      return {
        videoId: bestMatch.id.videoId,
        title: bestMatch.snippet.title
      }
    }

    return { videoId: null, title: null }
  } catch (error) {
    console.error(`Erro ao buscar vídeo para "${exerciseName}":`, error)
    return { videoId: null, title: null }
  }
}

/**
 * Busca vídeos para todos os exercícios
 */
async function searchAllVideos() {
  console.log('🎯 Buscando vídeos do canal Queslo Sistemas...\n')

  // Primeiro, confirmar o ID do canal
  console.log('📡 Verificando ID do canal...')
  const confirmedChannelId = await findChannelId('Queslo Sistemas')
  const channelId = confirmedChannelId || QUESLO_CHANNEL_ID

  console.log(`✅ Canal ID: ${channelId}\n`)
  console.log(`📋 Buscando vídeos para ${EXERCISE_LIST.length} exercícios...\n`)

  const results: VideoResult[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < EXERCISE_LIST.length; i++) {
    const exerciseName = EXERCISE_LIST[i]
    console.log(`[${i + 1}/${EXERCISE_LIST.length}] Buscando: "${exerciseName}"`)

    const { videoId, title } = await searchVideoForExercise(exerciseName, channelId)

    if (videoId) {
      console.log(`  ✅ Encontrado: ${title}`)
      console.log(`  📹 ID: ${videoId}`)
      successCount++
    } else {
      console.log(`  ❌ Não encontrado`)
      failCount++
    }

    results.push({
      exerciseName,
      videoId,
      videoTitle: title,
      success: !!videoId
    })

    // Delay entre requisições para não exceder rate limits
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('')
  }

  // Exibir resumo
  console.log('=' .repeat(80))
  console.log(`\n📊 RESUMO:`)
  console.log(`   ✅ Encontrados: ${successCount}`)
  console.log(`   ❌ Não encontrados: ${failCount}`)
  console.log(`   📈 Taxa de sucesso: ${((successCount / EXERCISE_LIST.length) * 100).toFixed(1)}%\n`)

  // Gerar código TypeScript
  console.log('=' .repeat(80))
  console.log('\n📝 CÓDIGO PARA COLAR EM queslo-videos.ts:\n')
  console.log('const EXERCISE_VIDEO_MAP: Record<string, string> = {')

  results.forEach(result => {
    const videoId = result.videoId || 'VIDEO_ID_AQUI'
    console.log(`  '${result.exerciseName}': '${videoId}',`)
  })

  console.log('}')
  console.log('\n' + '='.repeat(80))

  // Gerar arquivo JSON com os resultados
  const output = {
    channelId,
    channelName: 'Queslo Sistemas',
    totalExercises: EXERCISE_LIST.length,
    foundVideos: successCount,
    missingVideos: failCount,
    successRate: `${((successCount / EXERCISE_LIST.length) * 100).toFixed(1)}%`,
    results: results
  }

  return output
}

// Executar o script
if (import.meta.url === `file://${process.argv[1]}`) {
  searchAllVideos()
    .then(output => {
      // Salvar resultados em JSON
      const fs = require('fs')
      fs.writeFileSync(
        'queslo-videos-results.json',
        JSON.stringify(output, null, 2)
      )
      console.log('\n✅ Resultados salvos em: queslo-videos-results.json')
    })
    .catch(error => {
      console.error('❌ Erro:', error)
      process.exit(1)
    })
}

export { searchAllVideos, findChannelId, searchVideoForExercise }
