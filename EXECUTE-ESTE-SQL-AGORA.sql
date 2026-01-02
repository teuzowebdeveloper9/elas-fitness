-- ============================================
-- CORREÇÃO URGENTE - EXECUTE ESTE SQL AGORA!
-- ============================================
-- Este arquivo adiciona as colunas que faltam na tabela user_profiles
-- para que o onboarding funcione corretamente

-- 1. Adicionar coluna uses_daily_feedback
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'uses_daily_feedback'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN uses_daily_feedback BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna uses_daily_feedback adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna uses_daily_feedback já existe.';
    END IF;
END $$;

-- 2. Adicionar coluna irregular_cycle_reason
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'irregular_cycle_reason'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN irregular_cycle_reason TEXT;
        RAISE NOTICE 'Coluna irregular_cycle_reason adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna irregular_cycle_reason já existe.';
    END IF;
END $$;

-- 3. Adicionar coluna goal_deadline_weeks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'goal_deadline_weeks'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN goal_deadline_weeks INTEGER;
        RAISE NOTICE 'Coluna goal_deadline_weeks adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna goal_deadline_weeks já existe.';
    END IF;
END $$;

-- 4. Adicionar coluna selected_diet_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'selected_diet_type'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN selected_diet_type TEXT;
        RAISE NOTICE 'Coluna selected_diet_type adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna selected_diet_type já existe.';
    END IF;
END $$;

-- 5. Adicionar coluna custom_diet_plan
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'custom_diet_plan'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN custom_diet_plan TEXT;
        RAISE NOTICE 'Coluna custom_diet_plan adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna custom_diet_plan já existe.';
    END IF;
END $$;

-- 6. Atualizar constraint de life_phase (se necessário)
DO $$
BEGIN
    -- Remover constraint antiga
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_life_phase_check;

    -- Adicionar nova constraint
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_life_phase_check
    CHECK (life_phase IN ('menstrual', 'pre-menopause', 'menopause', 'post-menopause', 'irregular-cycle'));

    RAISE NOTICE 'Constraint de life_phase atualizada com sucesso!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao atualizar constraint: %', SQLERRM;
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN (
    'uses_daily_feedback',
    'irregular_cycle_reason',
    'goal_deadline_weeks',
    'selected_diet_type',
    'custom_diet_plan'
)
ORDER BY column_name;

-- Mensagem de sucesso
SELECT '✅ MIGRAÇÃO CONCLUÍDA! Agora você pode finalizar o onboarding.' AS status;
