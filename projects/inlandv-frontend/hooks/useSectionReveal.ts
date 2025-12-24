'use client'

import { useEffect, useState } from 'react'
import { useFullpage } from '@/components/FullpageContext'

/**
 * Hook to force reveal section content when navigating directly.
 * Solves blank screen issue with direct navigation (hash or query params).
 * 
 * Strategy:
 * 1. Pre-reveal on mount to avoid flash
 * 2. Confirm reveal when section becomes active
 * 3. Stay revealed once shown
 * 
 * @param sectionIndex - The index of this section in the fullpage sections array
 * @returns revealed - Boolean indicating if section should be visible
 */
export function useSectionReveal(sectionIndex: number) {
  const { currentSection } = useFullpage()
  // Start revealed to prevent blank flash on direct navigation
  const [revealed, setRevealed] = useState(true)

  useEffect(() => {
    // Keep revealed if this is the current section
    if (currentSection === sectionIndex) {
      setRevealed(true)
    }
  }, [currentSection, sectionIndex])

  return revealed
}
