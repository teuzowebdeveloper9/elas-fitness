/**
 * Script simplificado para buscar vídeos do Queslo Sistemas
 * Roda direto com Node.js
 */

const YOUTUBE_API_KEY = 'AIzaSyAMXQlOmy0Z0UF3hNqnbYYHiI4ARymrYGY'
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

const EXERCISE_LIST = [
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
]

async function findChannelId() {
  try {
    console.log('🔍 Buscando ID do canal Queslo Sistemas...\n')

    const searchTerms = ['Queslo Sistemas', '@QuesloSistemas', 'Queslo']

    for (const term of searchTerms) {
      const url = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(term)}&type=channel&maxResults=5&key=${YOUTUBE_API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.items && data.items.length > 0) {
        console.log('📺 Canais encontrados:\n')
        data.items.forEach((item, idx) => {
          console.log(`${idx + 1}. ${item.snippet.channelTitle}`)
          console.log(`   ID: ${item.id.channelId}`)
          console.log(`   Descrição: ${item.snippet.description.substring(0, 100)}...\n`)
        })

        // Retornar o primeiro que contenha "Queslo"
        const quesloChannel = data.items.find(item =>
          item.snippet.channelTitle.toLowerCase().includes('queslo')
        )

        if (quesloChannel) {
          return quesloChannel.id.channelId
        }
      }
    }

    return null
  } catch (error) {
    console.error('❌ Erro ao buscar canal:', error.message)
    return null
  }
}

async function searchVideoInChannel(exerciseName, channelId) {
  try {
    const url = `${YOUTUBE_API_BASE}/search?` + new URLSearchParams({
      part: 'snippet',
      channelId: channelId,
      q: exerciseName,
      type: 'video',
      maxResults: '10',
      order: 'relevance',
      key: YOUTUBE_API_KEY,
      regionCode: 'BR',
      relevanceLanguage: 'pt'
    })

    const response = await fetch(url)
    const data = await response.json()

    if (data.items && data.items.length > 0) {
      // Procurar melhor match
      const exactMatch = data.items.find(item =>
        item.snippet.title.toLowerCase().includes(exerciseName.toLowerCase())
      )

      const bestVideo = exactMatch || data.items[0]

      return {
        videoId: bestVideo.id.videoId,
        title: bestVideo.snippet.title,
        found: true
      }
    }

    return { videoId: null, title: null, found: false }
  } catch (error) {
    return { videoId: null, title: null, found: false }
  }
}

async function main() {
  console.log('🎯 BUSCADOR DE VÍDEOS - CANAL QUESLO SISTEMAS\n')
  console.log('='.repeat(80) + '\n')

  // Buscar ID do canal
  const channelId = await findChannelId()

  if (!channelId) {
    console.log('❌ Canal Queslo Sistemas não encontrado!')
    console.log('\n💡 Possíveis soluções:')
    console.log('   1. Verificar se o canal existe no YouTube')
    console.log('   2. Buscar manualmente e colar o ID do canal')
    return
  }

  console.log(`✅ Canal encontrado! ID: ${channelId}\n`)
  console.log('='.repeat(80) + '\n')

  // Buscar vídeos
  console.log(`📋 Buscando vídeos para ${EXERCISE_LIST.length} exercícios...\n`)

  const results = []
  let found = 0
  let notFound = 0

  for (let i = 0; i < EXERCISE_LIST.length; i++) {
    const exercise = EXERCISE_LIST[i]
    process.stdout.write(`[${i + 1}/${EXERCISE_LIST.length}] ${exercise}...`)

    const result = await searchVideoInChannel(exercise, channelId)

    if (result.found) {
      console.log(` ✅`)
      console.log(`    📹 ${result.title}`)
      console.log(`    🆔 ${result.videoId}\n`)
      found++
    } else {
      console.log(` ❌ (não encontrado)\n`)
      notFound++
    }

    results.push({
      exercise,
      videoId: result.videoId || 'VIDEO_NAO_ENCONTRADO',
      title: result.title
    })

    // Delay para não exceder rate limits
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  // Resumo
  console.log('='.repeat(80))
  console.log('\n📊 RESUMO:')
  console.log(`   ✅ Encontrados: ${found}`)
  console.log(`   ❌ Não encontrados: ${notFound}`)
  console.log(`   📈 Taxa de sucesso: ${((found / EXERCISE_LIST.length) * 100).toFixed(1)}%\n`)

  // Gerar código
  console.log('='.repeat(80))
  console.log('\n📝 CÓDIGO PARA COLAR EM src/lib/queslo-videos.ts:\n')
  console.log('const EXERCISE_VIDEO_MAP: Record<string, string> = {')

  results.forEach(r => {
    console.log(`  '${r.exercise}': '${r.videoId}',`)
  })

  console.log('}\n')
  console.log('='.repeat(80))

  // Salvar em arquivo
  const fs = require('fs')
  fs.writeFileSync('queslo-results.json', JSON.stringify({ channelId, results }, null, 2))
  console.log('\n✅ Resultados salvos em: queslo-results.json')
}

main().catch(console.error)
