"use client"

import { useState, useEffect, useMemo, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import NewsActivityTabs from '@/components/news-activities/NewsActivityTabs'
import NewsActivityHero from '@/components/news-activities/NewsActivityHero'
import NewsActivityGrid from '@/components/news-activities/NewsActivityGrid'
import { newsActivityArticles, type NewsActivityCategory } from '@/lib/newsActivitiesData'
import BackToTopMount from '@/components/layout/BackToTopMount'

function NewsActivityCategoryContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category') as NewsActivityCategory
  
  const [activeTab, setActiveTab] = useState<NewsActivityCategory>(
    categoryParam || 'thi-truong-bds-cong-nghiep'
  )

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (categoryParam && categoryParam !== activeTab) {
      setActiveTab(categoryParam)
    }
  }, [categoryParam, activeTab])

  const filteredArticles = useMemo(() => {
    return newsActivityArticles.filter(article => article.category === activeTab)
  }, [activeTab])

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
        {/* Page Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Tin tức & Hoạt động
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-lg text-gray-600 max-w-2xl"
          >
            Cập nhật tin tức thị trường BĐS công nghiệp và hoạt động FDI
          </motion.p>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <NewsActivityTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>

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

export default function NewsActivityCategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Đang tải...</div>
    </div>}>
      <NewsActivityCategoryContent />
    </Suspense>
  )
}
