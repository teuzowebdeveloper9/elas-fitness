# 🤖 Funcionalidades com Inteligência Artificial - OpenAI

Este documento lista todas as funcionalidades do app que utilizam a API da OpenAI para fornecer experiências personalizadas e inteligentes.

---

## ✅ **Funcionalidades Implementadas com IA Real**

### 1. **📊 Análise de Bioimpedância Inteligente**
**Arquivo:** `src/lib/openai-real.ts` → `calculateBioimpedance()`

**O que faz:**
- Calcula TMB (Taxa Metabólica Basal) usando fórmulas científicas
- **IA refina** as recomendações considerando:
  - Fase hormonal feminina
  - Necessidades de recuperação muscular
  - Distribuição ideal de macronutrientes
  - Energia sustentável ao longo do dia

**Entrada:** Peso, altura, idade, nível de atividade, objetivos
**Saída:** Calorias diárias ajustadas, proteína, carboidratos e gorduras otimizados

**Modelo usado:** GPT-4o-mini (rápido e eficiente)

---

### 2. **🍽️ Geração de Planos Alimentares Personalizados**
**Arquivo:** `src/lib/openai-real.ts` → `generatePersonalizedDiet()`
**Usado em:** `src/pages/DietNew.tsx`

**O que faz:**
- Cria um plano alimentar completo para 7 dias
- **Personaliza com base em:**
  - Objetivos (perda de peso, ganho de massa, saúde)
  - Fase da vida (menstrual, menopausa, etc)
  - Restrições alimentares (vegetariano, sem lactose, etc)
  - Alimentos favoritos e evitados
  - Tempo disponível para cozinhar
  - Habilidade culinária

**Inclui:**
- Café da manhã, almoço, jantar e lanches
- Receitas brasileiras e práticas
- Lista de compras automática
- Dicas nutricionais personalizadas
- Cálculo de macronutrientes por refeição

**Modelo usado:** GPT-4o (melhor qualidade para planos complexos)

---

### 3. **💪 Geração de Treinos Personalizados**
**Arquivo:** `src/lib/openai-real.ts` → `generatePersonalizedWorkout()`
**Usado em:** `src/pages/WorkoutsNew.tsx`

**O que faz:**
- Cria treinos adaptados ao perfil feminino
- **Considera:**
  - Nível de fitness (iniciante, intermediário, avançado)
  - Fase hormonal (menstrual, menopausa, pós-menopausa)
  - Objetivos específicos
  - Condições de saúde e desafios
  - Tempo disponível
  - Equipamentos disponíveis
  - Tipo de treino (musculação, casa, funcional, dança, abdominal)

**Inclui:**
- Aquecimento específico
- Exercícios principais com séries, repetições e descanso
- Exercícios de mobilidade (opcional)
- Alongamento final
- Adaptações para cada nível
- Estimativa de calorias queimadas
- Dicas de execução e segurança

**Modelo usado:** GPT-4o (treinos complexos e detalhados)

---

### 4. **📸 Análise Inteligente de Alimentos (Nutri Scan)**
**Arquivo:** `src/lib/openai-real.ts` → `analyzeFoodImage()`
**Usado em:** `src/pages/NutriScan.tsx`

**O que faz:**
- Analisa fotos de comida usando Vision AI
- **Identifica:**
  - Nome do prato/alimento
  - Calorias estimadas
  - Proteínas, carboidratos e gorduras
  - Avaliação nutricional (saudável, moderado, evitar)
  - Sugestões de melhoria

**Casos de uso:**
- Escanear comida do restaurante
- Verificar refeições caseiras
- Aprender sobre nutrição visual
- Registrar diário alimentar automaticamente

**Modelo usado:** GPT-4o com Vision (capacidade de análise de imagens)

---

### 5. **🎯 Análise de Perfil do Onboarding**
**Arquivo:** `src/lib/openai-real.ts` → `analyzeOnboardingResponses()`

**O que faz:**
- Analisa respostas do questionário inicial
- **Fornece:**
  - Análise personalizada do perfil
  - Identificação de desafios principais
  - Recomendações específicas para fase da vida
  - Mensagem motivacional customizada

**Modelo usado:** GPT-4o-mini (análise rápida de texto)

---

## 🎨 **Como a IA Melhora a Experiência**

### **1. Treinos Inteligentes**
- ✅ Adaptados à fase hormonal (mais leve na menstruação, mais intenso na fase folicular)
- ✅ Progressão automática baseada em consistência
- ✅ Exercícios variados para evitar monotonia
- ✅ Foco em músculos femininos (glúteos, pernas, core)
- ✅ Segurança e prevenção de lesões

### **2. Dieta Personalizada**
- ✅ Receitas brasileiras e acessíveis
- ✅ Respeita restrições e preferências
- ✅ Balanceamento hormonal (ex: mais ferro na menstruação)
- ✅ Variedade para não enjoar
- ✅ Lista de compras organizada

### **3. Análise Nutricional Instantânea**
- ✅ Aprenda sobre nutrição de forma visual
- ✅ Faça escolhas melhores em restaurantes
- ✅ Registre refeições sem digitar
- ✅ Receba sugestões práticas

---

## 🔒 **Segurança e Privacidade**

- ✅ API Key configurada de forma segura via variáveis de ambiente
- ✅ Dados do usuário **não são armazenados** pela OpenAI
- ✅ Todas as solicitações são criptografadas (HTTPS)
- ✅ Fallback automático: Se a IA falhar, usa templates locais
- ✅ Dados sensíveis permanecem no Supabase (banco seguro)

---

## 📈 **Modelos OpenAI Utilizados**

| Funcionalidade | Modelo | Motivo |
|----------------|--------|--------|
| Bioimpedância | GPT-4o-mini | Rápido, barato, eficiente para cálculos |
| Treinos | GPT-4o | Melhor qualidade para planos complexos |
| Dietas | GPT-4o | Planos detalhados de 7 dias |
| Nutri Scan | GPT-4o + Vision | Análise de imagens |
| Análise de Perfil | GPT-4o-mini | Análise de texto rápida |

**GPT-4o** = Mais caro, melhor qualidade, para tarefas complexas
**GPT-4o-mini** = Mais barato, rápido, para tarefas simples

---

## 💰 **Estimativa de Custos**

Com uso médio de **100 usuárias ativas/dia**:

| Ação | Frequência | Custo/Mês |
|------|------------|-----------|
| Gerar treino | 2x/semana | ~$15 |
| Gerar dieta | 1x/mês | ~$10 |
| Escanear comida | 3x/dia | ~$30 |
| Análise perfil | 1x (onboarding) | ~$2 |
| **TOTAL** | - | **~$57/mês** |

Para 1000 usuárias: ~$570/mês

---

## 🚀 **Futuras Melhorias com IA**

1. **Coach Virtual em Tempo Real**
   - Análise de vídeo de exercícios
   - Correção de postura automática

2. **Chatbot Nutricional 24/7**
   - Tire dúvidas sobre alimentação
   - Substitua ingredientes em receitas

3. **Previsão de Resultados**
   - Simule evolução de peso/medidas
   - Projeções baseadas em histórico

4. **Análise de Humor e Energia**
   - Detecte padrões hormonais
   - Ajuste treinos automaticamente

5. **Geração de Vídeos de Exercícios**
   - Demonstrações personalizadas
   - Explicações por voz

---

## 🔧 **Configuração Técnica**

### Variáveis de Ambiente (.env)
```env
VITE_OPENAI_API_KEY=sk-proj-...
```

### Teste se está funcionando:
1. Gere um treino personalizado
2. Gere uma dieta personalizada
3. Use o Nutri Scan para escanear comida

Se der erro, verifique:
- ✅ API Key válida
- ✅ Créditos disponíveis na conta OpenAI
- ✅ Conexão com internet

---

## 📞 **Suporte**

Se tiver problemas com a IA:
1. Verifique os logs do navegador (F12 → Console)
2. Confirme que a API Key está ativa
3. Teste com outro modelo (fallback para templates locais)

**Arquivos principais:**
- `src/lib/openai-real.ts` - Toda lógica de IA
- `.env` - Configuração da API Key
