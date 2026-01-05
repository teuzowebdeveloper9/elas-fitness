-- ============================================
-- FIX: Adicionar TODAS as colunas faltando em user_profiles
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- Nível de atividade
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS activity_level TEXT;

-- Medidas corporais (usadas no onboarding)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hips DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS waist DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chest DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS neck DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS shoulders DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS abdomen DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS arm_right DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS arm_left DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS forearm_right DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS forearm_left DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS thigh_right DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS thigh_left DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS calf_right DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS calf_left DECIMAL(5,2);

-- Bioimpedância extra
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS body_fat_percentage DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS muscle_mass DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bmi DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ideal_weight DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_calories INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS goal_weight DECIMAL(5,2);

-- Fitness e exercício
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fitness_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS exercise_frequency INTEGER DEFAULT 3;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS goals TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS challenges TEXT[];

-- Dieta e saúde
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS health_conditions TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cycle_regular BOOLEAN DEFAULT TRUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_menstrual_cycle BOOLEAN DEFAULT TRUE;

-- Metas nutricionais
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS protein_goal INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS carbs_goal INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fats_goal INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS water_goal DECIMAL(3,1);

-- Feedback diário e ciclo irregular
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS uses_daily_feedback BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS irregular_cycle_reason TEXT;

-- Dieta
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS goal_deadline_weeks INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS selected_diet_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS custom_diet_plan TEXT;

-- Verificar colunas criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

SELECT '✅ Todas as colunas adicionadas com sucesso!' AS status;




