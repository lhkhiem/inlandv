'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Clock } from 'lucide-react'
import type { InsightArticle } from '@/lib/insightsData'

interface StandardInsightCardProps {
  article: InsightArticle
  layout?: 'horizontal' | 'vertical'
}

export default function StandardInsightCard({ article, layout = 'vertical' }: StandardInsightCardProps) {
  // Dynamic link based on category
  const baseUrl = article.category.includes('phan-tich') || 
                  article.category.includes('cam-nang') || 
                  article.category.includes('tin-tuc-fdi')
    ? '/goc-nhin-chuyen-gia'
    : '/tin-tuc-hoat-dong'

  if (layout === 'horizontal') {
    return (
      <Link 
        href={`${baseUrl}/${article.slug}`}
        className="group block"
      >
        <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#358b4e]/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex h-full">
          {/* Thumbnail */}
          <div className="relative w-2/5 flex-shrink-0">
            <div className="relative w-full h-full min-h-[140px]">
              <Image
                src={article.thumbnail}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            {/* Title */}
            <h4 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#358b4e] transition-colors">
              {article.title}
            </h4>

            {/* Excerpt */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
              {article.excerpt}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
              </div>
              {article.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link 
      href={`${baseUrl}/${article.slug}`}
      className="group block h-full"
    >
      <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#358b4e]/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
            </div>
            {article.readTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#358b4e] transition-colors">
            {article.title}
          </h4>

          {/* Excerpt */}
          <p className="text-sm text-gray-600 line-clamp-2 flex-1">
            {article.excerpt}
          </p>
        </div>
      </div>
    </Link>
  )
}
