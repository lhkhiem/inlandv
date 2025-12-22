'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LayoutMeasurements {
  headerHeight: number
  footerHeight: number
  timelineWidth: number
  safeAreaLeft: number
  safeAreaRight: number
  setHeaderHeight: (height: number) => void
  setFooterHeight: (height: number) => void
  setTimelineWidth: (width: number) => void
  updateSafeArea: () => void
}

const LayoutMeasurementsContext = createContext<LayoutMeasurements | undefined>(undefined)

interface LayoutMeasurementsProviderProps {
  children: ReactNode
}

export function LayoutMeasurementsProvider({ children }: LayoutMeasurementsProviderProps) {
  const [headerHeight, setHeaderHeight] = useState(0)
  const [footerHeight, setFooterHeight] = useState(0)
  const [timelineWidth, setTimelineWidth] = useState(0)
  const [safeAreaLeft, setSafeAreaLeft] = useState(0)
  const [safeAreaRight, setSafeAreaRight] = useState(0)

  // Calculate safe area: d (mép màn đến mép trái text thanh timeline) + 20px
  const updateSafeArea = () => {
    if (typeof window === 'undefined') return
    
    const viewportWidth = window.innerWidth
    // Timeline right padding: right-6 (24px) on small, md:right-10 (40px) on md+
    const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
    
    // Safe area right = timeline right padding + timeline width + 20px
    // d = timelineRightPadding + timelineWidth, then add 20px
    const safeRight = timelineRightPadding + timelineWidth + 20
    
    // Safe area left = 10px from left edge
    const safeLeft = 10
    
    setSafeAreaLeft(safeLeft)
    setSafeAreaRight(safeRight)
  }

  // Update safe area when timeline width changes or on mount
  useEffect(() => {
    updateSafeArea()
  }, [timelineWidth])

  // Update safe area on resize
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => updateSafeArea()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const value: LayoutMeasurements = {
    headerHeight,
    footerHeight,
    timelineWidth,
    safeAreaLeft,
    safeAreaRight,
    setHeaderHeight,
    setFooterHeight,
    setTimelineWidth,
    updateSafeArea,
  }

  return (
    <LayoutMeasurementsContext.Provider value={value}>
      {children}
    </LayoutMeasurementsContext.Provider>
  )
}

export function useLayoutMeasurements() {
  const context = useContext(LayoutMeasurementsContext)
  if (context === undefined) {
    throw new Error('useLayoutMeasurements must be used within a LayoutMeasurementsProvider')
  }
  return context
}
