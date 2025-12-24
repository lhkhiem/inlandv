
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MouseScrollIcon from './MouseScrollIcon'
import CallButton from './CallButton'
import PortraitMoveTopButton from './PortraitMoveTopButton'
import TimelineNav from '@/components/TimelineNav'
import { useFullpage, useFullpageInternal, BackgroundType } from '@/components/FullpageContext'

export interface SectionData {
  id: string
  index: number
  title: string
  backgroundType?: BackgroundType
}

interface FullpageScrollProps {
  children: React.ReactNode[]
  sections: SectionData[]
  showIndicators?: boolean
  debug?: boolean
}

/**
 * TRANSFORM-BASED FULLPAGE SCROLL ENGINE
 * 
 * Architecture:
 * - Uses transform: translateY(-index * 100vh) for precise positioning
 * - Blocks all scroll events during animation
 * - Enforces integer section indexes (no partial states)
 * - Prevents bleeding via strict wrapper containment
 */
export default function FullpageScroll({ 
  children, 
  sections,
  showIndicators = true,
  debug = false
}: FullpageScrollProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isInFooterZone, setIsInFooterZone] = useState(false)
  const [activeBackgroundType, setActiveBackgroundType] = useState<BackgroundType>('light')
  const [isPortrait, setIsPortrait] = useState(false)
  const { setBackgroundType } = useFullpage()
  const { setCurrentSection: setContextSection, setTotalSections: setContextTotal, setIsInFooterZone: setContextFooterZone } = useFullpageInternal()
  const touchStartY = useRef<number>(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout>()
  
  const totalSections = children.length
  const isAtLastSection = currentSection === totalSections - 1

  // Check orientation (portrait vs landscape)
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

  // Debug logging
  useEffect(() => {
    console.log('=== FULLPAGE SCROLL INITIALIZED ===')
    console.log('totalSections:', totalSections)
    console.log('sections.length:', sections.length)
    console.log('children:', React.Children.toArray(children).length)
    console.log('sections:', sections)
  }, [totalSections, sections, children])

  // Add fullpage-active class on mount, remove on unmount
  // Only lock scroll on landscape orientation
  useEffect(() => {
    if (!isPortrait) {
    document.body.classList.add('fullpage-active')
    } else {
      document.body.classList.remove('fullpage-active')
    }
    
    return () => {
      document.body.classList.remove('fullpage-active')
      document.body.classList.remove('footer-zone-active')
    }
  }, [isPortrait])

  // Sync with context
  useEffect(() => {
    setContextSection(currentSection)
  }, [currentSection, setContextSection])

  useEffect(() => {
    setContextTotal(totalSections)
  }, [totalSections, setContextTotal])

  useEffect(() => {
    setContextFooterZone(isInFooterZone)
    
    // Toggle body class for footer zone
    if (isInFooterZone) {
      document.body.classList.add('footer-zone-active')
    } else {
      document.body.classList.remove('footer-zone-active')
    }
  }, [isInFooterZone, setContextFooterZone])

  // Debug logging
  const log = useCallback((...args: any[]) => {
    if (debug) {
      console.log('[FullpageScroll]', ...args)
    }
  }, [debug])

  // Update background type
  useEffect(() => {
    const fromSections = sections[currentSection]?.backgroundType
    if (fromSections) {
      setActiveBackgroundType(fromSections)
      setBackgroundType(fromSections)
    } else {
      setActiveBackgroundType('light')
      setBackgroundType('light')
    }
  }, [currentSection, sections, setBackgroundType])

  // Scroll to section with EXACT transform (landscape) or scrollIntoView (portrait)
  const scrollToSection = useCallback((index: number) => {
    // Validate bounds
    if (index < 0 || index >= totalSections) {
      log('Scroll blocked: out of bounds', { index, totalSections })
      return
    }

    // Block if animating (landscape only)
    if (isAnimating && !isPortrait) {
      log('Scroll blocked: animation in progress')
      return
    }

    log('Scrolling to section:', index, { isPortrait })
    
    // In portrait mode, use native scrollIntoView
    if (isPortrait) {
      const sectionElement = document.getElementById(sections[index]?.id || `section-${index}`)
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setCurrentSection(index)
      }
      return
    }

    // Landscape mode: use transform-based scroll
    // Set animating state
    setIsAnimating(true)
    setCurrentSection(index)

    // Clear previous timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Unlock after animation completes (800ms)
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
      log('Animation complete, unlocked')
    }, 800)
  }, [totalSections, isAnimating, isPortrait, sections, log])

  // Listen for custom scrollToSection events (from BackToTopButton and HashNavigationHandler)
  useEffect(() => {
    const handleScrollToSection = (e: CustomEvent) => {
      const targetSection = e.detail?.section
      if (typeof targetSection === 'number') {
        // Footer zone logic removed - footer is hidden on fullpage scroll pages
        scrollToSection(targetSection)
      }
    }

    window.addEventListener('scrollToSection', handleScrollToSection as EventListener)
    return () => window.removeEventListener('scrollToSection', handleScrollToSection as EventListener)
  }, [isInFooterZone, scrollToSection])

  // Handle wheel events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // On portrait orientation, allow normal scroll
      if (isPortrait) {
        return // Don't prevent default, allow natural scrolling
      }

      // Block if animating
      if (isAnimating) {
        log('Wheel blocked: animating')
        e.preventDefault()
        return
      }

      // Block scroll down from last section (footer is hidden on fullpage scroll pages)
      if (isAtLastSection && e.deltaY > 0) {
        log('At last section, blocking scroll down')
        e.preventDefault()
        return
      }

      // Normal fullpage scroll (landscape only)
      e.preventDefault()
      if (Math.abs(e.deltaY) < 5) return

      if (e.deltaY > 0) {
        scrollToSection(currentSection + 1)
      } else {
        scrollToSection(currentSection - 1)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentSection, isAnimating, isAtLastSection, isInFooterZone, scrollToSection, totalSections, log, isPortrait])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return

      // Footer zone logic removed - footer is hidden on fullpage scroll pages

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          // Block scroll down from last section (footer is hidden on fullpage scroll pages)
          if (isAtLastSection) {
            return
          }
          scrollToSection(currentSection + 1)
          break
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          scrollToSection(currentSection - 1)
          break
        case 'Home':
          e.preventDefault()
          scrollToSection(0)
          break
        case 'End':
          e.preventDefault()
          scrollToSection(totalSections - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSection, isAnimating, isAtLastSection, isInFooterZone, scrollToSection, totalSections])

  // Handle touch events
  useEffect(() => {
    // On portrait orientation, allow normal touch scroll
    if (isPortrait) {
      return
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating) return

      const touchEndY = e.changedTouches[0].clientY
      const deltaY = touchStartY.current - touchEndY

      if (Math.abs(deltaY) > 50) {
        // Block scroll down from last section (footer is hidden on fullpage scroll pages)
        if (isAtLastSection && deltaY > 0) {
          return
        }

        // Normal fullpage scroll (landscape only)
        if (deltaY > 0) {
          scrollToSection(currentSection + 1)
        } else {
          scrollToSection(currentSection - 1)
        }
      }
    }

    const wrapper = wrapperRef.current
    if (wrapper) {
      wrapper.addEventListener('touchstart', handleTouchStart, { passive: true })
      wrapper.addEventListener('touchend', handleTouchEnd, { passive: true })
      return () => {
        wrapper.removeEventListener('touchstart', handleTouchStart)
        wrapper.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [currentSection, isAnimating, isAtLastSection, isInFooterZone, scrollToSection, totalSections, isPortrait])

  // Calculate exact transform - only apply on landscape
  const transformY = isPortrait ? 'none' : `translateY(-${currentSection * 100}vh)`

  return (
    <div 
      className="fullpage-scroll-container"
      style={{
        position: 'relative',
        overflow: isPortrait ? 'visible' : 'hidden',
        touchAction: isPortrait ? 'auto' : 'none',
        height: isPortrait ? 'auto' : '100vh',
        minHeight: isPortrait ? 'auto' : '100vh',
        width: '100%',
        // Ensure natural document flow in portrait
        ...(isPortrait && {
          display: 'block'
        })
      }}
    >
      {/* Timeline Navigation - Include all sections including hero */}
      {showIndicators && (
        <TimelineNav
          sections={sections}
          activeSection={currentSection}
          onSectionClick={(timelineIndex) => scrollToSection(timelineIndex)}
          backgroundType={activeBackgroundType}
        />
      )}

      {/* Sections Wrapper - TRANSFORM-BASED */}
      <div
        ref={wrapperRef}
        className="fullpage-sections-wrapper"
        style={{
          transform: transformY,
          transition: isAnimating && !isPortrait ? 'transform 800ms cubic-bezier(0.65, 0, 0.35, 1)' : 'none',
          willChange: isPortrait ? 'auto' : 'transform',
          position: 'relative',
          height: isPortrait ? 'auto' : `${totalSections * 100}vh`,
          width: '100%',
          // Ensure natural vertical stacking in portrait
          ...(isPortrait && {
            display: 'flex',
            flexDirection: 'column'
          })
        }}
      >
        {children.map((child, index) => {
          const anchorId = sections[index]?.id || `section-${index}`
          return (
            <div
              key={index}
              id={anchorId}
              data-index={index}
              className="fullpage-section-container"
              style={{
                height: isPortrait ? 'auto' : '100vh',
                minHeight: isPortrait ? undefined : '100vh',
                width: '100%',
                position: isPortrait ? 'relative' : 'absolute',
                top: isPortrait ? 'auto' : `${index * 100}vh`,
                left: 0,
                overflow: isPortrait ? 'visible' : 'hidden',
                margin: 0,
                padding: 0,
                // Ensure sections stack naturally in portrait without overlap
                ...(isPortrait && {
                  display: 'block',
                  clear: 'both',
                  isolation: 'isolate' // Create new stacking context to prevent overlap
                })
              }}
              role="region"
              aria-label={sections[index]?.title || `Section ${index + 1}`}
            >
              {child}
            </div>
          )
        })}
      </div>

      {/* Call Button - Only visible on portrait */}
      <CallButton 
        isVisible={!isAtLastSection}
      />

      {/* Mouse Scroll Icon - CHỈ hiển thị trên LANDSCAPE, không ảnh hưởng portrait */}
      {!isPortrait && (
      <MouseScrollIcon 
        onClick={() => scrollToSection(currentSection + 1)}
        isVisible={!isAtLastSection}
        backgroundType={activeBackgroundType}
      />
      )}
      
      {/* Portrait Move Top Button - CHỈ hiển thị trên PORTRAIT, tách riêng component */}
      {isPortrait && <PortraitMoveTopButton />}

      {/* Scroll hint (first section only) */}
      {currentSection === 0 && !isAnimating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 1.5, 
            duration: 1, 
            repeat: Infinity, 
            repeatType: 'reverse' 
          }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 hidden md:block pointer-events-none"
        >
          <div className="flex flex-col items-center gap-2 text-white/80">
            <span className="text-sm font-medium">Scroll</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </div>
  )
}
