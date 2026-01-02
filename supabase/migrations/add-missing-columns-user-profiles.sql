-- ============================================
-- ADICIONAR COLUNAS FALTANDO EM user_profiles
-- ============================================

-- Adicionar colunas de metas nutricionais
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS protein_goal INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS carbs_goal INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fats_goal INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS water_goal DECIMAL(3,1);

-- Adicionar colunas de dieta e feedback
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS uses_daily_feedback BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS irregular_cycle_reason TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS goal_deadline_weeks INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS selected_diet_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS custom_diet_plan TEXT;

-- ============================================
-- PRONTO! Agora o app pode salvar as metas
-- ============================================
