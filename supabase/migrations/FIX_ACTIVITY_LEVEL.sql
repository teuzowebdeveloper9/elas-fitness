-- FIX: Adicionar coluna activity_level que está faltando
-- Execute este SQL no Supabase Dashboard > SQL Editor

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS activity_level TEXT 
CHECK (activity_level IS NULL OR activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active'));

-- Comentário explicativo
COMMENT ON COLUMN user_profiles.activity_level IS 'Nível de atividade física: sedentary, light, moderate, active, very_active';

-- Verificar se foi criado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'activity_level';

SELECT '✅ Coluna activity_level adicionada com sucesso!' AS status;




