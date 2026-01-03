-- Adicionar coluna cardio_minutes à tabela completed_workouts
-- Esta coluna armazenará o tempo total de cardio realizado pela usuária

ALTER TABLE completed_workouts
ADD COLUMN IF NOT EXISTS cardio_minutes INTEGER;

COMMENT ON COLUMN completed_workouts.cardio_minutes IS 'Tempo total de cardio realizado em minutos';
