-- Migração para corrigir campos faltando no onboarding
-- Esta migração adiciona/atualiza campos necessários para o onboarding funcionar
-- Data: 2026-01-02

-- 1. Atualizar constraint de life_phase para incluir 'irregular-cycle'
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_life_phase_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_life_phase_check
CHECK (life_phase IN ('menstrual', 'pre-menopause', 'menopause', 'post-menopause', 'irregular-cycle'));

-- 2. Adicionar colunas para feedback diário e ciclo irregular
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS uses_daily_feedback BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS irregular_cycle_reason TEXT;

-- Atualizar constraint de irregular_cycle_reason (remover se existe e recriar)
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_irregular_cycle_reason_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_irregular_cycle_reason_check
CHECK (irregular_cycle_reason IS NULL OR irregular_cycle_reason IN ('iud', 'pcos', 'stress', 'health-condition', 'other'));

-- 3. Adicionar colunas de plano de dieta se não existirem
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS goal_deadline_weeks INTEGER;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS selected_diet_type TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS custom_diet_plan TEXT;

-- Adicionar constraint para selected_diet_type
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_selected_diet_type_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_selected_diet_type_check
CHECK (selected_diet_type IS NULL OR selected_diet_type IN ('mediterranean', 'low-carb', 'dash', 'plant-based', 'hypocaloric', 'personalized'));

-- 4. Comentários explicativos
COMMENT ON COLUMN user_profiles.uses_daily_feedback IS 'TRUE para usuárias com ciclo irregular que usam feedback diário ao invés de ciclo hormonal';
COMMENT ON COLUMN user_profiles.irregular_cycle_reason IS 'Motivo do ciclo irregular: iud (DIU), pcos (SOP), stress, health-condition, other';
COMMENT ON COLUMN user_profiles.goal_deadline_weeks IS 'Prazo em semanas para alcançar a meta de peso';
COMMENT ON COLUMN user_profiles.selected_diet_type IS 'Tipo de dieta selecionado pela usuária';
COMMENT ON COLUMN user_profiles.custom_diet_plan IS 'Plano de dieta personalizado gerado pela IA';

-- Sucesso!
SELECT 'Migração 009_fix_onboarding_fields concluída com sucesso! ✅' AS status;
