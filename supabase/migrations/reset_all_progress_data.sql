-- Script para ZERAR TODOS os dados de progresso
-- Mantém usuários e perfis, mas remove todo o histórico

-- ATENÇÃO: Este script deleta TODOS os dados de progresso de TODOS os usuários!
-- Execute apenas se quiser zerar tudo e começar do zero

-- Deletar pesos de exercícios (tem FK para workout_sessions)
DELETE FROM exercise_weights;

-- Deletar sessões de treino
DELETE FROM workout_sessions;

-- Deletar treinos completados
DELETE FROM completed_workouts;

-- Deletar todas as medidas corporais
DELETE FROM body_measurements;

-- Deletar feedbacks diários
DELETE FROM daily_feedback;

-- Deletar tracking de refeições
DELETE FROM meals_tracking;

-- Deletar feedbacks de dieta
DELETE FROM diet_feedback;

-- Deletar dietas salvas
DELETE FROM saved_diets;

-- Verificar o que restou
SELECT 'exercise_weights' as tabela, COUNT(*) as registros FROM exercise_weights
UNION ALL
SELECT 'workout_sessions' as tabela, COUNT(*) as registros FROM workout_sessions
UNION ALL
SELECT 'completed_workouts' as tabela, COUNT(*) as registros FROM completed_workouts
UNION ALL
SELECT 'body_measurements' as tabela, COUNT(*) as registros FROM body_measurements
UNION ALL
SELECT 'daily_feedback' as tabela, COUNT(*) as registros FROM daily_feedback
UNION ALL
SELECT 'meals_tracking' as tabela, COUNT(*) as registros FROM meals_tracking;

-- Resultado esperado: todas as tabelas devem ter 0 registros
-- Os perfis de usuário (user_profiles) permanecem intactos
