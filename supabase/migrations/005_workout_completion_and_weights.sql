-- Tabela para registro de cargas/pesos por exercício
CREATE TABLE IF NOT EXISTS exercise_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight_kg DECIMAL(5,2), -- Peso em kg
  reps INTEGER, -- Repetições realizadas
  sets INTEGER, -- Séries realizadas
  notes TEXT, -- Observações (ex: "muito pesado", "fácil")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_exercise_weights_user ON exercise_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_weights_session ON exercise_weights(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_weights_exercise ON exercise_weights(exercise_name);
CREATE INDEX IF NOT EXISTS idx_exercise_weights_created ON exercise_weights(created_at DESC);

-- Adicionar campos na tabela workout_sessions para feedback e foto
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
ADD COLUMN IF NOT EXISTS feedback_text TEXT,
ADD COLUMN IF NOT EXISTS published_to_feed BOOLEAN DEFAULT false;

-- Habilitar RLS
ALTER TABLE exercise_weights ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para exercise_weights
CREATE POLICY "Users can view their own weights"
  ON exercise_weights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weights"
  ON exercise_weights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weights"
  ON exercise_weights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weights"
  ON exercise_weights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- View para estatísticas de progresso do usuário
CREATE OR REPLACE VIEW user_progress_stats AS
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

-- View para evolução de peso por exercício
CREATE OR REPLACE VIEW exercise_weight_progression AS
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
