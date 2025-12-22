'use client'

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import FeaturedInsightCard from '../insights/FeaturedInsightCard'
import StandardInsightCard from '../insights/StandardInsightCard'
import type { NewsActivityArticle, NewsActivityCategory } from '@/lib/newsActivitiesData'
import { newsActivityCategoryLabels } from '@/lib/newsActivitiesData'

interface NewsActivitySectionProps {
  category: NewsActivityCategory
  articles: NewsActivityArticle[]
  anchorId: string
}

export default function NewsActivitySection({ category, articles, anchorId }: NewsActivitySectionProps) {
  const featuredArticle = articles.find(a => a.featured)
  const secondaryArticles = articles.filter(a => !a.featured).slice(0, 2)
  const gridArticles = articles.filter(a => !a.featured).slice(2)
  
  const swiperRef = useRef<SwiperType | null>(null)

  return (
    <section id={anchorId} className="py-16 md:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {newsActivityCategoryLabels[category]}
          </h2>
          <Link 
            href={`/tin-tuc-hoat-dong/danh-muc?category=${category}`}
            className="flex items-center gap-2 text-[#358b4e] font-semibold hover:gap-3 transition-all group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Featured Article */}
          {featuredArticle && (
            <div className="lg:col-span-1">
              <FeaturedInsightCard article={{
                ...featuredArticle,
                author: featuredArticle.author || 'Inland Real Estate',
                category: category as any
              }} />
            </div>
          )}

          {/* Right: Secondary Articles (Stacked) */}
          <div className="lg:col-span-1 space-y-6">
            {secondaryArticles.map(article => (
              <StandardInsightCard 
                key={article.id} 
                article={{
                  ...article,
                  author: article.author || 'Inland Real Estate',
                  category: category as any
                }}
                layout="horizontal"
              />
            ))}
          </div>
        </div>

        {/* Horizontal Scrolling Articles with Navigation */}
        {gridArticles.length > 0 && (
          <div className="relative">
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Bài viết khác</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 hover:border-[#358b4e] hover:bg-[#358b4e]/10 flex items-center justify-center transition-all group"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-[#358b4e]" />
                </button>
                <button
                  onClick={() => swiperRef.current?.slideNext()}
                  className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 hover:border-[#358b4e] hover:bg-[#358b4e]/10 flex items-center justify-center transition-all group"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#358b4e]" />
                </button>
              </div>
            </div>

            {/* Swiper Slider */}
            <Swiper
              onSwiper={(swiper) => { swiperRef.current = swiper }}
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              className="!pb-2"
            >
              {gridArticles.map(article => (
                <SwiperSlide key={article.id}>
                  <StandardInsightCard 
                    article={{
                      ...article,
                      author: article.author || 'Inland Real Estate',
                      category: category as any
                    }}
                    layout="vertical"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  )
}
