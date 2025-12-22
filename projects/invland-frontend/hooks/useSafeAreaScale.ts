'use client'

import { useState, useEffect } from 'react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'

/**
 * Calculate scale factor for content based on safe area
 * Ensures content center stays centered and scales proportionally
 * 
 * @param referenceWidth - Reference viewport width (default: 1920px FullHD)
 * @param minScale - Minimum scale factor (default: 0.7)
 * @param maxScale - Maximum scale factor (default: 1.0)
 */
export function useSafeAreaScale(
  referenceWidth: number = 1920,
  minScale: number = 0.7,
  maxScale: number = 1.0
) {
  const { safeAreaLeft, safeAreaRight, timelineWidth } = useLayoutMeasurements()
  const [scale, setScale] = useState(1)
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateScale = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const isPortraitMode = viewportHeight > viewportWidth
      setIsPortrait(isPortraitMode)

      // Only scale in landscape mode
      if (isPortraitMode) {
        setScale(1)
        return
      }

      // Calculate available width for content
      const currentAvailableWidth = viewportWidth - safeAreaLeft - safeAreaRight

      // Calculate reference available width (at FullHD 1920px)
      // At FullHD: timelineRightPadding = 40, timelineWidth = actual width, safeRight = 40 + width + 20
      const referenceTimelineRightPadding = 40
      const referenceTimelineWidth = timelineWidth // Use actual timeline width
      const referenceSafeRight = referenceTimelineRightPadding + referenceTimelineWidth + 20
      const referenceSafeLeft = 10
      const referenceAvailableWidth = referenceWidth - referenceSafeLeft - referenceSafeRight

      // Calculate scale factor
      // Scale = current available / reference available
      const scaleFactor = referenceAvailableWidth > 0 
        ? currentAvailableWidth / referenceAvailableWidth 
        : 1

      // Clamp scale
      const clampedScale = Math.max(minScale, Math.min(maxScale, scaleFactor))
      setScale(clampedScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    window.addEventListener('orientationchange', updateScale)

    return () => {
      window.removeEventListener('resize', updateScale)
      window.removeEventListener('orientationchange', updateScale)
    }
  }, [safeAreaLeft, safeAreaRight, timelineWidth, referenceWidth, minScale, maxScale])

  return {
    scale,
    isPortrait,
  }
}

