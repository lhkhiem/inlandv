'use client'

import React, { useState, useRef, useEffect } from 'react'
import type { SectionData } from './FullpageScroll'
import type { BackgroundType } from './FullpageContext'
import { useLayoutMeasurements } from './LayoutMeasurementsContext'

interface TimelineNavProps {
  sections: SectionData[]
  activeSection: number
  onSectionClick: (index: number) => void
  backgroundType: BackgroundType
}

export default function TimelineNav({ sections, activeSection, onSectionClick, backgroundType }: TimelineNavProps) {
  const navRef = useRef<HTMLDivElement>(null)
  const { setTimelineWidth } = useLayoutMeasurements()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Color palette: green when active/hover, green with opacity when inactive
  const ACTIVE_COLOR = '#2E8C4F' // Green for active
  const HOVER_COLOR = '#2E8C4F' // Green for hover
  const INACTIVE_COLOR = 'rgba(46, 140, 79, 0.4)' // Green with low opacity for inactive
  const DOT_ACTIVE_COLOR = '#2E8C4F' // Green dot for active
  const DOT_HOVER_COLOR = '#2E8C4F' // Green dot for hover
  const DOT_INACTIVE_COLOR = 'rgba(46, 140, 79, 0.4)' // Green dot with low opacity for inactive
  const LINE_COLOR = 'rgba(46, 140, 79, 0.2)' // Light green line

  // Measure timeline width
  useEffect(() => {
    const measureTimeline = () => {
      if (navRef.current) {
        // Check if timeline is visible (hidden on mobile with md:block)
        const isVisible = window.getComputedStyle(navRef.current).display !== 'none'
        const width = isVisible ? navRef.current.offsetWidth : 0
        setTimelineWidth(width)
      }
    }

    measureTimeline()
    window.addEventListener('resize', measureTimeline)
    return () => window.removeEventListener('resize', measureTimeline)
  }, [setTimelineWidth])

  return (
    <nav
      ref={navRef} 
      className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-[90] hidden md:block pointer-events-auto"
      aria-label="Section navigation"
    >
      <div className="relative flex flex-col items-end gap-4">
        {/* Vertical line - positioned to pass through center of dots */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[1px]"
          style={{
            backgroundColor: LINE_COLOR,
          }}
        />

        {sections.map((section, index) => {
          const isActive = index === activeSection
          const isHovered = hoveredIndex === index
          const textColor = isActive || isHovered ? ACTIVE_COLOR : INACTIVE_COLOR
          const dotColor = isActive || isHovered ? DOT_ACTIVE_COLOR : DOT_INACTIVE_COLOR
          const dotSizeNum = isActive || isHovered ? 10 : 8
          const dotSize = `${dotSizeNum}px`

          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative flex items-center gap-3 group pr-0"
              aria-label={`Go to ${section.title}`}
              aria-current={isActive ? 'true' : 'false'}
            >
              {/* Text label - on the left */}
              <span
                className="text-xs md:text-sm font-heading font-semibold tracking-wide transition-colors duration-300 text-right whitespace-nowrap"
                style={{
                  color: textColor
                }}
              >
                {section.title}
              </span>

              {/* Circular dot - on the right, center aligned with vertical line */}
              <div
                className="rounded-full transition-all duration-300 z-10 flex-shrink-0"
                style={{
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: dotColor,
                  border: isActive || isHovered ? `2px solid ${dotColor}` : `2px solid ${DOT_INACTIVE_COLOR}`,
                  boxShadow: isActive || isHovered ? `0 0 8px ${dotColor}40` : 'none',
                  // Center the dot on the vertical line: dot center at right-0
                  marginRight: `-${dotSizeNum / 2}px`,
                }}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
