import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { MenuList } from '@/components/menu-list'

export default function MenuPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Il Nostro Menù
          </h1>
          <MenuList />
        </div>
      </div>
      <Footer />
    </main>
  )
}

