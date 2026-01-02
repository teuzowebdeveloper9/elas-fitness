-- ============================================
-- CRIAR TABELA saved_diets E diet_feedback
-- ============================================

-- Criar tabela para armazenar dietas salvas
CREATE TABLE IF NOT EXISTS saved_diets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diet_name TEXT NOT NULL,
  description TEXT,
  diet_data JSONB NOT NULL, -- Armazena toda a estrutura da dieta
  nutrition_data JSONB, -- Armazena dados de calorias e macros
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_regenerated_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela para feedback e ajustes de dieta
CREATE TABLE IF NOT EXISTS diet_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diet_id UUID NOT NULL REFERENCES saved_diets(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL, -- 'liked', 'disliked', 'adapted', 'change_request'
  meal_day TEXT, -- Segunda, Terça, etc
  meal_type TEXT, -- breakfast, lunch, dinner, snack
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_saved_diets_user_id ON saved_diets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_diets_is_active ON saved_diets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_diet_feedback_diet_id ON diet_feedback(diet_id);

-- RLS Policies
ALTER TABLE saved_diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_feedback ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS saved_diets_select_policy ON saved_diets;
DROP POLICY IF EXISTS saved_diets_insert_policy ON saved_diets;
DROP POLICY IF EXISTS saved_diets_update_policy ON saved_diets;
DROP POLICY IF EXISTS saved_diets_delete_policy ON saved_diets;
DROP POLICY IF EXISTS diet_feedback_select_policy ON diet_feedback;
DROP POLICY IF EXISTS diet_feedback_insert_policy ON diet_feedback;
DROP POLICY IF EXISTS diet_feedback_update_policy ON diet_feedback;
DROP POLICY IF EXISTS diet_feedback_delete_policy ON diet_feedback;

-- Usuários podem ver apenas suas próprias dietas
CREATE POLICY saved_diets_select_policy ON saved_diets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY saved_diets_insert_policy ON saved_diets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY saved_diets_update_policy ON saved_diets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY saved_diets_delete_policy ON saved_diets
  FOR DELETE USING (auth.uid() = user_id);

-- Usuários podem ver apenas seus próprios feedbacks
CREATE POLICY diet_feedback_select_policy ON diet_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY diet_feedback_insert_policy ON diet_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY diet_feedback_update_policy ON diet_feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY diet_feedback_delete_policy ON diet_feedback
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PRONTO! Tabelas criadas para dietas
-- ============================================
