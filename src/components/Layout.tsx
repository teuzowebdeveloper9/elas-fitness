import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Dumbbell, Apple, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/workouts', icon: Dumbbell, label: 'Treinos' },
    { path: '/diet', icon: Apple, label: 'Dieta' },
    { path: '/progress', icon: TrendingUp, label: 'Progresso' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ]

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Main Content - topo limpo, sem header global */}
      <main className="container mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation - Nova identidade visual */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/98 dark:bg-gray-800/98 backdrop-blur-lg border-t border-[var(--border)] shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                    isActive
                      ? "text-[var(--tiffany-dark)] bg-[var(--tiffany-light)] scale-105"
                      : "text-[var(--warm-gray)] hover:text-[var(--tiffany)] hover:bg-[var(--warm-gray-light)]"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
