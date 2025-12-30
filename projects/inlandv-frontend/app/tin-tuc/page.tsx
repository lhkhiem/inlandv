"use client"

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import NewsTabs from '@/components/news/NewsTabs'
import NewsHero from '@/components/news/NewsHero'
import NewsGrid from '@/components/news/NewsGrid'
import NewsFloatingButtons from '@/components/news/NewsFloatingButtons'
import { type NewsCategory } from '@/lib/newsData'
import JobTable from '@/components/careers/JobTable'
import { api } from '@/lib/api'
import type { Post, Job } from '@/lib/types'
import { mapPostToNewsArticle, mapJobToNewsArticle, mapCategoryToNewsCategory, mapJobToJobPosting } from '@/lib/newsUtils'

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

  // Data state
  const [posts, setPosts] = useState<Post[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (categoryParam && categoryParam !== activeTab && ['tin-thi-truong', 'quy-hoach-chinh-sach', 'tu-van-hoi-dap', 'tuyen-dung'].includes(categoryParam)) {
      setActiveTab(categoryParam)
    }
  }, [categoryParam, activeTab])

  // Fetch data when activeTab changes
  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (activeTab === 'tuyen-dung') {
          // Fetch jobs
          const response = await api.getJobs(page, 12)
          if (isMounted) {
            setJobs(response.data || [])
            setPosts([])
            setTotalPages(response.pagination?.totalPages || 1)
          }
        } else {
          // Fetch posts by category
          const response = await api.getPosts(activeTab, page, 12)
          if (isMounted) {
            setPosts(response.data || [])
            setJobs([])
            setTotalPages(response.pagination?.totalPages || 1)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching news:', err)
          setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
          setPosts([])
          setJobs([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [activeTab, page])

  // Handle tab change - update both state and URL
  const handleTabChange = (category: NewsCategory) => {
    setActiveTab(category)
    setPage(1) // Reset to first page when changing category
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', category)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Convert posts/jobs to NewsArticle format
  const filteredArticles = useMemo(() => {
    if (activeTab === 'tuyen-dung') {
      return jobs.map(mapJobToNewsArticle)
    } else {
      return posts.map(post => mapPostToNewsArticle(post, activeTab))
    }
  }, [activeTab, posts, jobs])

  const featuredArticle = useMemo(() => {
    return filteredArticles.find(a => a.featured) || filteredArticles[0]
  }, [filteredArticles])

  const gridArticles = useMemo(() => {
    return filteredArticles.filter(a => a.id !== featuredArticle?.id)
  }, [filteredArticles, featuredArticle])

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <NewsFloatingButtons />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-[#2E8C4F] mb-4"
          >
            Tin tức
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-lg text-[#2E8C4F] max-w-2xl"
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

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block w-8 h-8 border-4 border-goldLight border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#2E8C4F]">Đang tải dữ liệu...</p>
          </motion.div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-red-400 text-lg">{error}</p>
          </motion.div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Tuyển dụng Tab - Show Job Table */}
            {activeTab === 'tuyen-dung' ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-xl overflow-hidden"
              >
                <JobTable jobs={jobs.map(mapJobToJobPosting)} />
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
                    <p className="text-[#2E8C4F] text-lg">Chưa có tin tức trong mục này.</p>
                  </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center items-center gap-4 mt-12"
                  >
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg bg-white text-[#2E8C4F] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2E8C4F] hover:text-white transition-colors border border-gray-300"
                    >
                      Trước
                    </button>
                    <span className="text-[#2E8C4F]">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg bg-white text-[#2E8C4F] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2E8C4F] hover:text-white transition-colors border border-gray-300"
                    >
                      Sau
                    </button>
                  </motion.div>
                )}
              </>
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
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#2E8C4F]">Đang tải...</div>
      </div>
    }>
      <NewsPageContent />
    </Suspense>
  )
}
