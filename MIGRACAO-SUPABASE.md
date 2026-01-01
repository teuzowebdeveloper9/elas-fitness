# 🔧 Migração do Banco de Dados Supabase

## ⚠️ Importante

As novas funcionalidades de **Prazo da Meta** e **Plano Alimentar** requerem que você execute uma migração no banco de dados Supabase.

### Por que?

Foram adicionadas 3 novas colunas na tabela `user_profiles`:
- `goal_deadline_weeks` - Prazo em semanas para alcançar a meta
- `selected_diet_type` - Tipo de dieta escolhida
- `custom_diet_plan` - Plano alimentar personalizado gerado pela IA

## ⏰ Funcionamento Temporário

**Enquanto você não executar a migração**, o app vai funcionar normalmente, mas:
- ✅ Os dados de prazo e dieta serão salvos no **localStorage** do navegador
- ✅ Tudo funciona perfeitamente para testes
- ⚠️ Os dados não estarão sincronizados entre dispositivos
- ⚠️ Se limpar o cache do navegador, os dados serão perdidos

## 🚀 Como Executar a Migração

### Passo 1: Acessar o Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login e abra seu projeto
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Executar o SQL
1. Clique em **"New Query"** (Nova consulta)
2. Copie e cole o conteúdo do arquivo `supabase-migration.sql`
3. Clique em **"Run"** (Executar)
4. Aguarde a confirmação de sucesso ✅

### Passo 3: Verificar
Execute esta query para confirmar que as colunas foram criadas:

\`\`\`sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('goal_deadline_weeks', 'selected_diet_type', 'custom_diet_plan');
\`\`\`

Se retornar 3 linhas, a migração foi bem-sucedida! 🎉

## 📝 Conteúdo da Migração

O arquivo `supabase-migration.sql` contém:

\`\`\`sql
-- Adicionar coluna de prazo da meta (em semanas)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS goal_deadline_weeks INTEGER DEFAULT 12;

-- Adicionar coluna de tipo de dieta escolhido
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS selected_diet_type TEXT;

-- Adicionar coluna de plano de dieta personalizado (gerado pela IA)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS custom_diet_plan TEXT;
\`\`\`

## 🔄 Após a Migração

Depois de executar a migração:
1. ✅ Os novos usuários terão seus dados salvos diretamente no banco
2. ✅ Os dados antigos do localStorage serão automaticamente sincronizados
3. ✅ Tudo funcionará perfeitamente em qualquer dispositivo

## 🆘 Problemas?

Se encontrar algum erro durante a migração:
- Verifique se você tem permissões de admin no projeto Supabase
- Certifique-se de que a tabela `user_profiles` existe
- Entre em contato caso o erro persista

---

**Dica:** A migração é segura e não afeta dados existentes. Ela apenas adiciona novas colunas opcionais à tabela.
