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

// SVG da raposa com diferentes estágios de evolução - versão premium melhorada
function FoxSVG({ stage }: { stage: FoxStage }) {
  // Cores da paleta
  const tiffany = 'rgb(129, 216, 208)'
  const coral = 'rgb(255, 159, 148)'
  const coralDark = 'rgb(255, 139, 128)'
  const lilac = 'rgb(186, 155, 201)'
  const white = '#FFFFFF'

  // Configurações visuais por estágio - evolução sutil e positiva
  const config = {
    starting: {
      bodyScale: 1.1, // Um pouco mais rechonchuda
      posture: 'relaxed',
      confidence: 0.5,
      expression: 'gentle',
      outfit: 'basic'
    },
    progressing: {
      bodyScale: 1.0,
      posture: 'relaxed',
      confidence: 0.65,
      expression: 'happy',
      outfit: 'basic'
    },
    active: {
      bodyScale: 0.92,
      posture: 'upright',
      confidence: 0.8,
      expression: 'confident',
      outfit: 'fitness'
    },
    strong: {
      bodyScale: 0.88,
      posture: 'upright',
      confidence: 0.9,
      expression: 'proud',
      outfit: 'fitness'
    },
    champion: {
      bodyScale: 0.85,
      posture: 'dynamic',
      confidence: 1.0,
      expression: 'radiant',
      outfit: 'champion'
    }
  }

  const current = config[stage]

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-2xl"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
    >
      <defs>
        {/* Gradientes para profundidade */}
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={coral} stopOpacity="1" />
          <stop offset="100%" stopColor={coralDark} stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="outfitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={tiffany} stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(94, 185, 176)" stopOpacity="1" />
        </linearGradient>

        <radialGradient id="cheekBlush">
          <stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFB6C1" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cauda fofa - atrás do corpo */}
      <g opacity="0.95">
        <ellipse
          cx={current.posture === 'dynamic' ? "22" : "26"}
          cy="72"
          rx="14"
          ry="20"
          fill="url(#bodyGradient)"
          transform={current.posture === 'dynamic' ? "rotate(-30 22 72)" : "rotate(-20 26 72)"}
        />
        {/* Ponta branca da cauda */}
        <ellipse
          cx={current.posture === 'dynamic' ? "20" : "24"}
          cy="75"
          rx="7"
          ry="11"
          fill={white}
          opacity="0.9"
          transform={current.posture === 'dynamic' ? "rotate(-30 20 75)" : "rotate(-20 24 75)"}
        />
      </g>

      {/* Corpo principal */}
      <ellipse
        cx="60"
        cy="70"
        rx={28 * current.bodyScale}
        ry={24 * current.bodyScale}
        fill="url(#bodyGradient)"
      />

      {/* Patas (pernas) - antes do outfit */}
      <g>
        {/* Perna esquerda */}
        <rect
          x="48"
          y="88"
          width="8"
          height="20"
          rx="4"
          fill={coral}
        />
        {/* Perna direita */}
        <rect
          x="64"
          y="88"
          width="8"
          height="20"
          rx="4"
          fill={coral}
        />
      </g>

      {/* Outfit fitness - Top esportivo */}
      {(current.outfit === 'fitness' || current.outfit === 'champion') && (
        <g>
          {/* Top esportivo com detalhes */}
          <path
            d="M 44 62 Q 44 58 48 56 L 60 54 L 72 56 Q 76 58 76 62 L 76 72 Q 76 75 73 75 L 47 75 Q 44 75 44 72 Z"
            fill="url(#outfitGradient)"
          />
          {/* Detalhe central do top */}
          <line x1="60" y1="56" x2="60" y2="75" stroke={white} strokeWidth="1.5" opacity="0.3" />
          {/* Alças do top */}
          <path d="M 48 56 Q 46 52 46 48" stroke={tiffany} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 72 56 Q 74 52 74 48" stroke={tiffany} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* Legging com detalhes */}
      {(current.outfit === 'fitness' || current.outfit === 'champion') && (
        <g>
          {/* Legging esquerda */}
          <rect x="46" y="88" width="10" height="22" rx="4" fill={lilac} />
          <line x1="51" y1="90" x2="51" y2="108" stroke={white} strokeWidth="0.5" opacity="0.2" />

          {/* Legging direita */}
          <rect x="62" y="88" width="10" height="22" rx="4" fill={lilac} />
          <line x1="67" y1="90" x2="67" y2="108" stroke={white} strokeWidth="0.5" opacity="0.2" />
        </g>
      )}

      {/* Tênis modernos */}
      {(current.outfit === 'fitness' || current.outfit === 'champion') && (
        <g>
          {/* Tênis esquerdo */}
          <ellipse cx="51" cy="110" rx="6" ry="4" fill={white} />
          <path d="M 48 110 L 54 110" stroke={tiffany} strokeWidth="2" strokeLinecap="round" />
          <circle cx="51" cy="108" r="1" fill={tiffany} />

          {/* Tênis direito */}
          <ellipse cx="67" cy="110" rx="6" ry="4" fill={white} />
          <path d="M 64 110 L 70 110" stroke={tiffany} strokeWidth="2" strokeLinecap="round" />
          <circle cx="67" cy="108" r="1" fill={tiffany} />
        </g>
      )}

      {/* Pescoço */}
      <ellipse cx="60" cy="52" rx="10" ry="8" fill={coral} />

      {/* Cabeça - formato mais detalhado */}
      <ellipse cx="60" cy="38" rx="20" ry="22" fill="url(#bodyGradient)" />

      {/* Orelhas - pontudas e fofas */}
      <g>
        {/* Orelha esquerda */}
        <path
          d="M 45 28 Q 42 22 40 16 Q 41 20 45 24 Z"
          fill={coral}
        />
        <path
          d="M 45 28 Q 43 24 42 20 Q 43 23 45 25 Z"
          fill="#FFE4E1"
          opacity="0.6"
        />

        {/* Orelha direita */}
        <path
          d="M 75 28 Q 78 22 80 16 Q 79 20 75 24 Z"
          fill={coral}
        />
        <path
          d="M 75 28 Q 77 24 78 20 Q 77 23 75 25 Z"
          fill="#FFE4E1"
          opacity="0.6"
        />
      </g>

      {/* Focinho (parte clara) - mais definido */}
      <g>
        <ellipse cx="60" cy="44" rx="11" ry="9" fill={white} opacity="0.95" />
        <ellipse cx="60" cy="42" rx="9" ry="7" fill="#FFF5F5" />
      </g>

      {/* Narizinho fofo */}
      <ellipse
        cx="60"
        cy="43"
        rx="2.5"
        ry="2"
        fill={current.outfit === 'champion' ? tiffany : '#333'}
      />
      <path d="M 60 43 Q 60 45 58 46 M 60 43 Q 60 45 62 46" stroke="#333" strokeWidth="0.5" opacity="0.6" />

      {/* Bochechas rosadas */}
      <ellipse cx="48" cy="42" rx="4" ry="3" fill="url(#cheekBlush)" />
      <ellipse cx="72" cy="42" rx="4" ry="3" fill="url(#cheekBlush)" />

      {/* Olhos - expressivos e carismáticos */}
      <g>
        {current.confidence > 0.7 ? (
          // Olhos confiantes e felizes
          <>
            {/* Olho esquerdo */}
            <ellipse cx="52" cy="35" rx="3.5" ry="4.5" fill="#2C1810" />
            <ellipse cx="52.5" cy="34" rx="1.2" ry="1.5" fill={white} />
            <circle cx="53" cy="35.5" r="0.5" fill={white} opacity="0.8" />
            {/* Cílios/sobrancelha */}
            <path d="M 48 32 Q 50 31 52 31" stroke="#2C1810" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

            {/* Olho direito */}
            <ellipse cx="68" cy="35" rx="3.5" ry="4.5" fill="#2C1810" />
            <ellipse cx="68.5" cy="34" rx="1.2" ry="1.5" fill={white} />
            <circle cx="69" cy="35.5" r="0.5" fill={white} opacity="0.8" />
            {/* Cílios/sobrancelha */}
            <path d="M 72 32 Q 70 31 68 31" stroke="#2C1810" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
          </>
        ) : (
          // Olhos gentis e amigáveis
          <>
            {/* Olho esquerdo */}
            <circle cx="52" cy="35" r="3" fill="#2C1810" />
            <circle cx="52.5" cy="34.2" r="1" fill={white} />
            <circle cx="53" cy="35.5" r="0.4" fill={white} opacity="0.7" />

            {/* Olho direito */}
            <circle cx="68" cy="35" r="3" fill="#2C1810" />
            <circle cx="68.5" cy="34.2" r="1" fill={white} />
            <circle cx="69" cy="35.5" r="0.4" fill={white} opacity="0.7" />
          </>
        )}
      </g>

      {/* Sorriso sutil */}
      {current.confidence > 0.6 && (
        <path
          d="M 56 46 Q 60 48 64 46"
          stroke="#333"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      )}

      {/* Coroa de campeã (champion only) */}
      {current.outfit === 'champion' && (
        <g>
          <path
            d="M 48 20 L 51 14 L 54 20 L 60 12 L 66 20 L 69 14 L 72 20 L 70 26 L 50 26 Z"
            fill="#FFD700"
            stroke="#FFA500"
            strokeWidth="1.5"
          />
          {/* Joias na coroa */}
          <circle cx="51" cy="17" r="2" fill="#FF69B4" />
          <circle cx="60" cy="14" r="2.5" fill={tiffany} />
          <circle cx="69" cy="17" r="2" fill="#FF69B4" />
          {/* Brilhos */}
          <circle cx="54" cy="23" r="1" fill={white} opacity="0.8" />
          <circle cx="66" cy="23" r="1" fill={white} opacity="0.8" />
        </g>
      )}

      {/* Brilhos nos olhos (expressão de vida) */}
      {current.confidence > 0.8 && (
        <g opacity="0.6">
          <circle cx="50" cy="33" r="0.8" fill={white} />
          <circle cx="70" cy="33" r="0.8" fill={white} />
        </g>
      )}

      {/* Bracinho esquerdo (acenando se champion) */}
      {current.outfit === 'champion' ? (
        <ellipse cx="38" cy="60" rx="5" ry="12" fill={coral} transform="rotate(-30 38 60)" />
      ) : (
        <ellipse cx="40" cy="65" rx="5" ry="10" fill={coral} />
      )}

      {/* Bracinho direito */}
      <ellipse cx="80" cy="65" rx="5" ry="10" fill={coral} />
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
