"use client"
import React, { useState, useRef } from 'react'
import { PlayCircle, Image as ImageIcon, X, ZoomIn } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import Image from 'next/image'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'

interface MediaSliderProps {
  images: string[]
  videoUrl?: string
  aspect?: '4:3' | '16:9'
  autoDelayMs?: number
}

export const MediaSlider: React.FC<MediaSliderProps> = ({ images, videoUrl, aspect = '16:9', autoDelayMs = 3000 }) => {
  const [showVideo, setShowVideo] = useState(false)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<any>(null)
  const { headerHeight } = useLayoutMeasurements()
  const aspectClass = aspect === '4:3' ? 'aspect-[4/3]' : 'aspect-video'
  const mediaSlides = [
    ...(videoUrl ? [{ type: 'video' as const, src: videoUrl }] : []),
    ...images.map((src) => ({ type: 'image' as const, src }))
  ]

  return (
    <section className="w-full mb-10" style={{ paddingTop: headerHeight + 30 }}>
      <div className="relative w-full overflow-hidden media-slider-container">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={mediaSlides.length > 1 ? { delay: autoDelayMs, disableOnInteraction: false } : false}
          onSwiper={(sw) => (swiperRef.current = sw)}
          onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
          className="w-full"
        >
          {mediaSlides.length === 0 && (
            <SwiperSlide>
              <div className="relative w-full aspect-video max-h-[700px] flex items-center justify-center bg-gray-200 text-gray-500">
                <ImageIcon className="h-12 w-12" />
              </div>
            </SwiperSlide>
          )}
          {mediaSlides.map((m, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative w-full aspect-video max-h-[700px] bg-black rounded-xl overflow-hidden">
                {m.type === 'image' ? (
                  <div
                    className="relative w-full h-full cursor-zoom-in group"
                    onClick={() => setZoomImage(m.src)}
                  >
                    <Image
                      src={m.src}
                      alt={`media-${idx}`}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, (max-width:1200px) 100vw, 100vw"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                      <ZoomIn className="h-12 w-12 text-white opacity-0 group-hover:opacity-80 transition" />
                    </div>
                  </div>
                ) : (
                  <div className="relative h-full w-full bg-black">
                    {!showVideo && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white"
                      >
                        <PlayCircle className="h-16 w-16 drop-shadow" />
                        <span className="text-sm font-medium">Xem video</span>
                      </button>
                    )}
                    {showVideo && (
                      <video
                        src={m.src}
                        autoPlay
                        controls
                        onEnded={() => {
                          if (swiperRef.current) swiperRef.current.slideNext()
                        }}
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {mediaSlides.length > 1 && (
          <div className="mt-6 flex items-center gap-2 px-2 pb-4 overflow-x-auto">
            {mediaSlides.map((m, i) => (
              <button
                key={i}
                onClick={() => swiperRef.current?.slideTo(i)}
                className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? 'ring-2 ring-[#358b4e] shadow-lg -translate-y-1'
                    : 'ring-1 ring-black/10 hover:ring-[#358b4e] shadow-sm'
                }`}
              >
                {m.type === 'image' ? (
                  <Image src={m.src} alt={`thumb-${i}`} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black text-white text-[10px]">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Đóng"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
            <Image
              src={zoomImage}
              alt="Zoom view"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        .media-slider-container .swiper-button-next, 
        .media-slider-container .swiper-button-prev {
          color: #fff;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(0,0,0,0.28);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          backdrop-filter: blur(4px);
        }
        .media-slider-container .swiper-button-next:after, 
        .media-slider-container .swiper-button-prev:after {
          font-size: 18px;
          font-weight: 600;
        }
        .media-slider-container .swiper-pagination-bullet {
          background: rgba(255,255,255,0.7);
          opacity: 1;
        }
        .media-slider-container .swiper-pagination-bullet-active {
          background: #fff;
        }
      `}</style>
    </section>
  )
}

export default MediaSlider
