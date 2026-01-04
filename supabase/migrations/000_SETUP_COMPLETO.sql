-- ============================================
-- 🚀 SETUP COMPLETO DO BANCO - ELAS FITNESS
-- ============================================
-- Execute este SQL para configurar todo o banco do zero
-- Criado em: 2026-01-04
-- ============================================

-- ============================================
-- 0. FUNÇÃO AUXILIAR PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. TABELA user_profiles (BASE)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  goal TEXT CHECK (goal IN ('lose-weight', 'gain-muscle', 'maintain', 'health')),
  life_phase TEXT CHECK (life_phase IN ('menstrual', 'pre-menopause', 'menopause', 'post-menopause', 'irregular-cycle')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Dados de bioimpedância
  goal_weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  bmi DECIMAL(5,2),
  ideal_weight DECIMAL(5,2),
  daily_calories INTEGER,
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  exercise_frequency INTEGER DEFAULT 3,
  goals TEXT[],
  challenges TEXT[],
  dietary_restrictions TEXT[],
  health_conditions TEXT[],
  cycle_regular BOOLEAN DEFAULT TRUE,
  has_menstrual_cycle BOOLEAN DEFAULT TRUE,
  
  -- Metas nutricionais
  protein_goal INTEGER,
  carbs_goal INTEGER,
  fats_goal INTEGER,
  water_goal DECIMAL(3,1),
  
  -- Feedback diário e ciclo irregular
  uses_daily_feedback BOOLEAN DEFAULT FALSE,
  irregular_cycle_reason TEXT CHECK (irregular_cycle_reason IS NULL OR irregular_cycle_reason IN ('iud', 'pcos', 'stress', 'health-condition', 'other')),
  
  -- Dieta
  goal_deadline_weeks INTEGER,
  selected_diet_type TEXT CHECK (selected_diet_type IS NULL OR selected_diet_type IN ('mediterranean', 'low-carb', 'dash', 'plant-based', 'hypocaloric', 'personalized')),
  custom_diet_plan TEXT,
  
  -- Nível de atividade
  activity_level TEXT CHECK (activity_level IS NULL OR activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. TABELA body_measurements
-- ============================================
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weight NUMERIC(5, 1),
  height NUMERIC(5, 1),
  body_fat_percentage NUMERIC(4, 1),
  muscle_mass NUMERIC(5, 1),
  neck NUMERIC(5, 1),
  shoulders NUMERIC(5, 1),
  chest NUMERIC(5, 1),
  waist NUMERIC(5, 1),
  abdomen NUMERIC(5, 1),
  hips NUMERIC(5, 1),
  arm_right NUMERIC(5, 1),
  arm_left NUMERIC(5, 1),
  forearm_right NUMERIC(5, 1),
  forearm_left NUMERIC(5, 1),
  thigh_right NUMERIC(5, 1),
  thigh_left NUMERIC(5, 1),
  calf_right NUMERIC(5, 1),
  calf_left NUMERIC(5, 1),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_measured_at ON body_measurements(measured_at DESC);

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can insert their own measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can update their own measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can delete their own measurements" ON body_measurements;

CREATE POLICY "Users can view their own measurements" ON body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own measurements" ON body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own measurements" ON body_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own measurements" ON body_measurements FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. TABELA food_preferences
-- ============================================
CREATE TABLE IF NOT EXISTS food_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meals_per_day INTEGER DEFAULT 3,
  breakfast_time TIME,
  lunch_time TIME,
  dinner_time TIME,
  snacks_preference BOOLEAN DEFAULT TRUE,
  favorite_foods TEXT[],
  disliked_foods TEXT[],
  allergies TEXT[],
  cooking_skill TEXT CHECK (cooking_skill IN ('beginner', 'intermediate', 'advanced')),
  time_for_cooking INTEGER,
  eats_out_frequency TEXT CHECK (eats_out_frequency IN ('never', 'rarely', 'sometimes', 'often', 'daily')),
  water_goal_liters DECIMAL(3,1) DEFAULT 2.0,
  protein_goal_grams INTEGER,
  carbs_goal_grams INTEGER,
  fats_goal_grams INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE food_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own food preferences" ON food_preferences;
DROP POLICY IF EXISTS "Users can insert own food preferences" ON food_preferences;
DROP POLICY IF EXISTS "Users can update own food preferences" ON food_preferences;
DROP POLICY IF EXISTS "Users can delete own food preferences" ON food_preferences;

CREATE POLICY "Users can view own food preferences" ON food_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food preferences" ON food_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food preferences" ON food_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food preferences" ON food_preferences FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. TABELA ai_generated_workouts
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generated_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  workout_name TEXT NOT NULL,
  description TEXT,
  workout_type TEXT CHECK (workout_type IN ('musculacao', 'casa', 'abdominal', 'funcional', 'danca')),
  mobility_type TEXT CHECK (mobility_type IN ('inferior', 'superior', 'completa', 'none')),
  duration_minutes INTEGER NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_calories INTEGER,
  workout_plan JSONB NOT NULL,
  equipment_needed TEXT[],
  tips TEXT[],
  adaptations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_generated_workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own workouts" ON ai_generated_workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON ai_generated_workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON ai_generated_workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON ai_generated_workouts;

CREATE POLICY "Users can view own workouts" ON ai_generated_workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON ai_generated_workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON ai_generated_workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON ai_generated_workouts FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. TABELA workout_sessions
-- ============================================
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES ai_generated_workouts(id) ON DELETE SET NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  available_time_minutes INTEGER NOT NULL DEFAULT 30,
  actual_duration_minutes INTEGER,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')) DEFAULT 'planned',
  exercises_completed INTEGER,
  total_exercises INTEGER,
  calories_burned INTEGER,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  notes TEXT,
  photo_url TEXT,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_text TEXT,
  published_to_feed BOOLEAN DEFAULT false,
  cardio_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON workout_sessions(user_id, status);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can insert own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can update own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can delete own workout sessions" ON workout_sessions;

CREATE POLICY "Users can view own workout sessions" ON workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout sessions" ON workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sessions" ON workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sessions" ON workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. TABELA exercise_weights
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight_kg DECIMAL(5,2),
  reps INTEGER,
  sets INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercise_weights_user ON exercise_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_weights_session ON exercise_weights(session_id);

ALTER TABLE exercise_weights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own weights" ON exercise_weights;
DROP POLICY IF EXISTS "Users can insert their own weights" ON exercise_weights;
DROP POLICY IF EXISTS "Users can update their own weights" ON exercise_weights;
DROP POLICY IF EXISTS "Users can delete their own weights" ON exercise_weights;

CREATE POLICY "Users can view their own weights" ON exercise_weights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weights" ON exercise_weights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weights" ON exercise_weights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weights" ON exercise_weights FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. TABELA ai_generated_diets
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generated_diets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  diet_name TEXT NOT NULL,
  description TEXT,
  total_daily_calories INTEGER,
  daily_protein_grams INTEGER,
  daily_carbs_grams INTEGER,
  daily_fats_grams INTEGER,
  meal_plan JSONB NOT NULL,
  shopping_list TEXT[],
  tips TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_generated_diets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own diets" ON ai_generated_diets;
DROP POLICY IF EXISTS "Users can insert own diets" ON ai_generated_diets;
DROP POLICY IF EXISTS "Users can update own diets" ON ai_generated_diets;
DROP POLICY IF EXISTS "Users can delete own diets" ON ai_generated_diets;

CREATE POLICY "Users can view own diets" ON ai_generated_diets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diets" ON ai_generated_diets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diets" ON ai_generated_diets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diets" ON ai_generated_diets FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 8. TABELA saved_diets
-- ============================================
CREATE TABLE IF NOT EXISTS saved_diets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diet_name TEXT NOT NULL,
  description TEXT,
  diet_data JSONB NOT NULL,
  nutrition_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_regenerated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_saved_diets_user_id ON saved_diets(user_id);

ALTER TABLE saved_diets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_diets_select_policy" ON saved_diets;
DROP POLICY IF EXISTS "saved_diets_insert_policy" ON saved_diets;
DROP POLICY IF EXISTS "saved_diets_update_policy" ON saved_diets;
DROP POLICY IF EXISTS "saved_diets_delete_policy" ON saved_diets;

CREATE POLICY "saved_diets_select_policy" ON saved_diets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_diets_insert_policy" ON saved_diets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_diets_update_policy" ON saved_diets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_diets_delete_policy" ON saved_diets FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 9. TABELA diet_feedback
-- ============================================
CREATE TABLE IF NOT EXISTS diet_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diet_id UUID NOT NULL REFERENCES saved_diets(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL,
  meal_day TEXT,
  meal_type TEXT,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE diet_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "diet_feedback_select_policy" ON diet_feedback;
DROP POLICY IF EXISTS "diet_feedback_insert_policy" ON diet_feedback;
DROP POLICY IF EXISTS "diet_feedback_update_policy" ON diet_feedback;
DROP POLICY IF EXISTS "diet_feedback_delete_policy" ON diet_feedback;

CREATE POLICY "diet_feedback_select_policy" ON diet_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "diet_feedback_insert_policy" ON diet_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "diet_feedback_update_policy" ON diet_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "diet_feedback_delete_policy" ON diet_feedback FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 10. TABELA daily_feedback
-- ============================================
CREATE TABLE IF NOT EXISTS daily_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  mood TEXT CHECK (mood IN ('sad', 'neutral', 'happy')),
  physical_feeling TEXT CHECK (physical_feeling IN ('pain', 'tired', 'good', 'great')),
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'ok', 'good', 'excellent')),
  stress_level TEXT CHECK (stress_level IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_feedback_user_id ON daily_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_feedback_date ON daily_feedback(date);

ALTER TABLE daily_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily feedback" ON daily_feedback;
DROP POLICY IF EXISTS "Users can insert their own daily feedback" ON daily_feedback;
DROP POLICY IF EXISTS "Users can update their own daily feedback" ON daily_feedback;
DROP POLICY IF EXISTS "Users can delete their own daily feedback" ON daily_feedback;

CREATE POLICY "Users can view their own daily feedback" ON daily_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily feedback" ON daily_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily feedback" ON daily_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily feedback" ON daily_feedback FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 11. TABELA meals_tracking
-- ============================================
CREATE TABLE IF NOT EXISTS meals_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name TEXT,
  foods JSONB,
  calories INTEGER,
  protein_grams DECIMAL(5,1),
  carbs_grams DECIMAL(5,1),
  fats_grams DECIMAL(5,1),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_tracking_user ON meals_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_tracking_date ON meals_tracking(user_id, date DESC);

ALTER TABLE meals_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meals" ON meals_tracking;
DROP POLICY IF EXISTS "Users can insert own meals" ON meals_tracking;
DROP POLICY IF EXISTS "Users can update own meals" ON meals_tracking;
DROP POLICY IF EXISTS "Users can delete own meals" ON meals_tracking;

CREATE POLICY "Users can view own meals" ON meals_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON meals_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON meals_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON meals_tracking FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 12. TABELA completed_workouts (histórico)
-- ============================================
CREATE TABLE IF NOT EXISTS completed_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_name TEXT NOT NULL,
  workout_type TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  exercises_data JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_completed_workouts_user ON completed_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_workouts_date ON completed_workouts(completed_at DESC);

ALTER TABLE completed_workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own completed workouts" ON completed_workouts;
DROP POLICY IF EXISTS "Users can insert own completed workouts" ON completed_workouts;
DROP POLICY IF EXISTS "Users can update own completed workouts" ON completed_workouts;
DROP POLICY IF EXISTS "Users can delete own completed workouts" ON completed_workouts;

CREATE POLICY "Users can view own completed workouts" ON completed_workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completed workouts" ON completed_workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completed workouts" ON completed_workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own completed workouts" ON completed_workouts FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 13. VIEWS PARA ESTATÍSTICAS
-- ============================================
DROP VIEW IF EXISTS user_progress_stats;
CREATE VIEW user_progress_stats AS
SELECT
  user_id,
  COUNT(DISTINCT id) as total_workouts,
  AVG(actual_duration_minutes) as avg_duration,
  MAX(completed_at) as last_workout,
  COUNT(CASE WHEN completed_at >= NOW() - INTERVAL '7 days' THEN 1 END) as workouts_this_week,
  COUNT(CASE WHEN completed_at >= NOW() - INTERVAL '30 days' THEN 1 END) as workouts_this_month
FROM workout_sessions
WHERE status = 'completed'
GROUP BY user_id;

DROP VIEW IF EXISTS exercise_weight_progression;
CREATE VIEW exercise_weight_progression AS
SELECT
  user_id,
  exercise_name,
  weight_kg,
  created_at,
  LAG(weight_kg) OVER (PARTITION BY user_id, exercise_name ORDER BY created_at) as previous_weight,
  weight_kg - LAG(weight_kg) OVER (PARTITION BY user_id, exercise_name ORDER BY created_at) as weight_increase
FROM exercise_weights
WHERE weight_kg IS NOT NULL
ORDER BY user_id, exercise_name, created_at DESC;

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================
SELECT '✅ SETUP COMPLETO DO BANCO ELAS FITNESS!' AS status;

