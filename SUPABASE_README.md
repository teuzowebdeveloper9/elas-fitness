# 🗄️ Configuração do Supabase - FitHer App

## 📋 Passo a Passo

### 1. **Acessar o Supabase SQL Editor**
Acesse: https://supabase.com/dashboard/project/tpyvxchzpvoxvcnmyuhd/sql/new

### 2. **Executar o Script SQL**
1. Abra o arquivo `SUPABASE_SETUP.sql` deste projeto
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** ou pressione `Ctrl + Enter`

### 3. **Verificar se as Tabelas foram Criadas**
Após executar o script, você deve ver 5 tabelas criadas:

- ✅ `user_profiles` - Perfis dos usuários
- ✅ `cycle_data` - Dados do ciclo menstrual
- ✅ `cycle_logs` - Registros diários do ciclo
- ✅ `menopause_data` - Dados da menopausa
- ✅ `menopause_logs` - Registros diários da menopausa

Para verificar, vá em: **Table Editor** na sidebar do Supabase.

---

## 📊 Estrutura das Tabelas

### 1️⃣ **user_profiles**
Armazena os dados do perfil do usuário após o onboarding.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID do usuário (ref: auth.users) |
| `email` | TEXT | Email do usuário |
| `name` | TEXT | Nome completo |
| `age` | INTEGER | Idade |
| `weight` | DECIMAL | Peso em kg |
| `height` | DECIMAL | Altura em cm |
| `goal` | TEXT | Objetivo: lose-weight, gain-muscle, maintain, health |
| `life_phase` | TEXT | Fase: menstrual, pre-menopause, menopause, post-menopause |
| `onboarding_completed` | BOOLEAN | Se completou o onboarding |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

---

### 2️⃣ **cycle_data**
Armazena os dados principais do ciclo menstrual.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do registro |
| `user_id` | UUID | ID do usuário |
| `last_period_date` | DATE | Data da última menstruação |
| `cycle_length` | INTEGER | Duração do ciclo (padrão: 28 dias) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Nota**: Cada usuário tem apenas 1 registro (UNIQUE constraint).

---

### 3️⃣ **cycle_logs**
Registros diários do ciclo menstrual (como a usuária está se sentindo).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do registro |
| `user_id` | UUID | ID do usuário |
| `date` | DATE | Data do registro |
| `feeling` | TEXT | Como está se sentindo |
| `symptoms` | TEXT[] | Array de sintomas |
| `created_at` | TIMESTAMP | Data de criação |

**Nota**: 1 registro por usuário por dia (UNIQUE constraint).

---

### 4️⃣ **menopause_data**
Dados principais da menopausa (fase e sintomas ativos).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do registro |
| `user_id` | UUID | ID do usuário |
| `phase` | TEXT | Fase: premenopausa, menopausa, posmenopausa |
| `symptoms` | JSONB | JSON com sintomas e intensidade |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Exemplo do campo `symptoms`**:
```json
[
  {"id": "hot-flashes", "active": true, "intensity": 4},
  {"id": "insomnia", "active": true, "intensity": 3},
  {"id": "anxiety", "active": false, "intensity": 0}
]
```

**Nota**: Cada usuário tem apenas 1 registro (UNIQUE constraint).

---

### 5️⃣ **menopause_logs**
Registros diários da menopausa (diário de bem-estar).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do registro |
| `user_id` | UUID | ID do usuário |
| `date` | DATE | Data do registro |
| `symptoms` | TEXT[] | Array de sintomas do dia |
| `feeling` | TEXT | Como está se sentindo |
| `what_helps` | TEXT | O que está ajudando |
| `what_makes_worse` | TEXT | O que está piorando |
| `created_at` | TIMESTAMP | Data de criação |

**Nota**: 1 registro por usuário por dia (UNIQUE constraint).

---

## 🔒 Segurança (RLS - Row Level Security)

Todas as tabelas têm **Row Level Security** habilitado! Isso significa:

- ✅ Usuários só podem ver **seus próprios dados**
- ✅ Não é possível acessar dados de outros usuários
- ✅ Proteção automática contra vazamento de dados

### Políticas Aplicadas:
- **SELECT**: Usuário só vê suas próprias linhas
- **INSERT**: Usuário só pode inserir dados para si mesmo
- **UPDATE**: Usuário só pode atualizar seus próprios dados
- **DELETE**: Usuário só pode deletar seus próprios dados

---

## 🚀 Como Usar no Código

### Exemplo: Salvar dados do ciclo menstrual

```typescript
import { supabase } from '@/lib/supabase'

// Salvar data da última menstruação
const { data, error } = await supabase
  .from('cycle_data')
  .upsert({
    user_id: user.id,
    last_period_date: '2025-01-15',
    cycle_length: 28
  })

// Criar um registro diário
const { error: logError } = await supabase
  .from('cycle_logs')
  .insert({
    user_id: user.id,
    date: '2025-01-20',
    feeling: 'Estou me sentindo bem, com energia!',
    symptoms: ['cansaço leve']
  })
```

### Exemplo: Salvar dados da menopausa

```typescript
// Salvar fase e sintomas
const { error } = await supabase
  .from('menopause_data')
  .upsert({
    user_id: user.id,
    phase: 'menopausa',
    symptoms: [
      { id: 'hot-flashes', active: true, intensity: 4 },
      { id: 'insomnia', active: true, intensity: 3 }
    ]
  })

// Criar registro diário
const { error: logError } = await supabase
  .from('menopause_logs')
  .insert({
    user_id: user.id,
    date: '2025-01-20',
    feeling: 'Tive ondas de calor hoje',
    symptoms: ['Ondas de calor (4/5)', 'Insônia (3/5)'],
    what_helps: 'Caminhada pela manhã',
    what_makes_worse: 'Café após 15h'
  })
```

---

## ✅ Checklist de Configuração

- [ ] Executei o script SQL no Supabase
- [ ] Verifiquei que as 5 tabelas foram criadas
- [ ] Testei criar uma conta no app
- [ ] Testei fazer login
- [ ] Verifiquei que os dados estão sendo salvos no Supabase

---

## 🆘 Problemas Comuns

### Erro: "relation does not exist"
**Solução**: Você não executou o script SQL. Execute o `SUPABASE_SETUP.sql` no SQL Editor.

### Erro: "row-level security policy"
**Solução**: As políticas RLS estão funcionando! Certifique-se de estar autenticado antes de fazer queries.

### Dados não aparecem no Table Editor
**Solução**: Normal! RLS impede visualização no editor. Use o SQL Editor:
```sql
SELECT * FROM user_profiles WHERE id = 'seu-user-id';
```

---

## 📝 Notas Importantes

1. **Backup Automático**: Supabase faz backup automático diário
2. **Limites do Plano Free**: 500 MB de storage, 2 GB de bandwidth/mês
3. **Migrações**: Se precisar alterar as tabelas, crie migrations no Supabase
4. **Autenticação**: Já está configurada! Use `supabase.auth` no código

---

**Pronto!** Seu banco de dados está configurado e o app está funcionando com autenticação e persistência de dados! 🎉
