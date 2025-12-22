'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

type BgType = 'light' | 'dark'

export default function NormalScrollBackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [bgType, setBgType] = useState<BgType>('light')
  const rafId = useRef<number | null>(null)
  const ticking = useRef(false)

  // Debug: log when component mounts
  useEffect(() => {
    console.log('🚀 NormalScrollBackToTop: Component mounted for normal-scroll page')
    return () => console.log('🚀 NormalScrollBackToTop: Component unmounted')
  }, [])

  useEffect(() => {
    const parseRgba = (color: string) => {
      const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/)
      if (!m) return null
      return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 }
    }

    /**
     * Detects background brightness behind the button.
     * Samples MULTIPLE points to avoid z-index issues and get accurate color.
     */
    const detectBackgroundColor = () => {
      // Sample multiple points to find the section behind the button
      // Button is at bottom-right, so sample around that area but avoid the button itself
      const buttonRight = window.innerWidth - 32 // right-8
      const buttonBottom = window.innerHeight - 32 // bottom-8
      
      // Sample points: slightly above and to the left of button
      const samplePoints = [
        { x: Math.floor(window.innerWidth / 2), y: Math.floor(window.innerHeight / 2) }, // center
        { x: buttonRight - 100, y: buttonBottom - 50 }, // left of button
        { x: buttonRight - 100, y: buttonBottom - 100 }, // above-left of button
      ]

      let el: HTMLElement | null = null
      
      // Try each sample point until we get a valid element (not the button)
      for (const point of samplePoints) {
        const candidate = document.elementFromPoint(point.x, point.y) as HTMLElement | null
        if (candidate && !candidate.closest('button[aria-label*="Quay về"]')) {
          el = candidate
          break
        }
      }

      if (!el) {
        console.log('🎯 NormalScrollBackToTop: no valid element, default = light')
        setBgType('light')
        return
      }

      // Find nearest section/footer
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
      
      // PRIORITY 1: Check explicit data-bg-type attribute
      if (section) {
        const explicitType = section.getAttribute('data-bg-type') as BgType | null
        if (explicitType) {
          console.log('🎯 NormalScrollBackToTop: explicit data-bg-type =', explicitType, 'on', section.className)
          setBgType(explicitType)
          return
        }
      }

      // PRIORITY 2: Analyze section computed styles (same as fullpage)
      if (section) {
        const st = window.getComputedStyle(section)
        const rgba = parseRgba(st.backgroundColor || '')
        const hasBgImg = st.backgroundImage && st.backgroundImage !== 'none'

        // Check for gradient/image backgrounds
        if (hasBgImg) {
          // Gradient/image detected - treat as dark
          console.log('🎯 NormalScrollBackToTop: image/gradient on', section.className, '→ dark')
          setBgType('dark')
          return
        }

        // Check solid color background
        if (rgba && rgba.a > 0.1) {
          // Special case: green brand color (#358b4e = rgb(53, 139, 78))
          const isGreen = rgba.g > rgba.r && rgba.g > rgba.b && rgba.g > 100
          
          // Calculate brightness using standard formula
          const brightness = (rgba.r * 299 + rgba.g * 587 + rgba.b * 114) / 1000
          
          // Threshold: < 128 = dark → white button
          //            ≥ 128 = light → green button
          // Green brand is treated as dark
          const detectedType = (isGreen || brightness < 128) ? 'dark' : 'light'
          console.log('🎯 NormalScrollBackToTop: solid on', section.className, 'brightness =', Math.round(brightness), 'isGreen =', isGreen, '→', detectedType)
          setBgType(detectedType)
          return
        }
      }

      // PRIORITY 3: Check parent elements if section has no background
      let hops = 0
      let current = el as HTMLElement | null
      while (current && hops < 25) {
        const st = window.getComputedStyle(current)
        const rgba = parseRgba(st.backgroundColor || '')
        const hasBgImg = st.backgroundImage && st.backgroundImage !== 'none'

        if (hasBgImg) {
          console.log('🎯 NormalScrollBackToTop: parent image on', current.tagName, '→ dark')
          setBgType('dark')
          return
        }

        if (rgba && rgba.a > 0.1) {
          const isGreen = rgba.g > rgba.r && rgba.g > rgba.b && rgba.g > 100
          const brightness = (rgba.r * 299 + rgba.g * 587 + rgba.b * 114) / 1000
          const detectedType = (isGreen || brightness < 128) ? 'dark' : 'light'
          console.log('🎯 NormalScrollBackToTop: parent on', current.tagName, 'brightness =', Math.round(brightness), '→', detectedType)
          setBgType(detectedType)
          return
        }

        current = current.parentElement as HTMLElement | null
        hops++
      }

      // PRIORITY 4: Default to light
      console.log('🎯 NormalScrollBackToTop: no background found, default = light')
      setBgType('light')
    }

    const handleScroll = () => {
      if (ticking.current) return
      ticking.current = true
      rafId.current = window.requestAnimationFrame(() => {
        ticking.current = false
        const y = window.scrollY || window.pageYOffset
        const showThreshold = 200
        const hideThreshold = 120
        const shouldShow = y > (isVisible ? hideThreshold : showThreshold)
        
        console.log('🎯 NormalScrollBackToTop: scroll check, scrollY =', y, 'current isVisible =', isVisible, 'shouldShow =', shouldShow)
        
        if (shouldShow !== isVisible) {
          console.log('🎯 NormalScrollBackToTop: ✅ visibility CHANGED → ', shouldShow ? 'SHOW' : 'HIDE')
        }
        
        setIsVisible(shouldShow)
        detectBackgroundColor()
      })
    }

    console.log('🔧 NormalScrollBackToTop: Setting up scroll listener')
    
    // Initial check on mount - delay slightly to ensure DOM is ready
    setTimeout(() => {
      console.log('🔧 NormalScrollBackToTop: Running initial handleScroll()')
      handleScroll()
    }, 100)
    
    // Attach scroll listener for normal scroll pages
    window.addEventListener('scroll', handleScroll, { passive: true })
    const handleResize = () => detectBackgroundColor()
    window.addEventListener('resize', handleResize as any, { passive: true } as any)

    return () => {
      console.log('🔧 NormalScrollBackToTop: Cleaning up listeners')
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize as any)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isLight = bgType === 'light'
  const paletteBorder = isLight ? 'border-[#358b4e]/70 hover:border-[#2b6f3e]' : 'border-white/70 hover:border-white'
  const paletteIcon = isLight ? 'text-[#358b4e]/80 group-hover:text-[#358b4e]' : 'text-white/80 group-hover:text-white'

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
            fixed bottom-8 right-8
            w-7 h-10
            flex items-center justify-center
            border-2 ${paletteBorder}
            bg-white/5 backdrop-blur-sm
            rounded-full
            group
            z-[90]
          `}
          style={{
            transition: 'border-color 0.4s ease, background-color 0.4s ease'
          }}
          aria-label="Quay về đầu trang"
        >
          <ArrowUp 
            className={`w-4 h-4 ${paletteIcon}`} 
            strokeWidth={2.5}
            style={{
              transition: 'color 0.4s ease'
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
