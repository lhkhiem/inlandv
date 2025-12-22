'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useFullpage } from '@/components/FullpageContext'

/**
 * MoveTop Button chỉ dành cho PORTRAIT mode
 * Tách riêng để không ảnh hưởng đến landscape
 */
export default function PortraitMoveTopButton() {
  const [isPortrait, setIsPortrait] = useState(false)
  const { currentSection, totalSections, isInFooterZone } = useFullpage()

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

  // Chỉ hiển thị trên portrait, không ở footer zone, và có sections
  // Hiển thị khi đã scroll xuống (currentSection > 0) hoặc khi có scroll position > 100px
  const [scrollY, setScrollY] = useState(0)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Hiển thị khi: portrait mode, không ở footer
  // Nếu có sections (fullpage): hiển thị khi đã qua section 0 hoặc scroll > 100px
  // Nếu không có sections (normal scroll): hiển thị khi scroll > 100px
  const isVisible = isPortrait && !isInFooterZone && (
    totalSections > 0 
      ? (currentSection > 0 || scrollY > 100)
      : scrollY > 100
  )

  const scrollToTop = () => {
    if (totalSections > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      window.dispatchEvent(new CustomEvent('scrollToSection', { detail: { section: 0 } }))
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed right-8 w-7 h-10 flex items-center justify-center border-2 border-white/70 hover:border-white bg-white/5 backdrop-blur-sm rounded-full transition-all duration-300 group z-[90]"
          style={{ bottom: '1.5rem' }}
          aria-label="Quay về đầu trang"
        >
          <ArrowUp className="w-4 h-4 text-white/80 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

