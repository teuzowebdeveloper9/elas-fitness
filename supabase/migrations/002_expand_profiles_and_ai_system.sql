-- ============================================
-- EXPANSÃO DO SISTEMA - BIOIMPEDÂNCIA E IA
-- ============================================
-- Este SQL expande o sistema para incluir:
-- - Dados completos de bioimpedância
-- - Preferências alimentares detalhadas
-- - Treinos personalizados gerados por IA
-- - Dietas personalizadas geradas por IA

-- ============================================
-- 1. EXPANDIR TABELA user_profiles
-- ============================================
-- Adicionar colunas para bioimpedância e dados nutricionais
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS goal_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS body_fat_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS muscle_mass DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS bmi DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ideal_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS daily_calories INTEGER,
ADD COLUMN IF NOT EXISTS fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS exercise_frequency INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS goals TEXT[],
ADD COLUMN IF NOT EXISTS challenges TEXT[],
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[],
ADD COLUMN IF NOT EXISTS health_conditions TEXT[],
ADD COLUMN IF NOT EXISTS cycle_regular BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS has_menstrual_cycle BOOLEAN DEFAULT TRUE;

-- ============================================
-- 2. TABELA DE PREFERÊNCIAS ALIMENTARES
-- ============================================
CREATE TABLE IF NOT EXISTS food_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Hábitos alimentares
  meals_per_day INTEGER DEFAULT 3,
  breakfast_time TIME,
  lunch_time TIME,
  dinner_time TIME,
  snacks_preference BOOLEAN DEFAULT TRUE,

  -- Preferências
  favorite_foods TEXT[],
  disliked_foods TEXT[],
  allergies TEXT[],

  -- Contexto alimentar
  cooking_skill TEXT CHECK (cooking_skill IN ('beginner', 'intermediate', 'advanced')),
  time_for_cooking INTEGER, -- minutos disponíveis por refeição
  eats_out_frequency TEXT CHECK (eats_out_frequency IN ('never', 'rarely', 'sometimes', 'often', 'daily')),

  -- Objetivos nutricionais
  water_goal_liters DECIMAL(3,1) DEFAULT 2.0,
  protein_goal_grams INTEGER,
  carbs_goal_grams INTEGER,
  fats_goal_grams INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE food_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own food preferences"
  ON food_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food preferences"
  ON food_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food preferences"
  ON food_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food preferences"
  ON food_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. TABELA DE DIETAS GERADAS POR IA
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generated_diets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Metadados
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  diet_name TEXT NOT NULL,
  description TEXT,

  -- Dados nutricionais gerais
  total_daily_calories INTEGER,
  daily_protein_grams INTEGER,
  daily_carbs_grams INTEGER,
  daily_fats_grams INTEGER,

  -- Plano completo (JSON com todas as refeições da semana)
  meal_plan JSONB NOT NULL,
  -- Exemplo de estrutura:
  -- {
  --   "monday": { "breakfast": {...}, "lunch": {...}, "dinner": {...}, "snacks": [...] },
  --   "tuesday": { ... },
  --   ...
  -- }

  -- Informações adicionais
  shopping_list TEXT[],
  tips TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_generated_diets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own diets"
  ON ai_generated_diets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diets"
  ON ai_generated_diets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diets"
  ON ai_generated_diets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diets"
  ON ai_generated_diets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. TABELA DE TREINOS GERADOS POR IA
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generated_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Metadados
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  workout_name TEXT NOT NULL,
  description TEXT,

  -- Tipo e categoria
  workout_type TEXT CHECK (workout_type IN ('musculacao', 'casa', 'abdominal', 'funcional', 'danca')),
  mobility_type TEXT CHECK (mobility_type IN ('inferior', 'superior', 'completa', 'none')),

  -- Características
  duration_minutes INTEGER NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_calories INTEGER,

  -- Plano de treino completo (JSON)
  workout_plan JSONB NOT NULL,
  -- Exemplo:
  -- {
  --   "warmup": [...],
  --   "main_exercises": [...],
  --   "cooldown": [...],
  --   "mobility_exercises": [...]
  -- }

  -- Informações adicionais
  equipment_needed TEXT[],
  tips TEXT[],
  adaptations TEXT[], -- adaptações para fase do ciclo/menopausa

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_generated_workouts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own workouts"
  ON ai_generated_workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON ai_generated_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON ai_generated_workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON ai_generated_workouts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. TABELA DE SESSÕES DE TREINO
-- ============================================
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES ai_generated_workouts(id) ON DELETE SET NULL,

  -- Data e tempo
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  available_time_minutes INTEGER NOT NULL,
  actual_duration_minutes INTEGER,

  -- Status
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')) DEFAULT 'planned',

  -- Dados da sessão
  exercises_completed INTEGER,
  total_exercises INTEGER,
  calories_burned INTEGER,

  -- Feedback
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own workout sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE TRIGGER update_food_preferences_updated_at
  BEFORE UPDATE ON food_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_generated_diets_updated_at
  BEFORE UPDATE ON ai_generated_diets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_generated_workouts_updated_at
  BEFORE UPDATE ON ai_generated_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. INDEXES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_food_preferences_user ON food_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_diets_user_active ON ai_generated_diets(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_workouts_user_active ON ai_generated_workouts(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_workouts_type ON ai_generated_workouts(workout_type);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON workout_sessions(user_id, status);

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
