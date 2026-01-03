-- Script simplificado para zerar dados de progresso
-- Execute este script para limpar todos os dados de treinos, medidas, etc.

-- OPÇÃO 1: Deletar TODOS os dados de progresso (mantém usuários e perfis)
-- Descomente as linhas abaixo se quiser zerar TODOS os usuários

-- DELETE FROM completed_workouts;
-- DELETE FROM exercise_weight_progression;
-- DELETE FROM body_measurements;

-- OPÇÃO 2: Deletar dados de um usuário específico
-- Substitua 'USER_ID_AQUI' pelo ID real do usuário

-- DELETE FROM completed_workouts WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM exercise_weight_progression WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM body_measurements WHERE user_id = 'USER_ID_AQUI';

-- OPÇÃO 3: Ver todos os usuários e seus IDs
SELECT
  up.user_id,
  up.name,
  up.email,
  (SELECT COUNT(*) FROM completed_workouts WHERE user_id = up.user_id) as treinos,
  (SELECT COUNT(*) FROM body_measurements WHERE user_id = up.user_id) as medidas
FROM user_profiles up
ORDER BY up.name;

-- Para executar a limpeza de um usuário específico:
-- 1. Execute a query acima para ver os user_id
-- 2. Copie o user_id da "giu linda"
-- 3. Execute os comandos DELETE substituindo 'USER_ID_AQUI' pelo ID real
