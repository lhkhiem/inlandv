'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface SectionNavigationHandlerProps {
  sections: Array<{ id: string; index: number }>
}

/**
 * Query-parameter based section navigation (e.g., ?section=doi-ngu)
 * More reliable than hash-based navigation for fullpage scroll.
 * Triggers navigation AFTER full mount to prevent blank screens.
 */
export default function SectionNavigationHandler({ sections }: SectionNavigationHandlerProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const sectionId = searchParams.get('section')
    
    if (sectionId) {
      const section = sections.find(s => s.id === sectionId)
      
      if (section) {
        // Wait for full mount cycle + reveal hook initialization
        // Increased delay to ensure FullpageScroll is fully mounted and ready
        const timer = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('scrollToSection', { 
            detail: { section: section.index } 
          }))
        }, 600) // Increased delay for better stability

        return () => clearTimeout(timer)
      }
    }
  }, [searchParams, sections])

  return null
}
