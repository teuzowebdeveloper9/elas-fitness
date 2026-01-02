-- ============================================
-- MIGRAÇÃO COMPLETA - CORRIGE TODOS OS PROBLEMAS
-- ============================================

-- 1. Criar tabela saved_diets (se não existir)
CREATE TABLE IF NOT EXISTS saved_diets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diet_name TEXT NOT NULL,
  description TEXT,
  diet_data JSONB NOT NULL,
  nutrition_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Criar tabela diet_feedback (se não existir)
CREATE TABLE IF NOT EXISTS diet_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diet_id UUID REFERENCES saved_diets(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative', 'neutral')),
  feedback_text TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Criar tabela daily_feedback (se não existir)
CREATE TABLE IF NOT EXISTS daily_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  mood TEXT CHECK (mood IN ('sad', 'neutral', 'happy')),
  physical_feeling TEXT CHECK (physical_feeling IN ('pain', 'tired', 'good', 'great')),
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'ok', 'good', 'excellent')),
  stress_level TEXT CHECK (stress_level IN ('low', 'medium', 'high')),
  menstrual_flow TEXT CHECK (menstrual_flow IN ('none', 'light', 'moderate', 'heavy')),
  symptoms TEXT[], -- Array de sintomas
  notes TEXT,
  water_intake INTEGER DEFAULT 0, -- em ml
  meals_logged INTEGER DEFAULT 0,
  workout_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 4. Adicionar colunas faltando na tabela user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS uses_daily_feedback BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS irregular_cycle_reason TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS goal_deadline_weeks INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS selected_diet_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS custom_diet_plan TEXT;

-- 5. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_saved_diets_user_id ON saved_diets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_diets_is_active ON saved_diets(is_active);
CREATE INDEX IF NOT EXISTS idx_diet_feedback_user_id ON diet_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_feedback_diet_id ON diet_feedback(diet_id);
CREATE INDEX IF NOT EXISTS idx_daily_feedback_user_id ON daily_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_feedback_date ON daily_feedback(date);

-- 6. Ativar Row Level Security (RLS)
ALTER TABLE saved_diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_feedback ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS para saved_diets
DROP POLICY IF EXISTS saved_diets_select_policy ON saved_diets;
CREATE POLICY saved_diets_select_policy ON saved_diets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS saved_diets_insert_policy ON saved_diets;
CREATE POLICY saved_diets_insert_policy ON saved_diets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS saved_diets_update_policy ON saved_diets;
CREATE POLICY saved_diets_update_policy ON saved_diets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS saved_diets_delete_policy ON saved_diets;
CREATE POLICY saved_diets_delete_policy ON saved_diets
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Políticas RLS para diet_feedback
DROP POLICY IF EXISTS diet_feedback_select_policy ON diet_feedback;
CREATE POLICY diet_feedback_select_policy ON diet_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS diet_feedback_insert_policy ON diet_feedback;
CREATE POLICY diet_feedback_insert_policy ON diet_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS diet_feedback_update_policy ON diet_feedback;
CREATE POLICY diet_feedback_update_policy ON diet_feedback
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS diet_feedback_delete_policy ON diet_feedback;
CREATE POLICY diet_feedback_delete_policy ON diet_feedback
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Políticas RLS para daily_feedback
DROP POLICY IF EXISTS daily_feedback_select_policy ON daily_feedback;
CREATE POLICY daily_feedback_select_policy ON daily_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS daily_feedback_insert_policy ON daily_feedback;
CREATE POLICY daily_feedback_insert_policy ON daily_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS daily_feedback_update_policy ON daily_feedback;
CREATE POLICY daily_feedback_update_policy ON daily_feedback
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS daily_feedback_delete_policy ON daily_feedback;
CREATE POLICY daily_feedback_delete_policy ON daily_feedback
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Criar triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_saved_diets_updated_at ON saved_diets;
CREATE TRIGGER update_saved_diets_updated_at
  BEFORE UPDATE ON saved_diets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_feedback_updated_at ON daily_feedback;
CREATE TRIGGER update_daily_feedback_updated_at
  BEFORE UPDATE ON daily_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRAÇÃO COMPLETA!
-- ============================================
-- Este SQL cria todas as tabelas e colunas necessárias
-- para o funcionamento completo da funcionalidade de Dieta
-- ============================================
