import { create } from 'zustand'

export interface CartItem {
  id: string
  menuItemId: number
  name: string
  price: number
  quantity: number
  addedIngredients: string[]
  removedIngredients: string[]
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>()((set, get) => {
  // Load from localStorage on initialization
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('cart-storage')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.state?.items) {
          set({ items: parsed.state.items })
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  return {
    items: [],
    addItem: (item) => {
      const newItem: CartItem = {
        ...item,
        id: `${item.menuItemId}-${Date.now()}`,
      }
      set((state) => {
        const newItems = [...state.items, newItem]
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart-storage', JSON.stringify({ state: { items: newItems } }))
        }
        return { items: newItems }
      })
    },
    removeItem: (id) => {
      set((state) => {
        const newItems = state.items.filter((item) => item.id !== id)
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart-storage', JSON.stringify({ state: { items: newItems } }))
        }
        return { items: newItems }
      })
    },
    updateQuantity: (id, quantity) => {
      if (quantity <= 0) {
        get().removeItem(id)
        return
      }
      set((state) => {
        const newItems = state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart-storage', JSON.stringify({ state: { items: newItems } }))
        }
        return { items: newItems }
      })
    },
    clearCart: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart-storage', JSON.stringify({ state: { items: [] } }))
      }
      set({ items: [] })
    },
    getTotal: () => {
      return get().items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
    },
  }
})

