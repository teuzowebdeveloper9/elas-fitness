import { useEffect, useState } from 'react'

// Sistema de evolução da mascote baseado no progresso da usuária
export type FoxStage = 'starting' | 'progressing' | 'active' | 'strong' | 'champion'

export interface FoxMascotProps {
  stage?: FoxStage
  size?: 'small' | 'medium' | 'large'
  className?: string
  showMessage?: boolean
  message?: string
}

const FOX_MESSAGES = {
  starting: [
    'Vamos juntas nessa jornada! 💚',
    'Hoje é sobre dar o primeiro passo',
    'Você está no caminho certo'
  ],
  progressing: [
    'Olha só como você está evoluindo! ✨',
    'Cada dia conta, e você está arrasando',
    'Continue assim, estou aqui com você'
  ],
  active: [
    'Que constância incrível! 🌟',
    'Você está criando hábitos de verdade',
    'Esse ritmo é tudo!'
  ],
  strong: [
    'Você está imparável! 🔥',
    'Olha a transformação que você já conquistou',
    'Força e disciplina definem você agora'
  ],
  champion: [
    'Campeã absoluta! 👑',
    'Você inspirou até a mim!',
    'Esse é o resultado da sua dedicação'
  ]
}

export function FoxMascot({
  stage = 'starting',
  size = 'medium',
  className = '',
  showMessage = false,
  message
}: FoxMascotProps) {
  const [currentMessage, setCurrentMessage] = useState('')

  useEffect(() => {
    if (showMessage && !message) {
      const messages = FOX_MESSAGES[stage]
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setCurrentMessage(randomMessage)
    } else if (message) {
      setCurrentMessage(message)
    }
  }, [stage, showMessage, message])

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <FoxSVG stage={stage} />
      </div>

      {showMessage && currentMessage && (
        <div className="relative max-w-xs">
          <div className="bg-white rounded-2xl px-4 py-3 shadow-lg border border-[rgb(231,228,225)]">
            <p className="text-sm text-center text-[rgb(51,51,51)] font-heading-medium">
              {currentMessage}
            </p>
          </div>
          {/* Speech bubble tail */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-[rgb(231,228,225)] rotate-45" />
        </div>
      )}
    </div>
  )
}

// SVG da raposa com diferentes estágios de evolução
function FoxSVG({ stage }: { stage: FoxStage }) {
  // Cores da paleta
  const tiffany = 'rgb(129, 216, 208)'
  const coral = 'rgb(255, 159, 148)'
  const lilac = 'rgb(186, 155, 201)'

  // Configurações visuais por estágio
  const config = {
    starting: {
      bodyWidth: 70,
      confident: false,
      colorIntensity: 0.6,
      outfit: 'casual'
    },
    progressing: {
      bodyWidth: 65,
      confident: false,
      colorIntensity: 0.7,
      outfit: 'casual'
    },
    active: {
      bodyWidth: 58,
      confident: true,
      colorIntensity: 0.85,
      outfit: 'fitness'
    },
    strong: {
      bodyWidth: 52,
      confident: true,
      colorIntensity: 0.95,
      outfit: 'fitness'
    },
    champion: {
      bodyWidth: 48,
      confident: true,
      colorIntensity: 1,
      outfit: 'champion'
    }
  }

  const current = config[stage]

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-lg"
    >
      {/* Corpo principal da raposa */}
      <ellipse
        cx="50"
        cy="65"
        rx={current.bodyWidth / 2}
        ry="22"
        fill={coral}
        opacity={current.colorIntensity}
      />

      {/* Cabeça */}
      <circle cx="50" cy="35" r="18" fill={coral} opacity={current.colorIntensity} />

      {/* Orelhas */}
      <path
        d="M40 25 L35 15 L42 22 Z"
        fill={coral}
        opacity={current.colorIntensity}
      />
      <path
        d="M60 25 L65 15 L58 22 Z"
        fill={coral}
        opacity={current.colorIntensity}
      />

      {/* Focinho (parte clara) */}
      <ellipse cx="50" cy="38" rx="8" ry="6" fill="white" />

      {/* Nariz */}
      <circle cx="50" cy="37" r="2" fill={stage === 'champion' ? tiffany : '#333'} />

      {/* Olhos - mais confiantes nos estágios avançados */}
      {current.confident ? (
        <>
          <ellipse cx="45" cy="32" rx="2.5" ry="3" fill="#333" />
          <ellipse cx="55" cy="32" rx="2.5" ry="3" fill="#333" />
          <circle cx="45.5" cy="31.5" r="0.8" fill="white" />
          <circle cx="55.5" cy="31.5" r="0.8" fill="white" />
        </>
      ) : (
        <>
          <circle cx="45" cy="32" r="2" fill="#333" />
          <circle cx="55" cy="32" r="2" fill="#333" />
          <circle cx="45.5" cy="31.5" r="0.6" fill="white" />
          <circle cx="55.5" cy="31.5" r="0.6" fill="white" />
        </>
      )}

      {/* Outfit - Top esportivo */}
      {(current.outfit === 'fitness' || current.outfit === 'champion') && (
        <>
          <path
            d="M40 55 L35 60 L40 65 L50 63 L60 65 L65 60 L60 55 Z"
            fill={tiffany}
            opacity={0.9}
          />
          <line x1="50" y1="55" x2="50" y2="65" stroke="white" strokeWidth="1" opacity={0.3} />
        </>
      )}

      {/* Legging */}
      {(current.outfit === 'fitness' || current.outfit === 'champion') && (
        <>
          <rect x="40" y="75" width="8" height="18" rx="3" fill={lilac} opacity={0.85} />
          <rect x="52" y="75" width="8" height="18" rx="3" fill={lilac} opacity={0.85} />
        </>
      )}

      {/* Tênis */}
      {(current.outfit === 'fitness' || current.outfit === 'champion') && (
        <>
          <ellipse cx="44" cy="92" rx="5" ry="3" fill="white" />
          <ellipse cx="56" cy="92" rx="5" ry="3" fill="white" />
          <path d="M42 92 L46 92" stroke={tiffany} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M54 92 L58 92" stroke={tiffany} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}

      {/* Coroa (champion only) */}
      {current.outfit === 'champion' && (
        <>
          <path
            d="M42 20 L45 15 L48 20 L50 14 L52 20 L55 15 L58 20 L56 25 L44 25 Z"
            fill="#FFD700"
            stroke="#FFA500"
            strokeWidth="1"
          />
          <circle cx="45" cy="17" r="1.5" fill="#FF6B6B" />
          <circle cx="50" cy="15" r="1.5" fill="#4ECDC4" />
          <circle cx="55" cy="17" r="1.5" fill="#FF6B6B" />
        </>
      )}

      {/* Cauda fofa */}
      <ellipse
        cx={current.confident ? "25" : "28"}
        cy="70"
        rx="12"
        ry="18"
        fill={coral}
        opacity={current.colorIntensity * 0.8}
        transform={current.confident ? "rotate(-25 25 70)" : "rotate(-15 28 70)"}
      />
      <ellipse
        cx={current.confident ? "24" : "27"}
        cy="72"
        rx="6"
        ry="10"
        fill="white"
        opacity={0.8}
        transform={current.confident ? "rotate(-25 24 72)" : "rotate(-15 27 72)"}
      />
    </svg>
  )
}

// Hook para calcular o estágio da mascote baseado no progresso
export function useFoxStage(completedWorkouts: number, daysConsistent: number): FoxStage {
  if (completedWorkouts >= 50 && daysConsistent >= 60) return 'champion'
  if (completedWorkouts >= 30 && daysConsistent >= 40) return 'strong'
  if (completedWorkouts >= 15 && daysConsistent >= 20) return 'active'
  if (completedWorkouts >= 5 && daysConsistent >= 7) return 'progressing'
  return 'starting'
}
