import HeroSection from '@/components/home/HeroSection'
import CategorySection from '@/components/home/CategorySection'
import PersonalizedNews from '@/components/home/PersonalizedNews'
import LatestNews from '@/components/home/LatestNews'
import PopularNews from '@/components/home/PopularNews'
import NewsletterSection from '@/components/home/NewsletterSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <PersonalizedNews />
      <LatestNews />
      <PopularNews />
      <NewsletterSection />
    </>
  )
}
