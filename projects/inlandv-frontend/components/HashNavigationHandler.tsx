'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface HashNavigationHandlerProps {
  sections: Array<{ id: string; index: number }>
}

export default function HashNavigationHandler({ sections }: HashNavigationHandlerProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Handle hash navigation on mount and hash change
    const handleHashNavigation = () => {
      const hash = window.location.hash.slice(1) // Remove '#'
      
      if (hash) {
        // Find section by id
        const section = sections.find(s => s.id === hash)
        
        if (section) {
          // Small delay to ensure FullpageScroll is mounted
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('scrollToSection', { 
              detail: { section: section.index } 
            }))
          }, 100)
        }
      }
    }

    // Run on mount
    handleHashNavigation()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation)
    
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation)
    }
  }, [pathname, sections])

  return null
}
