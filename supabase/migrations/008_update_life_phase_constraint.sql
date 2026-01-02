-- Migração para atualizar constraint de life_phase
-- Adiciona suporte para 'irregular-cycle'
-- Data: 2026-01-02

-- 1. Remover constraint antiga de life_phase
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_life_phase_check;

-- 2. Adicionar nova constraint com todos os valores incluindo 'irregular-cycle'
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_life_phase_check
CHECK (life_phase IN ('menstrual', 'pre-menopause', 'menopause', 'post-menopause', 'irregular-cycle'));

-- Comentário
COMMENT ON COLUMN user_profiles.life_phase IS 'Fase da vida: menstrual, pre-menopause, menopause, post-menopause, irregular-cycle';

-- Sucesso!
SELECT 'Migração 008_update_life_phase_constraint concluída com sucesso!' AS status;
