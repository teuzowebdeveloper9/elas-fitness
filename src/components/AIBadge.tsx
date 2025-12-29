import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AIBadgeProps {
  variant?: 'default' | 'loading'
  text?: string
}

export function AIBadge({ variant = 'default', text }: AIBadgeProps) {
  if (variant === 'loading') {
    return (
      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none animate-pulse">
        <Sparkles className="w-3 h-3 mr-1 animate-spin" />
        {text || 'IA gerando...'}
      </Badge>
    )
  }

  return (
    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
      <Sparkles className="w-3 h-3 mr-1" />
      {text || 'Gerado por IA'}
    </Badge>
  )
}

export function AIIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 ${className}`}>
      <Sparkles className="w-3.5 h-3.5" />
      <span className="font-medium">Personalizado por IA</span>
    </div>
  )
}
