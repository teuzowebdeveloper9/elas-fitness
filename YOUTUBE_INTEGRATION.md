# Integração YouTube - Vídeos de Exercícios

## 📹 Como Funciona

Após a OpenAI gerar os exercícios personalizados, o sistema busca automaticamente vídeos de demonstração no YouTube usando a **YouTube Data API v3**.

## 🔑 Configuração da API Key

A chave da API do YouTube já está configurada no arquivo `.env`:

```env
VITE_YOUTUBE_API_KEY=AIzaSyAMXQlOmy0Z0UF3hNqnbYYHiI4ARymrYGY
```

## 🎯 Funcionalidades Implementadas

### 1. Busca Inteligente de Vídeos
- Busca vídeos de execução para cada exercício gerado
- Usa palavras-chave otimizadas: "como fazer", "execução", "técnica", "tutorial"
- Prioriza vídeos curtos e em HD
- Filtro automático para região BR e idioma PT

### 2. Priorização de Canais
O sistema permite priorizar canais específicos para padronização. Para adicionar canais prioritários:

```typescript
// src/lib/youtube-service.ts
const PREFERRED_CHANNELS = [
  'UCqjwF8rxRsotnojGl4gM0Zw', // ID do canal prioritário
  // Adicione mais IDs de canais aqui
]
```

**Como obter o ID de um canal:**
1. Acesse o canal no YouTube
2. Clique em "Sobre"
3. Copie o ID do canal (começa com UC...)

### 3. Modal de Vídeos
Cada exercício na página de treino ativo possui um botão "Ver vídeo" que:
- Abre um modal com vídeo incorporado
- Mostra título, canal e thumbnail
- Lista vídeos alternativos
- Permite abrir o vídeo diretamente no YouTube

### 4. Player Incorporado (iframe)
Os vídeos são exibidos usando iframe do YouTube com:
- Autoplay desabilitado (usuário controla)
- Controles completos
- Suporte a fullscreen
- Responsivo

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
1. **`src/lib/youtube-service.ts`**
   - Serviço de integração com YouTube API
   - Funções de busca e priorização

2. **`src/components/ExerciseVideoModal.tsx`**
   - Modal para exibir vídeos
   - Player incorporado
   - Lista de vídeos alternativos

### Arquivos Modificados
1. **`src/pages/ActiveWorkout.tsx`**
   - Botão "Ver vídeo" em cada exercício
   - Integração com busca de vídeos
   - Estado e handlers para modal

2. **`.env`**
   - Variável VITE_YOUTUBE_API_KEY adicionada

3. **`src/vite-env.d.ts`**
   - Declarações de tipo para variáveis de ambiente

## 🚀 Como Usar

### Para o Usuário
1. Gere um treino personalizado na página "Meus Treinos"
2. Na página de treino ativo, cada exercício terá um botão "Ver vídeo"
3. Clique no botão para ver demonstrações em vídeo
4. Escolha entre os vídeos sugeridos
5. Assista direto no app ou abra no YouTube

### Para o Desenvolvedor

**Buscar vídeo de um exercício:**
```typescript
import { searchExerciseVideo } from '@/lib/youtube-service'

const videos = await searchExerciseVideo('Agachamento livre', 5)
// Retorna até 5 vídeos relevantes
```

**Buscar múltiplos exercícios:**
```typescript
import { searchMultipleExercises } from '@/lib/youtube-service'

const exercises = ['Agachamento', 'Flexão', 'Prancha']
const videosMap = await searchMultipleExercises(exercises)
// Retorna Map com vídeos para cada exercício
```

**Verificar se API está configurada:**
```typescript
import { isYouTubeConfigured } from '@/lib/youtube-service'

if (isYouTubeConfigured()) {
  // API está pronta para uso
}
```

## 🎨 Exemplo Visual

```
┌─────────────────────────────────────────┐
│  Card de Exercício                      │
├─────────────────────────────────────────┤
│  🏋️ Agachamento Livre                   │
│  Descrição do exercício...              │
│  4 séries • 12-15 reps • 60s descanso   │
│                                          │
│  [Ver vídeo] [Concluir]                 │
└─────────────────────────────────────────┘
          ↓ (clique)
┌─────────────────────────────────────────┐
│  Modal: Como executar Agachamento      │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │     [Vídeo do YouTube]            │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                          │
│  Título: Agachamento - Técnica Correta │
│  Canal: Treino Feminino                 │
│                                          │
│  Outros vídeos:                          │
│  • Vídeo alternativo 1                  │
│  • Vídeo alternativo 2                  │
│                                          │
│  [Abrir no YouTube]                     │
└─────────────────────────────────────────┘
```

## ⚙️ Rate Limits da YouTube API

A API gratuita do YouTube tem limites:
- **10.000 unidades/dia** por projeto
- Cada busca consome **100 unidades**
- Portanto: ~100 buscas por dia

**Otimizações implementadas:**
- Busca apenas quando o usuário clica em "Ver vídeo"
- Não busca vídeos automaticamente ao gerar treino
- Cache de 200ms entre requisições múltiplas

## 🔧 Troubleshooting

### Vídeos não aparecem
1. Verifique se a API Key está correta no `.env`
2. Verifique o console do navegador para erros
3. Confirme que a quota da API não foi excedida

### API Key inválida
Se a chave parar de funcionar, gere uma nova em:
https://console.cloud.google.com/apis/credentials

### Canais prioritários não funcionam
1. Verifique se o ID do canal está correto
2. Confirme que o canal tem vídeos públicos
3. Use o formato correto: `UCxxxxxxxxxxxxxxxxx`

## 📊 Monitoramento de Uso

Para verificar o uso da API:
1. Acesse: https://console.cloud.google.com/apis/dashboard
2. Selecione "YouTube Data API v3"
3. Veja quotas e estatísticas de uso

## 🎯 Melhorias Futuras

- [ ] Cache local de vídeos já buscados
- [ ] Sugestão de canais prioritários por categoria
- [ ] Playlist automática de todos os exercícios do treino
- [ ] Favoritar vídeos específicos
- [ ] Rating de vídeos pelos usuários
- [ ] Busca em outros idiomas (inglês como fallback)

## 📝 Notas de Segurança

- A API Key está no frontend (visível no código)
- Para produção, considere proxy backend para esconder a key
- Implemente rate limiting no lado do cliente
- Monitore uso para evitar abusos

## 🤝 Contribuindo

Para adicionar novos canais prioritários:
1. Encontre o ID do canal
2. Adicione ao array `PREFERRED_CHANNELS`
3. Teste a busca
4. Documente o canal no README

---

**Desenvolvido para Lasy AI - Plataforma de Treinos Femininos**
