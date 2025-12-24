'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Clock } from 'lucide-react'
import type { InsightArticle } from '@/lib/insightsData'

interface FeaturedInsightCardProps {
  article: InsightArticle
}

export default function FeaturedInsightCard({ article }: FeaturedInsightCardProps) {
  // Dynamic link based on category
  const baseUrl = article.category.includes('phan-tich') || 
                  article.category.includes('cam-nang') || 
                  article.category.includes('tin-tuc-fdi')
    ? '/goc-nhin-chuyen-gia'
    : '/tin-tuc-hoat-dong'

  return (
    <Link 
      href={`${baseUrl}/${article.slug}`}
      className="group block h-full"
    >
      <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#358b4e]/50 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-goldDark text-black px-3 py-1 text-xs font-bold uppercase">
              Featured
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{article.author}</span>
            </div>
            {article.readTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#358b4e] transition-colors">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 line-clamp-3 mb-4 flex-1">
            {article.excerpt}
          </p>

          {/* Read more */}
          <div className="text-[#358b4e] font-semibold text-sm group-hover:gap-2 flex items-center gap-1 transition-all">
            <span>Đọc tiếp</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
