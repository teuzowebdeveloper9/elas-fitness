-- Migração para adicionar suporte a feedback diário (DIU e ciclo irregular)
-- Data: 2026-01-02

-- 1. Adicionar coluna uses_daily_feedback na tabela user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS uses_daily_feedback BOOLEAN DEFAULT FALSE;

-- Comentário explicativo
COMMENT ON COLUMN user_profiles.uses_daily_feedback IS 'TRUE para usuárias com DIU ou ciclo irregular que usam feedback diário ao invés de ciclo hormonal';

-- 2. Criar tabela para armazenar feedback diário
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_daily_feedback_user_id ON daily_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_feedback_date ON daily_feedback(date);
CREATE INDEX IF NOT EXISTS idx_daily_feedback_user_date ON daily_feedback(user_id, date DESC);

-- RLS (Row Level Security)
ALTER TABLE daily_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios feedbacks
CREATE POLICY "Users can view their own daily feedback"
  ON daily_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir seus próprios feedbacks
CREATE POLICY "Users can insert their own daily feedback"
  ON daily_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios feedbacks
CREATE POLICY "Users can update their own daily feedback"
  ON daily_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios feedbacks
CREATE POLICY "Users can delete their own daily feedback"
  ON daily_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários na tabela
COMMENT ON TABLE daily_feedback IS 'Armazena feedback diário de usuárias (usado para personalização quando uses_daily_feedback = TRUE)';
COMMENT ON COLUMN daily_feedback.energy_level IS 'Nível de energia do dia: low, medium, high';
COMMENT ON COLUMN daily_feedback.mood IS 'Humor do dia: sad, neutral, happy';
COMMENT ON COLUMN daily_feedback.physical_feeling IS 'Como está se sentindo fisicamente: pain, tired, good, great';
COMMENT ON COLUMN daily_feedback.sleep_quality IS 'Qualidade do sono da noite anterior: poor, ok, good, excellent';
COMMENT ON COLUMN daily_feedback.stress_level IS 'Nível de estresse: low, medium, high';

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_daily_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_daily_feedback_updated_at ON daily_feedback;
CREATE TRIGGER trigger_daily_feedback_updated_at
  BEFORE UPDATE ON daily_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_feedback_updated_at();

-- 3. Atualizar usuárias existentes com DIU ou ciclo irregular
-- (Isso pode ser feito manualmente depois, mas deixamos preparado)
-- UPDATE user_profiles
-- SET uses_daily_feedback = TRUE
-- WHERE life_phase IN ('iud', 'irregular-cycle');

-- Sucesso!
SELECT 'Migração 007_add_daily_feedback_support concluída com sucesso!' AS status;
