"use client"

import { useState, useEffect, useMemo, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NewsActivityHero from '@/components/news-activities/NewsActivityHero'
import NewsActivityGrid from '@/components/news-activities/NewsActivityGrid'
import { newsActivityArticles } from '@/lib/newsActivitiesData'
import BackToTopMount from '@/components/layout/BackToTopMount'

function ProjectsPageContent() {
  const searchParams = useSearchParams()
  
  const filteredArticles = useMemo(() => {
    return newsActivityArticles.filter(article => article.category === 'du-an-moi')
  }, [])

  const featuredArticle = useMemo(() => {
    return filteredArticles.find(a => a.featured) || filteredArticles[0]
  }, [filteredArticles])

  const gridArticles = useMemo(() => {
    return filteredArticles.filter(a => a.id !== featuredArticle?.id)
  }, [filteredArticles, featuredArticle])

  return (
    <div className="min-h-screen bg-gray-50">
      <BackToTopMount />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        {/* Back Button */}
        <Link 
          href="/tin-tuc-hoat-dong#hoat-dong"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#358b4e] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại Hoạt động INLANDV</span>
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Dự án mới triển khai
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-lg text-gray-600 max-w-2xl"
          >
            Các dự án bất động sản công nghiệp mới được INLANDV phân phối và phát triển
          </motion.p>
        </div>

        {/* Featured Hero */}
        {featuredArticle && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <NewsActivityHero article={featuredArticle} />
          </motion.div>
        )}

        {/* Articles Grid */}
        {gridArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <NewsActivityGrid articles={gridArticles} />
          </motion.div>
        )}

        {/* No articles message */}
        {filteredArticles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-500 text-lg">Chưa có bài viết trong mục này.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Đang tải...</div>
    </div>}>
      <ProjectsPageContent />
    </Suspense>
  )
}
