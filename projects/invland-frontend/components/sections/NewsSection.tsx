'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { newsArticles, newsCategoryLabels, type NewsCategory } from '@/lib/newsData'
import { jobPostings } from '@/lib/careersData'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'

const CATEGORIES: { id: NewsCategory; label: string }[] = [
  { id: 'tin-thi-truong', label: newsCategoryLabels['tin-thi-truong'] },
  { id: 'quy-hoach-chinh-sach', label: newsCategoryLabels['quy-hoach-chinh-sach'] },
  { id: 'tu-van-hoi-dap', label: newsCategoryLabels['tu-van-hoi-dap'] },
  { id: 'tuyen-dung', label: newsCategoryLabels['tuyen-dung'] },
]

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export default function NewsSection() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('tin-thi-truong')
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  
  // Uniform Canvas Scaler: Scale content uniformly based on viewport dimensions
  // Reference: 1920×1080 (FullHD 23") = scale 1.0
  // Portrait: no scaling (scale = 1)
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  // Calculate adjusted scale and max-width to ensure content doesn't touch timeline
  // Content is centered on viewport, but scale must account for timeline
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)
  
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    setIsPortrait(!isLandscape)
  }, [isLandscape])

  // Calculate max-width and scale for landscape mode
  useEffect(() => {
    if (typeof window === 'undefined' || !isLandscape) {
      setAdjustedScale(1)
      setMaxContainerWidth(undefined)
      return
    }
    
    const viewportWidth = viewport.width || window.innerWidth
    
    // Timeline right padding: md:right-10 (40px) hoặc right-6 (24px)
    const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
    // Timeline left edge = viewportWidth - timelineRightPadding - timelineWidth
    const timelineLeftEdge = viewportWidth - timelineRightPadding - timelineWidth
    
    // Nội dung căn giữa viewport thiết bị (centerX = viewportWidth / 2)
    const centerX = viewportWidth / 2
    
    // Max content width (sau scale) để không chạm timeline
    // Content right edge sau scale phải <= timelineLeftEdge - 15px (buffer tối thiểu)
    // Content right edge = centerX + (scaledWidth / 2)
    // => scaledWidth <= 2 * (timelineLeftEdge - 15 - centerX)
    const maxScaledContentWidth = Math.max(0, 2 * (timelineLeftEdge - 15 - centerX))
    
    // Reference content width at FullHD (1920px)
    const referenceContentWidth = 1920
    
    // Calculate scale based on timeline constraint
    const scaleByTimeline = maxScaledContentWidth > 0
      ? maxScaledContentWidth / referenceContentWidth
      : uniformScale
    
    // Use the smaller of uniform scale and timeline-constrained scale
    const finalScale = Math.min(uniformScale, scaleByTimeline)
    
    // Clamp scale between 0.5 and 1.0
    const clampedScale = Math.max(0.5, Math.min(1.0, finalScale))
    
    // Max-width = Ngang màn hình - 2x(Ngang bộ timeline + khoảng cách từ mép màn hình đến mép phải timeline + 15px)
    const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
    
    setAdjustedScale(clampedScale)
    setMaxContainerWidth(maxWidthBeforeScale)
  }, [uniformScale, isLandscape, timelineWidth, viewport])

  const filteredPosts = useMemo(() => {
    let items: Array<{
      id: string
      slug: string
      title: string
      category: NewsCategory
      thumbnail: string
      excerpt: string
      date: string
    }>

    if (activeCategory === 'tuyen-dung') {
      // Convert job postings to article format
      items = jobPostings.slice(0, 6).map((job) => ({
        id: job.id,
        slug: job.slug,
        title: job.title,
        category: 'tuyen-dung' as NewsCategory,
        thumbnail: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=800', // Default thumbnail for jobs
        excerpt: job.description.overview || `Tuyển dụng ${job.quantity} vị trí ${job.title}. Hạn nộp hồ sơ: ${new Date(job.deadline).toLocaleDateString('vi-VN')}`,
        date: job.deadline, // Use deadline as date
      }))
    } else {
      // Use news articles for other categories
      items = newsArticles
        .filter((article) => article.category === activeCategory)
        .slice(0, 6)
        .map((article) => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          category: article.category,
          thumbnail: article.thumbnail,
          excerpt: article.excerpt,
          date: article.date,
        }))
    }

    const col1 = items.slice(0, 3) // 3 items for left column
    const col2 = items.slice(3, 6) // 3 items for right column

    return [col1, col2] as const
  }, [activeCategory])

  const [colLeft, colRight] = filteredPosts

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] ${
      isPortrait ? 'min-h-0' : 'h-screen'
    }`}>
      {/* Wrapper container - Căn giữa viewport (cả ngang và dọc) */}
      <div
        className={`relative z-[90] ${
          isPortrait 
            ? 'w-full flex flex-col justify-start px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20' 
            : 'absolute inset-0 flex items-center justify-center'
        }`}
        style={isPortrait ? {
          paddingTop: `${headerHeight + 15}px`
        } : {}}
      >
        {/* Content Container - Max-width động, scale như canvas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={isPortrait ? 'w-full py-6' : 'w-full max-h-[85vh] overflow-y-auto scrollbar-hide'}
          style={!isPortrait ? {
            // Max-width động để đảm bảo không chạm timeline
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1600px',
            // Padding đối xứng 15px mỗi bên (theo layout ảnh)
            paddingLeft: '15px',
            paddingRight: '15px',
            // Scale toàn bộ content container như canvas
            transform: `scale(${adjustedScale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          } : {}}
        >
          <div className="flex flex-col">
        {/* Header + Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={isPortrait ? "mb-3" : "mb-4"}
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-white mb-3">
            Tin Tức
          </h2>

          <div className="flex flex-wrap gap-2 text-sm md:text-base">
            {CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategory
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-full border text-xs md:text-sm transition-colors duration-200 ${
                    isActive
                      ? 'bg-goldLight border-goldLight text-black font-semibold'
                      : 'bg-transparent border-white/15 text-white/70 hover:border-goldLight hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Content grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid md:grid-cols-2 gap-x-6 gap-y-4"
          >
            {[colLeft, colRight].map((column, colIndex) => (
              <div key={colIndex} className="space-y-3">
              {column.map((article, index) => {
                // Determine the correct route based on category
                const articleUrl = article.category === 'tuyen-dung' 
                  ? `/tin-tuc/tuyen-dung/${article.slug}`
                  : `/tin-tuc/${article.slug}`
                
                // Format date for display
                const articleDate = new Date(article.date)
                const formattedDate = articleDate.toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
                const formattedTime = articleDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })

                return (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                  >
                    <Link
                      href={articleUrl}
                      className="block grid grid-cols-[minmax(7rem,8rem)_1fr] bg-transparent rounded-md overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Hình, tỷ lệ 4:3 */}
                      <div className="relative">
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-full h-full object-cover aspect-[4/3]"
                        />
                      </div>

                      {/* Nội dung chính – cột phải: 4 dòng */}
                      <div className="px-2 py-1.5 text-[10px] md:text-xs text-white flex flex-col justify-between">
                        {/* Dòng 1: Tiêu đề */}
                        <h3 className="font-semibold text-[11px] md:text-xs mb-0.5 line-clamp-1 leading-tight">
                          {article.title}
                        </h3>
                        
                        {/* Dòng 2: Mô tả */}
                        <p className="text-[9px] md:text-[10px] text-white/80 leading-snug italic line-clamp-1 mb-1">
                          {article.excerpt}
                        </p>
                        
                        {/* Dòng 3: Chuyên mục */}
                        <p className="text-[9px] md:text-[10px] text-white/70 mb-1">
                          Chuyên mục: <span className="text-goldLight font-semibold">{newsCategoryLabels[article.category]}</span>
                        </p>
                        
                        {/* Dòng 4: Time và Date chia 2 cột */}
                        <div className="flex items-center justify-between text-[9px] md:text-[10px] text-white/70">
                          <span>{formattedTime}</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                )
              })}
              </div>
            ))}
          </motion.div>

            {/* Xem thêm */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={isPortrait ? "mt-3 mb-0 flex justify-end" : "mt-4 flex justify-end"}
            >
              <Link
                href={`/tin-tuc/danh-muc?category=${activeCategory}`}
                className="inline-flex items-center text-goldLight text-sm md:text-base hover:underline group"
              >
                Xem thêm
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
