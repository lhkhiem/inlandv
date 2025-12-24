"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { PlayCircle, Image as ImageIcon, X, ZoomIn } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import Image from 'next/image'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface MediaSliderProps {
  images: string[]
  videoUrl?: string
  aspect?: '4:3' | '16:9'
  autoDelayMs?: number
}

// Helper function to detect if URL is YouTube
const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  return youtubeRegex.test(url)
}

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return ''
  
  // Extract video ID from various YouTube URL formats
  let videoId = ''
  
  // Handle youtu.be format
  const youtuBeMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (youtuBeMatch) {
    videoId = youtuBeMatch[1]
  } else {
    // Handle youtube.com format
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    if (youtubeMatch) {
      videoId = youtubeMatch[1]
    }
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  return url
}

export const MediaSlider: React.FC<MediaSliderProps> = ({ images, videoUrl, aspect = '16:9', autoDelayMs = 5000 }) => {
  const [showVideo, setShowVideo] = useState(false)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const swiperRef = useRef<any>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const youtubePlayerRef = useRef<any>(null)
  const { headerHeight } = useLayoutMeasurements()
  const aspectClass = aspect === '4:3' ? 'aspect-[4/3]' : 'aspect-video'
  
  // Determine video type
  const isYouTube = videoUrl ? isYouTubeUrl(videoUrl) : false
  const videoEmbedUrl = videoUrl && isYouTube ? getYouTubeEmbedUrl(videoUrl) : null
  const videoId = videoUrl && isYouTube ? getYouTubeEmbedUrl(videoUrl).match(/embed\/([^?]+)/)?.[1] : null
  
  const mediaSlides = [
    ...(videoUrl ? [{ type: 'video' as const, src: videoUrl, isYouTube }] : []),
    ...images.map((src) => ({ type: 'image' as const, src }))
  ]
  
  // Check if current slide is video
  const isVideoSlide = videoUrl && activeIndex === 0 && mediaSlides[0]?.type === 'video'
  
  // Control autoplay: disable when video is playing
  const shouldAutoplay = mediaSlides.length > 1 && !isVideoPlaying

  // Initialize YouTube player
  const initializeYouTubePlayer = useCallback(() => {
    if (!iframeRef.current || !videoId || !window.YT) return

    try {
      youtubePlayerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              // Video ended
              setIsVideoPlaying(false)
              if (swiperRef.current) {
                if (mediaSlides.length > 1) {
                  swiperRef.current.autoplay?.start()
                }
                swiperRef.current.slideNext()
              }
            } else if (event.data === 1) {
              // Video playing
              setIsVideoPlaying(true)
              if (swiperRef.current) {
                swiperRef.current.autoplay?.stop()
              }
            }
          },
        },
      })
    } catch (error) {
      console.error('[MediaSlider] YouTube player initialization error:', error)
    }
  }, [videoId, mediaSlides.length])

  // Load YouTube IFrame API
  useEffect(() => {
    if (!isYouTube || !showVideo || !videoId) return

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initializeYouTubePlayer()
      return
    }

    // Load YouTube IFrame API script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // Set callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      initializeYouTubePlayer()
    }

    return () => {
      // Cleanup
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
        youtubePlayerRef.current = null
      }
    }
  }, [isYouTube, showVideo, videoId, initializeYouTubePlayer])

  return (
    <section className="w-full mb-10" style={{ paddingTop: headerHeight + 30 }}>
      <div className="relative w-full overflow-hidden media-slider-container">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={shouldAutoplay ? { delay: autoDelayMs, disableOnInteraction: false } : false}
          onSwiper={(sw) => {
            swiperRef.current = sw
            // Update autoplay when swiper is ready
            if (isVideoPlaying) {
              sw.autoplay?.stop()
            }
          }}
          onSlideChange={(sw) => {
            const newIndex = sw.activeIndex
            setActiveIndex(newIndex)
            // If moving away from video slide, stop video state
            if (newIndex !== 0 || mediaSlides[0]?.type !== 'video') {
              setIsVideoPlaying(false)
              setShowVideo(false)
              // Resume autoplay if not on video
              if (mediaSlides.length > 1) {
                sw.autoplay?.start()
              }
            }
          }}
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
                        onClick={() => {
                          setShowVideo(true)
                          setIsVideoPlaying(true)
                          // Stop autoplay when video starts
                          if (swiperRef.current) {
                            swiperRef.current.autoplay?.stop()
                          }
                        }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-10"
                      >
                        <PlayCircle className="h-16 w-16 drop-shadow" />
                        <span className="text-sm font-medium">Xem video</span>
                      </button>
                    )}
                    {showVideo && (
                      <>
                        {isYouTube && videoEmbedUrl ? (
                          <iframe
                            ref={iframeRef}
                            id={`youtube-player-${videoId}`}
                            src={`${videoEmbedUrl}?autoplay=1&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                            title="Video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full"
                            frameBorder="0"
                            onLoad={() => {
                              setIsVideoPlaying(true)
                              // Stop autoplay when YouTube video loads
                              if (swiperRef.current) {
                                swiperRef.current.autoplay?.stop()
                              }
                              // Initialize player if API is ready
                              if (window.YT && window.YT.Player) {
                                initializeYouTubePlayer()
                              }
                            }}
                          />
                        ) : (
                          <video
                            src={m.src}
                            autoPlay
                            controls
                            playsInline
                            preload="metadata"
                            onPlay={() => {
                              setIsVideoPlaying(true)
                              // Stop autoplay when video starts playing
                              if (swiperRef.current) {
                                swiperRef.current.autoplay?.stop()
                              }
                            }}
                            onEnded={() => {
                              setIsVideoPlaying(false)
                              // Resume autoplay and move to next slide
                              if (swiperRef.current) {
                                if (mediaSlides.length > 1) {
                                  swiperRef.current.autoplay?.start()
                                }
                                swiperRef.current.slideNext()
                              }
                            }}
                            onError={(e) => {
                              console.error('[MediaSlider] Video load error:', e, 'URL:', m.src)
                              setIsVideoPlaying(false)
                              // Resume autoplay on error
                              if (swiperRef.current && mediaSlides.length > 1) {
                                swiperRef.current.autoplay?.start()
                              }
                            }}
                            className="h-full w-full object-contain"
                          >
                            Trình duyệt của bạn không hỗ trợ video tag.
                          </video>
                        )}
                      </>
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
