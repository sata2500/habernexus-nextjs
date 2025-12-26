import HeroSection from '@/components/home/HeroSection'
import CategorySection from '@/components/home/CategorySection'
import LatestNews from '@/components/home/LatestNews'
import PopularNews from '@/components/home/PopularNews'
import NewsletterSection from '@/components/home/NewsletterSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <LatestNews />
      <PopularNews />
      <NewsletterSection />
    </>
  )
}
