"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { api } from '@/lib/api'
import type { IndustrialPark } from '@/lib/types'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { getAssetUrl } from '@/lib/api'

export default function IndustrialLandTransferKCNSection() {
  const revealed = useSectionReveal(1) // Section index in homepage
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  
  // Uniform scaling hook
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  // State cho scale và max-width
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)

  // State cho data, loading, error
  const [parks, setParks] = useState<IndustrialPark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API - only once
  useEffect(() => {
    let isMounted = true
    let hasFetched = false
    
    const fetchData = async () => {
      if (hasFetched) return
      hasFetched = true
      
      try {
        setLoading(true)
        setError(null)
        console.log('[Component] Fetching chuyen nhuong trong KCN...')
        const data = await api.getPropertiesChuyenNhuongTrongKCN(6)
        console.log('[Component] Received data:', data)
        if (isMounted) {
          setParks(data)
          if (data.length === 0) {
            console.warn('[Component] No industrial parks found. Check database and filters.')
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('[Component] Error fetching chuyen nhuong trong KCN:', err)
          setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
          setParks([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Small delay to stagger requests
    const timeoutId = setTimeout(fetchData, 0)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  // Map industrial parks to cards format
  const cards = parks.map((park) => {
    // Convert transfer_price từ tỷ VND sang USD/m² (giả sử tính theo available_area)
    // transfer_price_min/max là tỷ VND, cần convert sang USD và chia cho diện tích
    let priceUSD = '0'
    if (park.transfer_price_min && park.available_area && park.available_area > 0) {
      // Convert tỷ VND sang VND (x 1,000,000,000)
      const priceVND = park.transfer_price_min * 1000000000
      // Tính giá/m² (available_area đang là ha, cần x 10000 để ra m²)
      const areaM2 = park.available_area * 10000
      const pricePerSqm = priceVND / areaM2
      // Convert sang USD (tỷ giá ~24,000 VND/USD)
      priceUSD = (pricePerSqm / 24000).toFixed(2)
    }
    
    // Convert area từ ha sang m²
    const areaM2 = park.available_area 
      ? (park.available_area * 10000).toLocaleString('vi-VN')
      : park.total_area 
        ? (park.total_area * 10000).toLocaleString('vi-VN')
        : '0'
    
    return {
      id: park.id,
      slug: park.slug,
      title: 'Chuyển nhượng đất trong KCN',
      price: `$ ${priceUSD} USD/m²`,
      code: park.code,
      park: park.name,
      desc: park.description || park.description_full || `${park.name} thu hút nhiều doanh nghiệp đầu tư công nghiệp FDI…`,
      advantage: 'Loại: Chuyển nhượng đất có XN trong KCN',
      location: park.province,
      area: `Diện tích: ${areaM2} m²`,
      contact: park.contact_phone ? `Liên hệ: ${park.contact_phone}` : 'Liên hệ: 0896 686 645',
      thumbnail: park.thumbnail_url ? getAssetUrl(park.thumbnail_url) : undefined,
    }
  })

  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    setIsPortrait(!isLandscape)
  }, [isLandscape])

  // Tính toán max-width và scale
  useEffect(() => {
    if (typeof window === 'undefined' || !isLandscape) {
      setAdjustedScale(1)
      setMaxContainerWidth(undefined)
      return
    }
    
    const viewportWidth = viewport.width || window.innerWidth
    const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
    const timelineLeftEdge = viewportWidth - timelineRightPadding - timelineWidth
    const centerX = viewportWidth / 2
    const maxScaledContentWidth = Math.max(0, 2 * (timelineLeftEdge - 15 - centerX))
    const referenceContentWidth = 1920
    const scaleByTimeline = maxScaledContentWidth > 0 
      ? maxScaledContentWidth / referenceContentWidth 
      : uniformScale
    const finalScale = Math.min(uniformScale, scaleByTimeline)
    const clampedScale = Math.max(0.5, Math.min(1.0, finalScale))
    const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
    
    setAdjustedScale(clampedScale)
    setMaxContainerWidth(maxWidthBeforeScale)
  }, [uniformScale, isLandscape, timelineWidth, viewport])

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] ${
      isPortrait ? 'min-h-0 py-4' : 'h-screen'
    }`}>
      {/* Wrapper Container - Căn giữa viewport hoàn toàn */}
      {/* Cùng z-index với timeline (z-[90]) */}
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
          initial={{ opacity: 0, y: 30 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={isPortrait ? 'w-full' : 'w-full'}
          style={!isPortrait ? {
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1280px',
            paddingLeft: '15px',
            paddingRight: '15px',
            transform: `scale(${adjustedScale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          } : {}}
        >
          {/* Section header */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-goldLight mb-6 text-center"
          >
            Chuyển nhượng đất trong KCN
          </motion.h2>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-goldLight border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-white/70">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && cards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/70">Hiện chưa có sản phẩm nào.</p>
            </div>
          )}

          {/* Grid 3 cards mỗi hàng - Tất cả cards cùng height */}
          {!loading && !error && cards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`grid gap-4 sm:gap-6 md:gap-8 ${
                isPortrait ? 'grid-cols-1' : 'grid-cols-3 gap-x-6 gap-y-8'
              }`}
              style={!isPortrait ? { gridAutoRows: '1fr' } : {}}
            >
              {cards.map((card, idx) => {
            return (
            <Link key={card.id} href={`/kcn/${card.slug}`} className={!isPortrait ? 'h-full' : ''}>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                className={`bg-white rounded-md border border-black overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  isPortrait 
                    ? 'flex flex-col' 
                    : 'flex flex-row h-full'
                }`}
            >
              {/* Hình + tag - Bên trái, tỷ lệ 4:3, chiều cao chạm mép trên hàng cuối */}
              <div className={`relative flex-shrink-0 ${isPortrait ? 'w-full' : ''}`} style={!isPortrait ? { 
                width: '40%',
                // Chiều cao ảnh = chiều cao card - chiều cao hàng cuối
                // Hàng cuối có padding py-1.5 (12px) + border (1px) + text height (~20px) = ~33px
                height: 'calc(100% - 33px)',
                aspectRatio: '4/3'
              } : {}}>
                <img
                  src={card.thumbnail || "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=800"}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 bg-[#0050C8] text-white px-2 py-2 leading-snug w-1/2">
                  <span className="block text-[8px] md:text-[9px] whitespace-normal">
                    {card.title}
                  </span>
                </div>
              </div>

              {/* Nội dung chính - Bên phải, flex column */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Phần nội dung trên - flex-1 để chiếm phần còn lại */}
                <div className="px-3 py-2 text-[10px] md:text-xs text-black flex flex-col justify-between flex-1">
                  <div>
                    {/* Hàng giá thuê + mã đối diện nhau */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-semibold text-[11px] md:text-[12px]">
                        {card.price}
                      </div>
                      <div className="text-[11px] md:text-[12px] text-gray-700 font-semibold">
                        {card.code}
                      </div>
                    </div>

                    {/* Middle text block */}
                    <div className="mt-2 space-y-2">
                      <div className="font-semibold text-[10px] md:text-[11px]">
                        {card.park}
                      </div>
                      <p className="text-[9px] md:text-[10px] text-gray-700 leading-snug italic line-clamp-2">
                        {card.desc}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-red-500 leading-snug font-semibold">
                        {card.advantage}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hàng dưới cùng: rải đều 3 cột, không bị ảnh che */}
                <div className="flex items-center justify-between border-t border-gray-300 px-3 py-1.5 text-[9px] md:text-[10px] text-gray-700 font-semibold flex-shrink-0">
                  <span className="flex-1 text-left truncate">{card.location}</span>
                  <span className="flex-1 text-center truncate">{card.area}</span>
                  <span className="flex-1 text-right text-red-500 truncate">{card.contact}</span>
                </div>
              </div>
            </motion.article>
            </Link>
            )
          })}
            </motion.div>
          )}

          {/* Nút "Xem tất cả" - căn phải, chỉ hiển thị khi có đủ 6 card */}
          {!loading && !error && cards.length >= 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-end mt-6"
            >
              <Link
                href="/kcn/chuyen-nhuong-trong-kcn"
                className="px-6 py-2 bg-goldLight text-white font-heading font-semibold text-sm md:text-base rounded hover:bg-goldLight/90 transition-colors"
              >
                Xem tất cả
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
