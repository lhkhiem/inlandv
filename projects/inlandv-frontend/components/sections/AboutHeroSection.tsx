'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

// Counter animation hook
function useCounter(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start)
  const [isAnimating, setIsAnimating] = useState(false)

  const animate = () => {
    setIsAnimating(true)
    const startTime = Date.now()
    const endTime = startTime + duration

    const timer = setInterval(() => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(start + (end - start) * easeOutQuart)
      
      setCount(currentCount)

      if (now >= endTime) {
        setCount(end)
        clearInterval(timer)
        setIsAnimating(false)
      }
    }, 16)

    return () => clearInterval(timer)
  }

  return { count, animate, isAnimating }
}

// Animated counter component
function AnimatedCounter({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { count, animate } = useCounter(value, duration)

  useEffect(() => {
    if (isInView) {
      animate()
    }
  }, [isInView])

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-goldLight mb-2">
      {count.toLocaleString()}{suffix}
    </div>
  )
}

export default function AboutHeroSection() {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden ${
      isPortrait ? 'min-h-screen py-8' : 'h-screen'
    }`}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-[5]" />
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Content */}
      <div className={`relative z-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6 md:py-8 ${
        isPortrait ? 'flex flex-col justify-start' : 'max-h-[85vh] overflow-y-auto scrollbar-hide flex flex-col justify-center'
      } text-center`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#2E8C4F] mb-6">
            Về Inland Real Estate
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Với hơn 15 năm kinh nghiệm, chúng tôi tự hào là đối tác đáng tin cậy của hàng nghìn
            khách hàng trên khắp cả nước. Sự hài lòng của bạn chính là thành công của chúng tôi.
          </p>
        </motion.div>

        {/* Stats with counter animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <AnimatedCounter value={15} suffix="+" duration={2000} />
            <div className="text-sm md:text-base text-gray-300">
              Năm Kinh Nghiệm
            </div>
          </div>
          
          <div className="text-center">
            <AnimatedCounter value={200} suffix="+" duration={2200} />
            <div className="text-sm md:text-base text-gray-300">
              Dự Án
            </div>
          </div>
          
          <div className="text-center">
            <AnimatedCounter value={5000} suffix="+" duration={2500} />
            <div className="text-sm md:text-base text-gray-300">
              Khách Hàng
            </div>
          </div>
          
          <div className="text-center">
            <AnimatedCounter value={50} suffix="+" duration={2000} />
            <div className="text-sm md:text-base text-gray-300">
              Đối Tác
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
