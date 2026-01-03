-- Criar tabela de medidas corporais
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Data da medição
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Medidas básicas
  weight DECIMAL(5,2), -- Peso em kg
  height DECIMAL(5,2), -- Altura em cm (pode mudar para usuárias jovens)

  -- Medidas corporais em cm
  neck DECIMAL(5,2), -- Pescoço
  shoulders DECIMAL(5,2), -- Ombros
  chest DECIMAL(5,2), -- Busto/Peito
  waist DECIMAL(5,2), -- Cintura
  abdomen DECIMAL(5,2), -- Abdômen
  hips DECIMAL(5,2), -- Quadril
  thigh_right DECIMAL(5,2), -- Coxa direita
  thigh_left DECIMAL(5,2), -- Coxa esquerda
  calf_right DECIMAL(5,2), -- Panturrilha direita
  calf_left DECIMAL(5,2), -- Panturrilha esquerda
  arm_right DECIMAL(5,2), -- Braço direito
  arm_left DECIMAL(5,2), -- Braço esquerdo
  forearm_right DECIMAL(5,2), -- Antebraço direito
  forearm_left DECIMAL(5,2), -- Antebraço esquerdo

  -- Composição corporal (opcional)
  body_fat_percentage DECIMAL(5,2), -- % de gordura corporal
  muscle_mass DECIMAL(5,2), -- Massa muscular em kg

  -- Observações
  notes TEXT,

  -- Foto de progresso (URL)
  photo_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_measured_at ON body_measurements(measured_at DESC);

-- RLS (Row Level Security)
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

-- Política: Usuárias podem ver apenas suas próprias medidas
CREATE POLICY "Users can view own measurements"
  ON body_measurements FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuárias podem inserir suas próprias medidas
CREATE POLICY "Users can insert own measurements"
  ON body_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuárias podem atualizar suas próprias medidas
CREATE POLICY "Users can update own measurements"
  ON body_measurements FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuárias podem deletar suas próprias medidas
CREATE POLICY "Users can delete own measurements"
  ON body_measurements FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE body_measurements IS 'Histórico de medidas corporais das usuárias';
COMMENT ON COLUMN body_measurements.weight IS 'Peso em kg';
COMMENT ON COLUMN body_measurements.height IS 'Altura em cm';
COMMENT ON COLUMN body_measurements.body_fat_percentage IS 'Percentual de gordura corporal';
