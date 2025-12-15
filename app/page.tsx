import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { HomeHero } from '@/components/home-hero'
import { Highlights } from '@/components/highlights'
import { RestaurantDescription } from '@/components/restaurant-description'
import { PostsFeed } from '@/components/posts-feed'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20">
        <HomeHero />
        <Highlights />
        <RestaurantDescription />
        <PostsFeed />
      </div>
      <Footer />
    </main>
  )
}

