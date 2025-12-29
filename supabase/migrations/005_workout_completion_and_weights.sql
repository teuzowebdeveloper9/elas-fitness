-- Tabela para registro de cargas/pesos por exercício
CREATE TABLE IF NOT EXISTS exercise_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight_kg DECIMAL(5,2), -- Peso em kg
  reps INTEGER, -- Repetições realizadas
  sets INTEGER, -- Séries realizadas
  notes TEXT, -- Observações (ex: "muito pesado", "fácil")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Índices para consultas rápidas
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_workout FOREIGN KEY (workout_id) REFERENCES workouts(id)
);

-- Índices para performance
CREATE INDEX idx_exercise_weights_user ON exercise_weights(user_id);
CREATE INDEX idx_exercise_weights_workout ON exercise_weights(workout_id);
CREATE INDEX idx_exercise_weights_exercise ON exercise_weights(exercise_name);
CREATE INDEX idx_exercise_weights_created ON exercise_weights(created_at DESC);

-- Tabela para finalização de treinos (com foto, feedback, tempo)
CREATE TABLE IF NOT EXISTS workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL, -- Tempo total do treino em minutos
  photo_url TEXT, -- URL da foto (se tirar)
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5), -- 1-5 estrelas
  feedback_text TEXT, -- Comentário sobre o treino
  published_to_feed BOOLEAN DEFAULT false, -- Se publicou no feed da comunidade
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_workout FOREIGN KEY (workout_id) REFERENCES workouts(id)
);

-- Índices
CREATE INDEX idx_workout_completions_user ON workout_completions(user_id);
CREATE INDEX idx_workout_completions_workout ON workout_completions(workout_id);
CREATE INDEX idx_workout_completions_completed ON workout_completions(completed_at DESC);
CREATE INDEX idx_workout_completions_feed ON workout_completions(published_to_feed, completed_at DESC);

-- Adicionar campos na tabela workouts para rastrear grupos musculares e rotação
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS muscle_groups TEXT[], -- Array de grupos musculares (ex: ['quadriceps', 'gluteos'])
ADD COLUMN IF NOT EXISTS week_day INTEGER, -- Dia da semana que o treino foi gerado (1=segunda, 7=domingo)
ADD COLUMN IF NOT EXISTS training_cycle INTEGER DEFAULT 1, -- Ciclo de treino (muda a cada mês de consistência)
ADD COLUMN IF NOT EXISTS is_progression BOOLEAN DEFAULT false; -- Se é um treino de progressão

-- Habilitar RLS
ALTER TABLE exercise_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_completions ENABLE ROW LEVEL SECURITY;

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

-- Políticas RLS para workout_completions
CREATE POLICY "Users can view their own completions"
  ON workout_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public feed completions"
  ON workout_completions FOR SELECT
  TO authenticated
  USING (published_to_feed = true);

CREATE POLICY "Users can insert their own completions"
  ON workout_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
  ON workout_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
  ON workout_completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- View para estatísticas de progresso do usuário
CREATE OR REPLACE VIEW user_progress_stats AS
SELECT
  user_id,
  COUNT(DISTINCT workout_id) as total_workouts,
  AVG(duration_minutes) as avg_duration,
  MAX(completed_at) as last_workout,
  COUNT(CASE WHEN completed_at >= NOW() - INTERVAL '7 days' THEN 1 END) as workouts_this_week,
  COUNT(CASE WHEN completed_at >= NOW() - INTERVAL '30 days' THEN 1 END) as workouts_this_month
FROM workout_completions
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
ORDER BY user_id, exercise_name, created_at DESC;
