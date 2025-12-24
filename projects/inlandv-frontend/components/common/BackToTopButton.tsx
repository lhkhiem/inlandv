'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useFullpage } from '@/components/FullpageContext'

interface BackToTopButtonProps {
  forceWhite?: boolean // Force white styling for special sections (e.g., green backgrounds)
}

export default function BackToTopButton({ forceWhite = false }: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const { backgroundType, currentSection, totalSections, isInFooterZone } = useFullpage()
  const [detectedBackground, setDetectedBackground] = useState<'light' | 'dark' | 'image'>('light')
  const rafId = useRef<number | null>(null)
  const ticking = useRef(false)

  // Detect portrait mode - ẩn button trên portrait vì đã có PortraitMoveTopButton
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

  useEffect(() => {
    const detectBackgroundColor = () => {
      // Sample the CENTER of the viewport to represent the current section
      const sampleX = Math.floor(window.innerWidth / 2)
      const sampleY = Math.floor(window.innerHeight / 2)

      let el = document.elementFromPoint(sampleX, sampleY) as HTMLElement | null

      // If center hits the floating button itself, shift left
      if (el && el.closest && el.closest('button')) {
        el = document.elementFromPoint(sampleX - 80, sampleY) as HTMLElement | null
      }

      // PRIORITY 1: Check for explicit data-bg-type attribute (like fullpage sections)
      const getNearestSection = (start: HTMLElement | null) => {
        let cur = start
        let c = 0
        while (cur && c < 25) {
          if (cur && (cur.tagName === 'SECTION' || cur.tagName === 'FOOTER')) return cur
          cur = cur?.parentElement as HTMLElement | null
          c++
        }
        return null
      }

      const section = getNearestSection(el)
      if (section) {
        // Check for explicit data attribute first (most reliable)
        const explicitType = section.getAttribute('data-bg-type') as 'light' | 'dark' | null
        if (explicitType) {
          setDetectedBackground(explicitType)
          return
        }
      }

      // PRIORITY 2: Analyze computed styles (same as fullpage logic)
      const parseRgba = (color: string) => {
        const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/)
        if (!m) return null
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 }
      }

      if (section) {
        const st = window.getComputedStyle(section)
        const rgba = parseRgba(st.backgroundColor || '')
        const hasBgImg = st.backgroundImage && st.backgroundImage !== 'none'

        // Check for gradient/image backgrounds
        if (hasBgImg) {
          // Gradient detected - treat as dark unless proven otherwise
          setDetectedBackground('dark')
          return
        }

        // Check solid color background
        if (rgba && rgba.a > 0.1) {
          // Special case: green background (#358b4e is rgb(53, 139, 78))
          const isGreen = rgba.g > rgba.r && rgba.g > rgba.b && rgba.g > 100
          
          // Calculate brightness using standard formula
          const brightness = (rgba.r * 299 + rgba.g * 587 + rgba.b * 114) / 1000
          
          // Dark if: green background OR low brightness
          if (isGreen || brightness < 128) {
            setDetectedBackground('dark')
          } else {
            setDetectedBackground('light')
          }
          return
        }
      }

      // PRIORITY 3: Check parent elements if section has no background
      let hops = 0
      let current = el
      while (current && hops < 25) {
        const st = window.getComputedStyle(current)
        const rgba = parseRgba(st.backgroundColor || '')
        const hasBgImg = st.backgroundImage && st.backgroundImage !== 'none'

        if (hasBgImg) {
          setDetectedBackground('dark')
          return
        }

        if (rgba && rgba.a > 0.1) {
          const isGreen = rgba.g > rgba.r && rgba.g > rgba.b && rgba.g > 100
          const brightness = (rgba.r * 299 + rgba.g * 587 + rgba.b * 114) / 1000
          
          if (isGreen || brightness < 128) {
            setDetectedBackground('dark')
          } else {
            setDetectedBackground('light')
          }
          return
        }
        
        current = current.parentElement
        hops++
      }

      // PRIORITY 4: Default to light (safest fallback)
      setDetectedBackground('light')
    }

    const handleScroll = () => {
      if (totalSections > 0) return
      if (ticking.current) return
      ticking.current = true
      rafId.current = window.requestAnimationFrame(() => {
        ticking.current = false
        const y = window.scrollY || window.pageYOffset
        // Hysteresis: avoid flicker around threshold
        const showThreshold = 200
        const hideThreshold = 120
        setIsVisible(prev => (prev ? y > hideThreshold : y > showThreshold))
        detectBackgroundColor()
      })
    }
    
    // Show button if we're on a fullpage scroll page and not on first section OR in footer zone
    if (totalSections > 0 && (currentSection > 0 || isInFooterZone)) {
      setIsVisible(true)
    } else if (totalSections === 0) {
      // Regular scroll page
      handleScroll()
      window.addEventListener('scroll', handleScroll, { passive: true })
      const handleResize = () => detectBackgroundColor()
      window.addEventListener('resize', handleResize as any, { passive: true } as any)
      return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize as any)
        if (rafId.current) cancelAnimationFrame(rafId.current)
      }
    } else {
      setIsVisible(false)
    }
  }, [currentSection, totalSections, isInFooterZone])

  // Color palette now derives purely from explicit backgroundType via context
  // For non-fullpage pages, use detected background
  // If forceWhite is true, override to use white styling
  const activeBackgroundType = forceWhite ? 'dark' : (totalSections > 0 ? backgroundType : detectedBackground)

  const scrollToTop = () => {
    // If on fullpage scroll page, trigger scroll to top which will handle section navigation
    if (totalSections > 0) {
      // Reset scroll position to trigger fullpage scroll to section 0
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Dispatch a custom event to notify FullpageScroll to go to section 0
      window.dispatchEvent(new CustomEvent('scrollToSection', { detail: { section: 0 } }))
    } else {
      // Normal scroll page - scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Không hiển thị trên portrait (đã có PortraitMoveTopButton riêng)
  if (isPortrait) return null

  // Trên landscape: Force màu trắng cho cả scroll và movetop
  const paletteBorder = 'border-white/70 hover:border-white'
  const paletteIcon = 'text-white/80 group-hover:text-white'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className={`
            fixed right-8
            w-7 h-10
            flex items-center justify-center
            border-2 ${paletteBorder}
            bg-white/5 backdrop-blur-sm
            rounded-full
            transition-all duration-300
            group
            z-[90]
          `}
          style={{ bottom: 'calc(2rem + 40px + 0.75rem)' }}
          aria-label="Quay về đầu trang"
        >
          <ArrowUp className={`w-4 h-4 ${paletteIcon} transition-colors duration-300`} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
