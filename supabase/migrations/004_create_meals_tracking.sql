-- Tabela para armazenar refeições escaneadas
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
  image_url TEXT,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fats NUMERIC NOT NULL DEFAULT 0,
  fiber NUMERIC DEFAULT 0,
  sodium NUMERIC DEFAULT 0,
  sugar NUMERIC DEFAULT 0,
  foods_detected TEXT[], -- Array de alimentos detectados
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index para buscar refeições por usuário e data
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date DESC);

-- RLS (Row Level Security)
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas suas próprias refeições
CREATE POLICY "Users can view their own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários podem inserir suas próprias refeições
CREATE POLICY "Users can insert their own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar suas próprias refeições
CREATE POLICY "Users can update their own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: usuários podem deletar suas próprias refeições
CREATE POLICY "Users can delete their own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela para armazenar o resumo diário de nutrição
CREATE TABLE IF NOT EXISTS daily_nutrition (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_calories NUMERIC NOT NULL DEFAULT 0,
  total_protein NUMERIC NOT NULL DEFAULT 0,
  total_carbs NUMERIC NOT NULL DEFAULT 0,
  total_fats NUMERIC NOT NULL DEFAULT 0,
  total_fiber NUMERIC DEFAULT 0,
  total_sodium NUMERIC DEFAULT 0,
  total_sugar NUMERIC DEFAULT 0,
  meals_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, date)
);

-- Index para buscar resumo diário
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_date ON daily_nutrition(user_id, date DESC);

-- RLS
ALTER TABLE daily_nutrition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily nutrition"
  ON daily_nutrition FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily nutrition"
  ON daily_nutrition FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily nutrition"
  ON daily_nutrition FOR UPDATE
  USING (auth.uid() = user_id);
