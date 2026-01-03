-- Script para zerar os dados da usuária "giu linda"
-- Mantém o cadastro e onboarding, mas remove dados de progresso

-- Encontrar o user_id da "giu linda"
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Buscar o user_id através do user_profiles
  SELECT user_id INTO target_user_id
  FROM user_profiles
  WHERE LOWER(name) LIKE '%giu%linda%'
  LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    -- Deletar treinos completados
    DELETE FROM completed_workouts WHERE user_id = target_user_id;

    -- Deletar progressão de pesos
    DELETE FROM exercise_weight_progression WHERE user_id = target_user_id;

    -- Deletar medidas corporais
    DELETE FROM body_measurements WHERE user_id = target_user_id;

    -- Deletar registros de água (se existir a tabela)
    -- DELETE FROM water_intake WHERE user_id = target_user_id;

    -- Deletar registros de comida/dieta (se existir a tabela)
    -- DELETE FROM food_logs WHERE user_id = target_user_id;

    -- Deletar registros de ciclo menstrual (se existir a tabela)
    -- DELETE FROM cycle_logs WHERE user_id = target_user_id;

    RAISE NOTICE 'Dados da usuária zerados com sucesso! user_id: %', target_user_id;
  ELSE
    RAISE NOTICE 'Usuária "giu linda" não encontrada';
  END IF;
END $$;

-- Verificar o que restou
SELECT
  'user_profiles' as tabela,
  COUNT(*) as registros
FROM user_profiles
WHERE LOWER(name) LIKE '%giu%linda%'

UNION ALL

SELECT
  'completed_workouts' as tabela,
  COUNT(*) as registros
FROM completed_workouts
WHERE user_id IN (SELECT user_id FROM user_profiles WHERE LOWER(name) LIKE '%giu%linda%')

UNION ALL

SELECT
  'body_measurements' as tabela,
  COUNT(*) as registros
FROM body_measurements
WHERE user_id IN (SELECT user_id FROM user_profiles WHERE LOWER(name) LIKE '%giu%linda%');
