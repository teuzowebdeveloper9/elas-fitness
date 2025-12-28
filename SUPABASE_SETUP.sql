-- ============================================
-- SUPABASE DATABASE SETUP - FitHer App
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/tpyvxchzpvoxvcnmyuhd/sql/new

-- ============================================
-- 1. TABELA DE PERFIS DE USUÁRIO
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  goal TEXT CHECK (goal IN ('lose-weight', 'gain-muscle', 'maintain', 'health')),
  life_phase TEXT CHECK (life_phase IN ('menstrual', 'pre-menopause', 'menopause', 'post-menopause')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies para user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. TABELA DE DADOS DO CICLO MENSTRUAL
-- ============================================
CREATE TABLE IF NOT EXISTS cycle_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_period_date DATE NOT NULL,
  cycle_length INTEGER DEFAULT 28,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE cycle_data ENABLE ROW LEVEL SECURITY;

-- Policies para cycle_data
CREATE POLICY "Users can view own cycle data"
  ON cycle_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle data"
  ON cycle_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle data"
  ON cycle_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle data"
  ON cycle_data FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. TABELA DE REGISTROS DIÁRIOS DO CICLO
-- ============================================
CREATE TABLE IF NOT EXISTS cycle_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  feeling TEXT NOT NULL,
  symptoms TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;

-- Policies para cycle_logs
CREATE POLICY "Users can view own cycle logs"
  ON cycle_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle logs"
  ON cycle_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle logs"
  ON cycle_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle logs"
  ON cycle_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. TABELA DE DADOS DA MENOPAUSA
-- ============================================
CREATE TABLE IF NOT EXISTS menopause_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phase TEXT CHECK (phase IN ('premenopausa', 'menopausa', 'posmenopausa')) NOT NULL,
  symptoms JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE menopause_data ENABLE ROW LEVEL SECURITY;

-- Policies para menopause_data
CREATE POLICY "Users can view own menopause data"
  ON menopause_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own menopause data"
  ON menopause_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own menopause data"
  ON menopause_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own menopause data"
  ON menopause_data FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. TABELA DE REGISTROS DIÁRIOS DA MENOPAUSA
-- ============================================
CREATE TABLE IF NOT EXISTS menopause_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  symptoms TEXT[] DEFAULT '{}',
  feeling TEXT NOT NULL,
  what_helps TEXT,
  what_makes_worse TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE menopause_logs ENABLE ROW LEVEL SECURITY;

-- Policies para menopause_logs
CREATE POLICY "Users can view own menopause logs"
  ON menopause_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own menopause logs"
  ON menopause_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own menopause logs"
  ON menopause_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own menopause logs"
  ON menopause_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cycle_data_updated_at
  BEFORE UPDATE ON cycle_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menopause_data_updated_at
  BEFORE UPDATE ON menopause_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. INDEXES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cycle_logs_user_date ON cycle_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_menopause_logs_user_date ON menopause_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- FIM DO SETUP
-- ============================================
-- Tabelas criadas com sucesso!
-- Agora você pode usar o app com autenticação e banco de dados.
