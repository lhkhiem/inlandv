import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NewsActivityArticle, newsActivityCategoryLabels } from '@/lib/newsActivitiesData'

export default function NewsActivityHero({ article }: { article: NewsActivityArticle }) {
  return (
    <Link
      href={`/tin-tuc-hoat-dong/${article.slug}`}
      className="group block relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
        style={{ backgroundImage: `url(${article.thumbnail})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-[#358b4e] text-white mb-4">
            {newsActivityCategoryLabels[article.category]}
          </span>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 group-hover:text-[#d4af37] transition-colors">
            {article.title}
          </h2>
          
          <p className="text-lg text-gray-200 mb-6 line-clamp-2">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              {new Date(article.date).toLocaleDateString('vi-VN')}
              {article.author && ` • ${article.author}`}
            </div>
            <div className="flex items-center text-[#d4af37] text-base font-medium group-hover:gap-2 transition-all">
              Đọc ngay
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
