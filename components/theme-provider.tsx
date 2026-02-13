'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/store/theme-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { initTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    initTheme()
  }, [initTheme])

  // Evita problemi di hydration non renderizzando nulla fino al mount
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

