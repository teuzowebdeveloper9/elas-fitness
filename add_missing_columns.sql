-- Adicionar todas as colunas que estão faltando na tabela user_profiles

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS neck DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS waist DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS hips DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS protein_goal INTEGER,
ADD COLUMN IF NOT EXISTS carbs_goal INTEGER,
ADD COLUMN IF NOT EXISTS fats_goal INTEGER,
ADD COLUMN IF NOT EXISTS activity_level TEXT;
