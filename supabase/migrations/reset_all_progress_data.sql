-- Script para ZERAR TODOS os dados de progresso
-- Mantém usuários e perfis, mas remove todo o histórico

-- ATENÇÃO: Este script deleta TODOS os dados de progresso de TODOS os usuários!
-- Execute apenas se quiser zerar tudo e começar do zero

-- Deletar todos os treinos completados
DELETE FROM completed_workouts;

-- Deletar todas as medidas corporais
DELETE FROM body_measurements;

-- Deletar toda a progressão de pesos
DELETE FROM exercise_weight_progression;

-- Verificar o que restou
SELECT 'completed_workouts' as tabela, COUNT(*) as registros FROM completed_workouts
UNION ALL
SELECT 'body_measurements' as tabela, COUNT(*) as registros FROM body_measurements
UNION ALL
SELECT 'exercise_weight_progression' as tabela, COUNT(*) as registros FROM exercise_weight_progression;

-- Resultado esperado: todas as tabelas devem ter 0 registros
-- Os perfis de usuário (user_profiles) permanecem intactos
