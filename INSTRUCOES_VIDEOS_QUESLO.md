# 📹 Instruções para Configurar Vídeos do Queslo Sistemas

## ⚠️ AÇÃO NECESSÁRIA

Para que os vídeos corretos do canal **Queslo Sistemas** apareçam nos exercícios, você precisa seguir estes passos:

---

## 🎯 Passo 1: Encontrar o ID do Canal

1. Acesse o canal no YouTube: [Queslo Sistemas](https://www.youtube.com/@QuesloSistemas)
2. Copie a URL do canal (algo como `https://www.youtube.com/@QuesloSistemas` ou `https://www.youtube.com/channel/UC...`)
3. Se a URL for `@QuesloSistemas`, você precisa converter para o ID do canal:
   - Acesse: https://commentpicker.com/youtube-channel-id.php
   - Cole a URL do canal
   - Copie o ID que aparece (começa com `UC...`)

---

## 🎯 Passo 2: Buscar os IDs dos Vídeos

Para cada exercício da lista abaixo, você precisa encontrar o vídeo correspondente no canal:

1. Acesse o canal Queslo Sistemas
2. Procure pelos **Shorts** (vídeos curtos)
3. Busque pelo nome do exercício
4. Quando encontrar o vídeo, copie o ID do vídeo:
   - URL do Short: `https://www.youtube.com/shorts/ABC123xyz`
   - ID do vídeo: `ABC123xyz` (a parte depois de `/shorts/`)

---

## 📋 Lista de Exercícios (47 no total)

Cole os IDs dos vídeos no arquivo `/workspace/src/lib/queslo-videos.ts`:

```typescript
const EXERCISE_VIDEO_MAP: Record<string, string> = {
  'Remada na máquina pegada aberta': 'COLE_O_ID_AQUI',
  'Remada máquina articulada pegada fechada': 'COLE_O_ID_AQUI',
  'Tríceps testa na máquina': 'COLE_O_ID_AQUI',
  // ... e assim por diante
}
```

### Lista completa de exercícios:

1. Remada na máquina pegada aberta
2. Remada máquina articulada pegada fechada
3. Tríceps testa na máquina
4. Peck deck voador
5. Desenvolvimento de ombro máquina
6. Crucifixo invertido
7. Desenvolvimento de ombros máquina
8. Supino inclinado máquina
9. Supino reto máquina
10. Remada baixa máquina
11. Voador máquina
12. Puxada articulada
13. Tríceps francês unilateral
14. Tríceps francês com halter
15. Desenvolvimento com halteres
16. Puxada alta com triângulo
17. Elevação frontal com halteres (ombros)
18. Remada baixa
19. Elevação lateral para ombros
20. Puxada aberta supinada
21. Rotação Interna com Polia para manguito rotador
22. Remada curvada com barra
23. Pull-down crossover corda
24. Pull-down no cross barra reta
25. Remada alta no pulley
26. Stiff com barra reta
27. Abdominal reto
28. Prancha abdominal
29. Mesa flexora
30. Panturrilha sentado na máquina
31. Cadeira abdutora
32. Cadeira adutora
33. Puxada frontal fechada
34. Posterior de coxa máquina
35. Bíceps na polia baixa
36. Desenvolvimento para ombros sentado com halteres
37. Elevação frontal com halteres
38. Bíceps com halteres
39. Crucifixo no banco reto com halteres
40. Tríceps cross barra v
41. Tríceps corda
42. Tríceps pulley (na polia) com barra reta
43. Leg press 180°
44. Agachamento livre barra
45. Cadeira flexora
46. Cadeira extensora
47. Leg press 45°

---

## 🎯 Passo 3: Atualizar o Código

Depois de coletar todos os IDs:

1. Abra o arquivo: `/workspace/src/lib/queslo-videos.ts`
2. Substitua `'VIDEO_ID_AQUI'` pelos IDs reais dos vídeos
3. Atualize também o `QUESLO_CHANNEL_ID` no arquivo `/workspace/src/lib/youtube-service.ts`

---

## 🔧 Alternativa Rápida: Busca Dinâmica

Se você não quiser mapear todos os vídeos manualmente, o sistema tentará buscar automaticamente no canal Queslo Sistemas usando a API do YouTube. Para isso:

1. Certifique-se de que o `QUESLO_CHANNEL_ID` está correto em `/workspace/src/lib/youtube-service.ts`
2. A API vai buscar automaticamente os vídeos do canal que correspondem ao nome do exercício

---

## ✅ Status Atual

- ✅ Sistema configurado para priorizar vídeos do Queslo Sistemas
- ✅ Fallback para busca automática no canal caso o vídeo não esteja mapeado
- ⚠️ **PENDENTE**: Mapear os IDs dos vídeos (ou confirmar o ID do canal para busca automática)

---

## 📞 Precisa de Ajuda?

Me avise que eu posso:
1. Criar um script para buscar os vídeos automaticamente
2. Ajudar a encontrar o ID do canal
3. Configurar o mapeamento dos vídeos
