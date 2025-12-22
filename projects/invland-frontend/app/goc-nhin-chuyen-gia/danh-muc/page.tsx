"use client"

import { useState, useEffect, useMemo, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import InsightsTabs from '@/components/insights/InsightsTabs'
import InsightsHero from '@/components/insights/InsightsHero'
import InsightsGrid from '@/components/insights/InsightsGrid'
import { insightArticles, type InsightCategory } from '@/lib/insightsData'
import BackToTopMount from '@/components/layout/BackToTopMount'

function InsightsCategoryContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category') as InsightCategory
  
  const [activeTab, setActiveTab] = useState<InsightCategory>(
    categoryParam || 'phan-tich-thi-truong'
  )

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (categoryParam && categoryParam !== activeTab) {
      setActiveTab(categoryParam)
    }
  }, [categoryParam, activeTab])

  const filteredArticles = useMemo(() => {
    return insightArticles.filter(article => article.category === activeTab)
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
            Góc nhìn chuyên gia
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-lg text-gray-600 max-w-2xl"
          >
            Phân tích thị trường BĐS công nghiệp, cẩm nang đầu tư và tin tức FDI
          </motion.p>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <InsightsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>

        {/* Featured Hero */}
        {featuredArticle && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <InsightsHero article={featuredArticle} />
          </motion.div>
        )}

        {/* Articles Grid */}
        {gridArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <InsightsGrid articles={gridArticles} />
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

export default function InsightsCategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Đang tải...</div>
    </div>}>
      <InsightsCategoryContent />
    </Suspense>
  )
}
