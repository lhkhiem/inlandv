'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Article {
  slug: string
  title: string
  thumbnail: string
  category: string
}

interface RelatedArticlesProps {
  articles: Article[]
  basePath: '/goc-nhin-chuyen-gia' | '/tin-tuc-hoat-dong' | '/tin-tuc'
}

export default function RelatedArticles({ articles, basePath }: RelatedArticlesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerSlide = 3
  const totalSlides = Math.ceil(articles.length / itemsPerSlide)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
  }

  const visibleArticles = articles.slice(
    currentIndex * itemsPerSlide,
    (currentIndex + 1) * itemsPerSlide
  )

  return (
    <section className="bg-gray-800 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Các bài viết khác
          </h2>
          <div className="w-20 h-1 bg-brand-green mx-auto rounded-full" />
        </motion.div>

        {/* Slider Container */}
        <div className="relative">
          {/* Articles Grid */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {visibleArticles.map((article, index) => (
                  <motion.div
                    key={article.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      href={`${basePath}/${article.slug}`}
                      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Category Badge */}
                        <span className="inline-block px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-medium rounded-full mb-3">
                          {article.category}
                        </span>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-green transition-colors duration-300 line-clamp-2">
                          {article.title}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows - Desktop */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:bg-brand-green hover:text-white transition-all duration-300 group"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={goToNext}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:bg-brand-green hover:text-white transition-all duration-300 group"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Mobile Navigation */}
          {totalSlides > 1 && (
            <div className="md:hidden flex justify-center gap-4 mt-8">
              <button
                onClick={goToPrevious}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-brand-green hover:text-white transition-all duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={goToNext}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-brand-green hover:text-white transition-all duration-300"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-brand-green'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
