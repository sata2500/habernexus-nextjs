import Link from 'next/link'
import { ChevronRight, Newspaper, TrendingUp, Cpu, Trophy, Heart, Palette, FlaskConical, Globe } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Newspaper,
  TrendingUp,
  Cpu,
  Trophy,
  Heart,
  Palette,
  FlaskConical,
  Globe,
}

export default function CategorySection() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kategoriler</h2>
          <Link
            href="/kategoriler"
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Tümünü Gör
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map((category) => {
            const Icon = iconMap[category.icon] || Newspaper
            return (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="group flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
