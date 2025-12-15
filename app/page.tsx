import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { HomeHero } from '@/components/home-hero'
import { Highlights } from '@/components/highlights'
import { RestaurantDescription } from '@/components/restaurant-description'
import { EditableText } from '@/components/editable-text'

export default function Home() {
  const handleSaveText = (key: string, value: string) => {
    // TODO: Salvare nel database
    console.log('Save text', key, value)
    localStorage.setItem(`content_${key}`, value)
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20">
        <HomeHero />
        <Highlights />
        <RestaurantDescription />
      </div>
      <Footer />
    </main>
  )
}

