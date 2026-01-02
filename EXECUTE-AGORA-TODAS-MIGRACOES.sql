-- ============================================
-- MIGRAÇÃO COMPLETA - EXECUTE ESTE ARQUIVO AGORA!
-- ============================================
-- Este arquivo contém TODAS as migrações necessárias para o app funcionar

-- ============================================
-- 1. TABELA: saved_diets (para salvar dietas)
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_saved_diets_user_id ON saved_diets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_diets_is_active ON saved_diets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_diet_feedback_diet_id ON diet_feedback(diet_id);

-- RLS
ALTER TABLE saved_diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS saved_diets_select_policy ON saved_diets;
DROP POLICY IF EXISTS saved_diets_insert_policy ON saved_diets;
DROP POLICY IF EXISTS saved_diets_update_policy ON saved_diets;
DROP POLICY IF EXISTS saved_diets_delete_policy ON saved_diets;
DROP POLICY IF EXISTS diet_feedback_select_policy ON diet_feedback;
DROP POLICY IF EXISTS diet_feedback_insert_policy ON diet_feedback;
DROP POLICY IF EXISTS diet_feedback_update_policy ON diet_feedback;
DROP POLICY IF EXISTS diet_feedback_delete_policy ON diet_feedback;

CREATE POLICY saved_diets_select_policy ON saved_diets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY saved_diets_insert_policy ON saved_diets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY saved_diets_update_policy ON saved_diets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY saved_diets_delete_policy ON saved_diets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY diet_feedback_select_policy ON diet_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY diet_feedback_insert_policy ON diet_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY diet_feedback_update_policy ON diet_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY diet_feedback_delete_policy ON diet_feedback FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. CAMPOS FALTANDO NO user_profiles
-- ============================================
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS uses_daily_feedback BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS irregular_cycle_reason TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS goal_deadline_weeks INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS selected_diet_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS custom_diet_plan TEXT;

-- Atualizar constraints
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_life_phase_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_life_phase_check
CHECK (life_phase IN ('menstrual', 'pre-menopause', 'menopause', 'post-menopause', 'irregular-cycle'));

ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_irregular_cycle_reason_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_irregular_cycle_reason_check
CHECK (irregular_cycle_reason IS NULL OR irregular_cycle_reason IN ('iud', 'pcos', 'stress', 'health-condition', 'other'));

ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_selected_diet_type_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_selected_diet_type_check
CHECK (selected_diet_type IS NULL OR selected_diet_type IN ('mediterranean', 'low-carb', 'dash', 'plant-based', 'hypocaloric', 'personalized'));

-- ============================================
-- 3. TABELA: daily_feedback (ciclo irregular)
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
CREATE INDEX IF NOT EXISTS idx_daily_feedback_user_date ON daily_feedback(user_id, date DESC);

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
-- SUCESSO!
-- ============================================
SELECT '✅ TODAS AS MIGRAÇÕES EXECUTADAS COM SUCESSO!' AS status;
