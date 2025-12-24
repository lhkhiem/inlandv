'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function AboutCTASection() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/95 to-primary-800/95 z-[5]" />
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-8 sm:px-12 md:px-16 lg:px-20 py-4 md:py-6 max-h-[85vh] overflow-y-auto scrollbar-hide flex flex-col justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Bắt đầu hành trình cùng chúng tôi
          </h2>
          <p className="text-xl md:text-2xl text-goldLight mb-10 max-w-2xl mx-auto">
            Hãy để Inland Real Estate đồng hành cùng bạn trong mọi quyết định đầu tư bất động sản
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/mua-ban"
              className="btn-primary group bg-white text-goldDark hover:bg-gray-100"
            >
              Xem dự án
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/lien-he"
              className="px-6 py-3 border-2 border-white text-white rounded-md hover:bg-white hover:text-goldDark transition-colors duration-200"
            >
              Liên hệ ngay
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
