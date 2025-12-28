# 🚀 Como Usar o App - Guia Rápido

## ⚠️ IMPORTANTE: Configure o Supabase Primeiro!

Antes de testar o app, você **PRECISA** executar o script SQL no Supabase:

### 📋 Passo 1: Configurar o Banco de Dados

1. Acesse: https://supabase.com/dashboard/project/tpyvxchzpvoxvcnmyuhd/sql/new

2. Abra o arquivo `SUPABASE_SETUP.sql` (está na raiz do projeto)

3. Copie **TODO** o conteúdo do arquivo

4. Cole no SQL Editor do Supabase

5. Clique em **"Run"** (ou pressione Ctrl + Enter)

6. Aguarde a mensagem de sucesso ✅

**Sem este passo, o app NÃO vai funcionar!**

---

## 🎯 Fluxo Completo do App

### 1. **Primeira Vez no App**

Quando você abrir o app pela primeira vez, verá a **tela de autenticação**.

**Opções:**
- **Criar Conta**: Cadastre-se com nome, email e senha
- **Entrar**: Se já tem conta, faça login

---

### 2. **Após Criar Conta ou Fazer Login**

Você será redirecionado para o **Onboarding** (questionário inicial).

**Perguntas do Quiz:**
1. Qual seu nome?
2. Qual sua idade?
3. Quanto você pesa?
4. Qual sua altura?
5. Qual seu objetivo? (perder peso, ganhar músculo, manter peso, saúde geral)
6. **Você ainda menstrua?**
   - ✅ **Sim** → Você está na fase menstrual
   - ❌ **Não** → Próxima pergunta
7. **Se não menstrua**: Em qual fase você está?
   - Pré-menopausa
   - Menopausa
   - Pós-menopausa

---

### 3. **Se Você MENSTRUA** 🩸

Após o onboarding, você será redirecionada para **"Acompanhamento do Ciclo Menstrual"**.

#### 📅 O que você verá:
- **Calendário** para marcar a data da última menstruação
- **4 Fases do Ciclo**:
  - 🩸 **Menstrual** (dias 1-5): Treinos leves
  - ✨ **Folicular** (dias 6-13): Alta energia
  - ☀️ **Ovulação** (dias 14-16): Pico de performance
  - 🌙 **Lútea** (dias 17-28): Reduzir intensidade

#### 📝 O que você pode fazer:
- ✅ Marcar data da última menstruação
- ✅ Ver em qual fase você está hoje
- ✅ Registrar como está se sentindo
- ✅ Ver adaptações de treino para a fase atual
- ✅ Consultar histórico dos últimos 30 dias

---

### 4. **Se Você NÃO MENSTRUA** 🌸

Após o onboarding, você será redirecionada para **"Acompanhamento da Menopausa"**.

#### 🔧 O que você verá:
- **Seleção de fase**: Pré-menopausa, Menopausa ou Pós-menopausa
- **Checklist de sintomas**:
  - Ondas de calor
  - Suores noturnos
  - Insônia
  - Mudanças de humor
  - Ansiedade
  - Fadiga
  - Dor nas articulações
  - Ganho de peso

#### 📝 O que você pode fazer:
- ✅ Marcar quais sintomas está sentindo
- ✅ Ajustar a intensidade (1 a 5) de cada sintoma
- ✅ Ver **adaptações de treino** baseadas nos sintomas
- ✅ Ver **dicas personalizadas** para aliviar sintomas
- ✅ Preencher **diário de bem-estar**:
  - Como está se sentindo
  - O que está ajudando
  - O que está piorando
- ✅ Consultar histórico completo

---

### 5. **Página Inicial (Home)** 🏠

Depois de configurar seu tracking, você verá a **página inicial** com:

- **Card de acesso rápido** ao seu tracking (ciclo ou menopausa)
- **Estatísticas** de treino e calorias
- **Metas do dia**
- **Treino de hoje**
- **Progresso da semana**
- **Ações rápidas** (registrar refeição, ver progresso)

---

### 6. **Navegação do App**

Na parte inferior, você terá 5 abas:

1. 🏠 **Home**: Página inicial com resumo
2. 💪 **Treinos**: Seus treinos personalizados
3. 🥗 **Dieta**: Registro de alimentação
4. 📊 **Progresso**: Gráficos e evolução
5. 👤 **Perfil**: Seus dados e configurações

---

## 🔄 Fluxo de Uso Diário

### Manhã:
1. Abrir o app
2. Ir na aba de tracking (ciclo ou menopausa)
3. Registrar como está se sentindo hoje
4. Ver as adaptações de treino sugeridas

### Tarde/Noite:
1. Ir em **Treinos** e seguir o treino adaptado
2. Registrar refeições em **Dieta**
3. Atualizar diário de bem-estar (se menopausa)

### Semanalmente:
1. Ver **Progresso** para acompanhar evolução
2. Atualizar dados em **Perfil** se necessário

---

## 🎨 Funcionalidades do App

### ✅ Já Funcionando:
- Login e cadastro com Supabase
- Onboarding completo
- Acompanhamento de ciclo menstrual com 4 fases
- Acompanhamento de menopausa com sintomas
- Diário de sentimentos
- Adaptação automática de treinos
- Dicas personalizadas
- Histórico de registros
- Dark/Light mode
- Interface responsiva

### 🔄 Dados Salvos:
- Todos os dados do ciclo menstrual
- Todos os dados da menopausa
- Registros diários
- Perfil do usuário

---

## 📱 Testando o App

### 1. Criar uma conta de teste:
- Email: `teste@example.com`
- Senha: `teste123`
- Nome: `Usuária Teste`

### 2. Complete o onboarding:
- Escolha se menstrua ou não
- Preencha os dados

### 3. Explore as funcionalidades:
- Marque sintomas ou data da menstruação
- Registre como está se sentindo
- Veja as adaptações de treino

---

## 🆘 Solução de Problemas

### ❌ Erro ao criar conta:
- **Causa**: Banco não configurado
- **Solução**: Execute o `SUPABASE_SETUP.sql`

### ❌ App não carrega após login:
- **Causa**: Tabela `user_profiles` não existe
- **Solução**: Execute o `SUPABASE_SETUP.sql`

### ❌ Dados não são salvos:
- **Causa**: RLS (Row Level Security) ativo
- **Solução**: Certifique-se de estar logado

---

## 📚 Documentação Adicional

- `SUPABASE_SETUP.sql` - Script para criar tabelas
- `SUPABASE_README.md` - Documentação técnica completa
- `.env` - Variáveis de ambiente (já configurado)

---

**Divirta-se usando o FitHer! 💪✨**
