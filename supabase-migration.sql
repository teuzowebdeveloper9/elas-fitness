-- Migração para adicionar campos de prazo de meta e tipo de dieta
-- Execute este SQL no editor SQL do Supabase

-- Adicionar coluna de prazo da meta (em semanas)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS goal_deadline_weeks INTEGER DEFAULT 12;

-- Adicionar coluna de tipo de dieta escolhido
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS selected_diet_type TEXT;

-- Adicionar coluna de plano de dieta personalizado (gerado pela IA)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS custom_diet_plan TEXT;

-- Comentários para documentação
COMMENT ON COLUMN user_profiles.goal_deadline_weeks IS 'Prazo em semanas para alcançar o peso desejado';
COMMENT ON COLUMN user_profiles.selected_diet_type IS 'Tipo de dieta escolhida: mediterranean, low-carb, dash, plant-based, hypocaloric, personalized';
COMMENT ON COLUMN user_profiles.custom_diet_plan IS 'Plano alimentar personalizado gerado pela IA';
