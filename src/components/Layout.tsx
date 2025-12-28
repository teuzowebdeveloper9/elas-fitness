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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Elas Fit
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              Fitness adaptado para você
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-pink-100 dark:border-gray-700 shadow-lg">
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
                    "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all",
                    isActive
                      ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-300"
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
