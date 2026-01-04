-- Passo 1: Ver todos os usuários cadastrados
SELECT
  auth.users.id as user_id,
  auth.users.email,
  user_profiles.name,
  user_profiles.age,
  user_profiles.goals
FROM auth.users
LEFT JOIN user_profiles ON auth.users.id = user_profiles.id
ORDER BY user_profiles.name;

-- Passo 2: Contar registros por tabela para cada usuário
SELECT
  'Treinos Completos' as tipo,
  COUNT(*) as quantidade,
  user_id
FROM completed_workouts
GROUP BY user_id

UNION ALL

SELECT
  'Sessões de Treino' as tipo,
  COUNT(*) as quantidade,
  user_id
FROM workout_sessions
GROUP BY user_id

UNION ALL

SELECT
  'Medidas' as tipo,
  COUNT(*) as quantidade,
  user_id
FROM body_measurements
GROUP BY user_id

UNION ALL

SELECT
  'Pesos Exercícios' as tipo,
  COUNT(*) as quantidade,
  user_id
FROM exercise_weights
GROUP BY user_id;

-- Passo 3: DELETAR dados - DESCOMENTE as linhas abaixo após identificar o user_id correto
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real da usuária

-- DELETE FROM completed_workouts WHERE user_id = 'SEU_USER_ID_AQUI';
-- DELETE FROM workout_sessions WHERE user_id = 'SEU_USER_ID_AQUI';
-- DELETE FROM body_measurements WHERE user_id = 'SEU_USER_ID_AQUI';
-- DELETE FROM exercise_weights WHERE user_id = 'SEU_USER_ID_AQUI';
-- DELETE FROM daily_feedback WHERE user_id = 'SEU_USER_ID_AQUI';
-- DELETE FROM meals_tracking WHERE user_id = 'SEU_USER_ID_AQUI';

-- Passo 4: Verificar se foi zerado (execute após os DELETE acima)
-- SELECT COUNT(*) as treinos FROM completed_workouts WHERE user_id = 'SEU_USER_ID_AQUI';
-- SELECT COUNT(*) as sessoes FROM workout_sessions WHERE user_id = 'SEU_USER_ID_AQUI';
-- SELECT COUNT(*) as medidas FROM body_measurements WHERE user_id = 'SEU_USER_ID_AQUI';
-- SELECT COUNT(*) as pesos FROM exercise_weights WHERE user_id = 'SEU_USER_ID_AQUI';
