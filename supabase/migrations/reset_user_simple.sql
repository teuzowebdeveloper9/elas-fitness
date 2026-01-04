-- Script simplificado para zerar dados de progresso
-- Execute este script para limpar todos os dados de treinos, medidas, etc.

-- OPÇÃO 1: Deletar TODOS os dados de progresso (mantém usuários e perfis)
-- Descomente as linhas abaixo se quiser zerar TODOS os usuários

-- DELETE FROM exercise_weights;
-- DELETE FROM workout_sessions;
-- DELETE FROM completed_workouts;
-- DELETE FROM body_measurements;
-- DELETE FROM daily_feedback;
-- DELETE FROM meals_tracking;

-- OPÇÃO 2: Deletar dados de um usuário específico
-- Substitua 'USER_ID_AQUI' pelo ID real do usuário

-- DELETE FROM exercise_weights WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM workout_sessions WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM completed_workouts WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM body_measurements WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM daily_feedback WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM meals_tracking WHERE user_id = 'USER_ID_AQUI';

-- OPÇÃO 3: Ver todos os usuários e seus IDs
SELECT
  up.id as user_id,
  up.name,
  up.email,
  (SELECT COUNT(*) FROM completed_workouts WHERE user_id = up.id) as treinos,
  (SELECT COUNT(*) FROM workout_sessions WHERE user_id = up.id) as sessoes,
  (SELECT COUNT(*) FROM body_measurements WHERE user_id = up.id) as medidas,
  (SELECT COUNT(*) FROM exercise_weights WHERE user_id = up.id) as pesos
FROM user_profiles up
ORDER BY up.name;

-- Para executar a limpeza de um usuário específico:
-- 1. Execute a query acima para ver os user_id
-- 2. Copie o user_id desejado
-- 3. Execute os comandos DELETE substituindo 'USER_ID_AQUI' pelo ID real
