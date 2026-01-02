-- ============================================
-- CORREÇÃO COMPLETA PARA O ONBOARDING
-- Execute este arquivo SQL no Supabase para corrigir todos os erros
-- ============================================

-- 1. Atualizar constraint de life_phase para incluir 'irregular-cycle'
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_life_phase_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_life_phase_check
CHECK (life_phase IN ('menstrual', 'pre-menopause', 'menopause', 'post-menopause', 'irregular-cycle'));

-- 2. Adicionar colunas para feedback diário e ciclo irregular
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS uses_daily_feedback BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS irregular_cycle_reason TEXT;

-- Atualizar constraint de irregular_cycle_reason
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_irregular_cycle_reason_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_irregular_cycle_reason_check
CHECK (irregular_cycle_reason IS NULL OR irregular_cycle_reason IN ('iud', 'pcos', 'stress', 'health-condition', 'other'));

-- 3. Adicionar colunas de plano de dieta se não existirem
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS goal_deadline_weeks INTEGER;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS selected_diet_type TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS custom_diet_plan TEXT;

-- Adicionar constraint para selected_diet_type
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_selected_diet_type_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_selected_diet_type_check
CHECK (selected_diet_type IS NULL OR selected_diet_type IN ('mediterranean', 'low-carb', 'dash', 'plant-based', 'hypocaloric', 'personalized'));

-- 4. Criar tabela para feedback diário (se não existir)
CREATE TABLE IF NOT EXISTS daily_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Feedback do dia
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  mood TEXT CHECK (mood IN ('sad', 'neutral', 'happy')),
  physical_feeling TEXT CHECK (physical_feeling IN ('pain', 'tired', 'good', 'great')),
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'ok', 'good', 'excellent')),
  stress_level TEXT CHECK (stress_level IN ('low', 'medium', 'high')),

  -- Notas adicionais (opcional)
  notes TEXT,

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Garantir apenas um feedback por usuário por dia
  UNIQUE(user_id, date)
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_daily_feedback_user_id ON daily_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_feedback_date ON daily_feedback(date);
CREATE INDEX IF NOT EXISTS idx_daily_feedback_user_date ON daily_feedback(user_id, date DESC);

-- 6. RLS (Row Level Security) para daily_feedback
ALTER TABLE daily_feedback ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes para recriar
DROP POLICY IF EXISTS "Users can view their own daily feedback" ON daily_feedback;
DROP POLICY IF EXISTS "Users can insert their own daily feedback" ON daily_feedback;
DROP POLICY IF EXISTS "Users can update their own daily feedback" ON daily_feedback;
DROP POLICY IF EXISTS "Users can delete their own daily feedback" ON daily_feedback;

-- Criar policies
CREATE POLICY "Users can view their own daily feedback"
  ON daily_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily feedback"
  ON daily_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily feedback"
  ON daily_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily feedback"
  ON daily_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Comentários explicativos
COMMENT ON COLUMN user_profiles.uses_daily_feedback IS 'TRUE para usuárias com ciclo irregular que usam feedback diário ao invés de ciclo hormonal';
COMMENT ON COLUMN user_profiles.irregular_cycle_reason IS 'Motivo do ciclo irregular: iud (DIU), pcos (SOP), stress, health-condition, other';
COMMENT ON COLUMN user_profiles.goal_deadline_weeks IS 'Prazo em semanas para alcançar a meta de peso';
COMMENT ON COLUMN user_profiles.selected_diet_type IS 'Tipo de dieta selecionado pela usuária';
COMMENT ON COLUMN user_profiles.custom_diet_plan IS 'Plano de dieta personalizado gerado pela IA';

COMMENT ON TABLE daily_feedback IS 'Armazena feedback diário de usuárias (usado para personalização quando uses_daily_feedback = TRUE)';

-- ============================================
-- SUCESSO! ✅
-- ============================================
SELECT 'Correção completa do onboarding aplicada com sucesso! Você pode agora finalizar seu cadastro.' AS status;
