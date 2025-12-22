"use client"

import { motion } from 'framer-motion'
import { Calendar, User } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NewsArticle, newsCategoryLabels } from '@/lib/newsData'
import NewsFloatingButtons from '@/components/news/NewsFloatingButtons'

interface NewsDetailLayoutProps {
  article: NewsArticle
  relatedArticles: NewsArticle[]
  basePath?: string
}

export default function NewsDetailLayout({ article, relatedArticles, basePath = '/tin-tuc' }: NewsDetailLayoutProps) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  
  const shareLinks = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      color: '#1DA1F2',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.title)}`
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
    },
    {
      name: 'Zalo',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c.169 0 .307.138.307.307v7.066c0 .169-.138.307-.307.307h-1.84c-.169 0-.307-.138-.307-.307v-7.066c0-.169.138-.307.307-.307h1.84zm-3.84 0c.169 0 .307.138.307.307v7.066c0 .169-.138.307-.307.307h-1.84c-.169 0-.307-.138-.307-.307v-7.066c0-.169.138-.307.307-.307h1.84zm-3.84 0c.169 0 .307.138.307.307v7.066c0 .169-.138.307-.307.307H7.744c-.169 0-.307-.138-.307-.307v-7.066c0-.169.138-.307.307-.307h1.84z" />
        </svg>
      ),
      color: '#0068FF',
      url: `https://zalo.me/share?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(article.title)}`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <NewsFloatingButtons />

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Hero Image - Full width */}
      <section data-bg-type="dark" className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${article.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
      </section>

      {/* Main Content Container - với margin 2 bên 15% */}
      <div className="relative -mt-32 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:mx-[15%] xl:max-w-none xl:px-0">
          {/* Article Content */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8"
          >
            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-goldDark text-white">
                {newsCategoryLabels[article.category]}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(article.date).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {article.author}
                </div>
              )}
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-goldDark prose-a:no-underline hover:prose-a:underline mb-8"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Share Buttons */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Chia sẻ:</span>
                {shareLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: social.color, color: 'white' }}
                  >
                    {social.icon}
                    <span className="text-sm font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.article>

          {/* Related Articles - Horizontal Slider */}
          {relatedArticles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết liên quan</h2>
              <div className="relative">
                <Swiper
                  modules={[Navigation]}
                  navigation={{
                    nextEl: '.swiper-button-next-related',
                    prevEl: '.swiper-button-prev-related',
                  }}
                  spaceBetween={24}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                  className="!pb-12"
                >
                  {relatedArticles.map((related) => (
                    <SwiperSlide key={related.id}>
                      <Link href={`${basePath}/${related.slug}`}>
                        <motion.div
                          whileHover={{ y: -4 }}
                          className="bg-white rounded-xl shadow-lg overflow-hidden h-full cursor-pointer"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={related.thumbnail}
                              alt={related.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                              {related.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {related.excerpt}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
                {/* Navigation Buttons */}
                <button className="swiper-button-prev-related absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button className="swiper-button-next-related absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>
          )}

          <div className="h-16" />
        </div>

        {/* Side Banners - Fixed 15% each side */}
        {/* Left Banner */}
        <div className="fixed left-0 top-0 bottom-0 w-[15%] bg-gray-100 z-0 hidden xl:block" />

        {/* Right Banner with Ad 160x600 */}
        <div className="fixed right-0 top-0 bottom-0 w-[15%] bg-gray-100 z-0 hidden xl:block">
          <div className="sticky top-28 mt-8 mx-auto w-[160px] h-[600px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Quảng cáo<br />160x600
          </div>
        </div>
      </div>
    </div>
  )
}
