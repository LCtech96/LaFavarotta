import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggleTheme: () => void
  initTheme: () => void
}

export const useThemeStore = create<ThemeStore>()((set, get) => {
  const initTheme = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme-storage')
      let isDark = false
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          isDark = parsed.state?.isDark || false
        } catch (e) {
          // Ignore parse errors
        }
      }
      document.documentElement.classList.toggle('dark', isDark)
      set({ isDark })
    }
  }

  return {
    isDark: false,
    initTheme,
    toggleTheme: () => {
      set((state) => {
        const newTheme = !state.isDark
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme)
          localStorage.setItem('theme-storage', JSON.stringify({ state: { isDark: newTheme } }))
        }
        return { isDark: newTheme }
      })
    },
  }
})
