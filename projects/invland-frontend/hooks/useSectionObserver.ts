'use client'

import { useEffect, useState } from 'react'

export function useSectionObserver(sectionCount: number) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    // Create observer for each section
    for (let i = 0; i < sectionCount; i++) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              setActiveIndex(i)
            }
          })
        },
        {
          root: null,
          threshold: [0.5, 0.6, 0.7],
          rootMargin: '0px'
        }
      )

      const section = document.getElementById(`section-${i}`)
      if (section) {
        observer.observe(section)
        observers.push(observer)
      }
    }

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [sectionCount])

  return activeIndex
}
