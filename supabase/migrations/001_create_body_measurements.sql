-- Criar tabela de medidas corporais
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at TIMESTAMPTZ NOT NULL,

  -- Medidas básicas
  weight NUMERIC(5, 1),
  height NUMERIC(5, 1),

  -- Composição corporal
  body_fat_percentage NUMERIC(4, 1),
  muscle_mass NUMERIC(5, 1),

  -- Medidas do corpo
  neck NUMERIC(5, 1),
  shoulders NUMERIC(5, 1),
  chest NUMERIC(5, 1),
  waist NUMERIC(5, 1),
  abdomen NUMERIC(5, 1),
  hips NUMERIC(5, 1),

  -- Membros superiores
  arm_right NUMERIC(5, 1),
  arm_left NUMERIC(5, 1),
  forearm_right NUMERIC(5, 1),
  forearm_left NUMERIC(5, 1),

  -- Membros inferiores
  thigh_right NUMERIC(5, 1),
  thigh_left NUMERIC(5, 1),
  calf_right NUMERIC(5, 1),
  calf_left NUMERIC(5, 1),

  -- Informações adicionais
  notes TEXT,
  photo_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_measured_at ON body_measurements(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON body_measurements(user_id, measured_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver suas próprias medidas
CREATE POLICY "Users can view their own measurements"
  ON body_measurements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários só podem inserir suas próprias medidas
CREATE POLICY "Users can insert their own measurements"
  ON body_measurements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar suas próprias medidas
CREATE POLICY "Users can update their own measurements"
  ON body_measurements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem deletar suas próprias medidas
CREATE POLICY "Users can delete their own measurements"
  ON body_measurements
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_body_measurements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER body_measurements_updated_at
  BEFORE UPDATE ON body_measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_body_measurements_updated_at();
