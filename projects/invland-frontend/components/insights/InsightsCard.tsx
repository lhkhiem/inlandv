import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { InsightArticle, insightCategoryLabels } from '@/lib/insightsData'

export default function InsightsCard({ article }: { article: InsightArticle }) {
  return (
    <Link
      href={`/goc-nhin-chuyen-gia/${article.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 relative h-full flex flex-col"
    >
      <div className="relative h-56 overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundImage: `url(${article.thumbnail})` }}
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#358b4e] text-white">
            {insightCategoryLabels[article.category]}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#358b4e] transition-colors min-h-[3.5rem]">
          {article.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="text-xs text-gray-500">
            {new Date(article.date).toLocaleDateString('vi-VN')}
          </div>
          <div className="flex items-center text-[#358b4e] text-sm font-medium group-hover:gap-2 transition-all">
            Xem chi tiết
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}
