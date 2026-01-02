-- ============================================
-- CORRIGIR OVERFLOW DE CAMPOS NUMÉRICOS
-- ============================================

-- Alterar tipo de dados para suportar valores maiores

-- Campos de macronutrientes (podem ser até 300g cada)
ALTER TABLE user_profiles
  ALTER COLUMN protein_goal TYPE INTEGER USING protein_goal::integer;

ALTER TABLE user_profiles
  ALTER COLUMN carbs_goal TYPE INTEGER USING carbs_goal::integer;

ALTER TABLE user_profiles
  ALTER COLUMN fats_goal TYPE INTEGER USING fats_goal::integer;

-- Meta de água (pode ser até 5.0 litros)
ALTER TABLE user_profiles
  ALTER COLUMN water_goal TYPE DECIMAL(4,1) USING water_goal::numeric(4,1);

-- Calorias diárias (podem ser até 3000 kcal)
ALTER TABLE user_profiles
  ALTER COLUMN daily_calories TYPE INTEGER USING daily_calories::integer;

-- Peso ideal (pode ser até 150 kg)
ALTER TABLE user_profiles
  ALTER COLUMN ideal_weight TYPE DECIMAL(5,1) USING ideal_weight::numeric(5,1);

-- BMI (pode ser até 60)
ALTER TABLE user_profiles
  ALTER COLUMN bmi TYPE DECIMAL(4,1) USING bmi::numeric(4,1);

-- Percentual de gordura (pode ser até 60%)
ALTER TABLE user_profiles
  ALTER COLUMN body_fat_percentage TYPE DECIMAL(4,1) USING body_fat_percentage::numeric(4,1);

-- ============================================
-- PRONTO! Agora os campos suportam valores reais
-- ============================================
