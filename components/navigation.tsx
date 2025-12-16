'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Users, MapPin, Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { useCartStore } from '@/store/cart-store'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()
  const { isDark, toggleTheme } = useThemeStore()
  const { items } = useCartStore()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const navItems = [
    { href: '/menu', label: 'Menù', icon: Menu },
    { href: '/chi-siamo', label: 'Chi siamo', icon: Users },
    { href: '/maps', label: 'Maps', icon: MapPin },
  ]

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            La Favarotta
          </Link>
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {cartCount > 0 && (
              <Link
                href="/carrello"
                className="relative px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Carrello ({cartCount})
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[80px]',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[80px] text-gray-600 dark:text-gray-400"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
            <span className="text-xs font-medium">Tema</span>
          </button>
          {cartCount > 0 && (
            <Link
              href="/carrello"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[80px] text-blue-600 dark:text-blue-400 relative"
            >
              <div className="relative">
                <Menu size={24} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="text-xs font-medium">Carrello</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}



