import { LifePhase, FitnessLevel } from '@/contexts/UserContext'

export interface WorkoutAdaptation {
  recommendations: string[]
  warnings: string[]
  intensityModifier: number // 0.7 = 70% intensity, 1.0 = 100%, 1.2 = 120%
}

export function getWorkoutAdaptation(
  lifePhase: LifePhase,
  fitnessLevel: FitnessLevel
): WorkoutAdaptation {
  const baseIntensity = {
    beginner: 0.7,
    intermediate: 1.0,
    advanced: 1.2,
  }[fitnessLevel]

  switch (lifePhase) {
    case 'menstrual':
      return {
        recommendations: [
          'Durante a menstruação: prefira exercícios leves como caminhada e alongamento',
          'Fase folicular (pós-menstruação): energia alta, ótimo para treinos intensos',
          'Ovulação: pico de energia, aproveite para desafios maiores',
          'Fase lútea (pré-menstruação): reduza intensidade, foque em treinos moderados',
        ],
        warnings: [
          'Respeite os sinais do seu corpo durante o período menstrual',
          'Hidrate-se bem durante todo o ciclo',
        ],
        intensityModifier: baseIntensity,
      }

    case 'pre-menopause':
      return {
        recommendations: [
          'Priorize treinos de força para manter massa muscular',
          'Inclua exercícios de impacto moderado para saúde óssea',
          'Pratique yoga ou pilates para reduzir estresse',
          'Exercícios cardiovasculares ajudam a controlar o peso',
          'Treine de manhã quando a energia está mais alta',
        ],
        warnings: [
          'Aqueça bem antes dos treinos',
          'Evite overtraining - o corpo precisa de mais recuperação',
          'Atenção a sintomas como ondas de calor durante exercícios',
        ],
        intensityModifier: baseIntensity * 0.9,
      }

    case 'menopause':
      return {
        recommendations: [
          'Musculação é essencial para prevenir perda muscular',
          'Exercícios de carga para fortalecer os ossos',
          'Treinamento de equilíbrio para prevenir quedas',
          'Natação e hidroginástica são excelentes opções',
          'Exercícios de mobilidade e flexibilidade',
        ],
        warnings: [
          'Evite exercícios de alto impacto se houver problemas articulares',
          'Hidrate-se constantemente',
          'Faça pausas mais frequentes entre séries',
          'Consulte médico sobre suplementação de cálcio e vitamina D',
        ],
        intensityModifier: baseIntensity * 0.85,
      }

    case 'post-menopause':
      return {
        recommendations: [
          'Mantenha rotina consistente de exercícios de força',
          'Exercícios funcionais para independência nas atividades diárias',
          'Caminhadas regulares para saúde cardiovascular',
          'Treinamento de equilíbrio e coordenação',
          'Alongamentos diários para manter flexibilidade',
        ],
        warnings: [
          'Evite exercícios que causem desconforto articular',
          'Aumente carga progressivamente e com cautela',
          'Mantenha acompanhamento médico regular',
        ],
        intensityModifier: baseIntensity * 0.8,
      }

    default:
      return {
        recommendations: [],
        warnings: [],
        intensityModifier: baseIntensity,
      }
  }
}

export function getLifePhaseLabel(lifePhase: LifePhase): string {
  const labels = {
    menstrual: 'Período Menstrual',
    'pre-menopause': 'Pré-Menopausa',
    menopause: 'Menopausa',
    'post-menopause': 'Pós-Menopausa',
    'irregular-cycle': 'Ciclo Irregular',
  }
  return labels[lifePhase]
}

export function getLifePhaseColor(lifePhase: LifePhase): string {
  const colors = {
    menstrual: 'from-pink-500 to-rose-500',
    'pre-menopause': 'from-purple-500 to-pink-500',
    menopause: 'from-orange-500 to-red-500',
    'post-menopause': 'from-blue-500 to-indigo-500',
    'irregular-cycle': 'from-purple-500 to-violet-500',
  }
  return colors[lifePhase]
}

// Adjust workout based on menstrual cycle phase (for menstrual life phase only)
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export function getCurrentCyclePhase(lastPeriodDate: Date): CyclePhase {
  const daysSinceLastPeriod = Math.floor(
    (new Date().getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceLastPeriod <= 5) return 'menstrual'
  if (daysSinceLastPeriod <= 13) return 'follicular'
  if (daysSinceLastPeriod <= 16) return 'ovulation'
  return 'luteal'
}

export function getCyclePhaseRecommendation(phase: CyclePhase): string {
  const recommendations = {
    menstrual:
      'Fase Menstrual: Energia mais baixa. Prefira treinos leves, alongamentos e caminhadas.',
    follicular:
      'Fase Folicular: Energia em alta! Ótimo momento para treinos intensos e desafiadores.',
    ovulation:
      'Ovulação: Pico de energia e força. Aproveite para bater seus recordes!',
    luteal:
      'Fase Lútea: Energia moderada. Mantenha treinos regulares mas reduza a intensidade se sentir necessidade.',
  }
  return recommendations[phase]
}
