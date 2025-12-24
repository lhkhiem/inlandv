"use client"

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import NewsTabs from '@/components/news/NewsTabs'
import NewsHero from '@/components/news/NewsHero'
import NewsGrid from '@/components/news/NewsGrid'
import NewsFloatingButtons from '@/components/news/NewsFloatingButtons'
import { newsArticles, type NewsCategory } from '@/lib/newsData'
import JobTable from '@/components/careers/JobTable'
import { jobPostings } from '@/lib/careersData'

function NewsPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category') as NewsCategory | null
  
  const [activeTab, setActiveTab] = useState<NewsCategory>(
    (categoryParam && ['tin-thi-truong', 'quy-hoach-chinh-sach', 'tu-van-hoi-dap', 'tuyen-dung'].includes(categoryParam))
      ? categoryParam
      : 'tin-thi-truong'
  )

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (categoryParam && categoryParam !== activeTab && ['tin-thi-truong', 'quy-hoach-chinh-sach', 'tu-van-hoi-dap', 'tuyen-dung'].includes(categoryParam)) {
      setActiveTab(categoryParam)
    }
  }, [categoryParam, activeTab])

  // Handle tab change - update both state and URL
  const handleTabChange = (category: NewsCategory) => {
    setActiveTab(category)
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', category)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const filteredArticles = useMemo(() => {
    return newsArticles.filter(article => article.category === activeTab)
  }, [activeTab])

  const featuredArticle = useMemo(() => {
    return filteredArticles.find(a => a.featured) || filteredArticles[0]
  }, [filteredArticles])

  const gridArticles = useMemo(() => {
    return filteredArticles.filter(a => a.id !== featuredArticle?.id)
  }, [filteredArticles, featuredArticle])

  return (
    <div className="min-h-screen bg-[#151313]">
      <NewsFloatingButtons />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Tin tức
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-lg text-gray-300 max-w-2xl"
          >
            Cập nhật thông tin mới nhất về thị trường bất động sản, dự án mới và các chương trình ưu đãi hấp dẫn.
          </motion.p>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <NewsTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </motion.div>

        {/* Tuyển dụng Tab - Show Job Table */}
        {activeTab === 'tuyen-dung' ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1f1b1b] rounded-xl shadow-xl overflow-hidden"
          >
            <JobTable jobs={jobPostings} />
          </motion.div>
        ) : (
          <>
            {/* Featured Hero */}
            {featuredArticle && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-16"
              >
                <NewsHero article={featuredArticle} />
              </motion.div>
            )}

            {/* News Grid */}
            {gridArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <NewsGrid articles={gridArticles} />
              </motion.div>
            )}

            {/* No articles message */}
            {filteredArticles.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-gray-500 text-lg">Chưa có tin tức trong mục này.</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#151313] flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    }>
      <NewsPageContent />
    </Suspense>
  )
}
