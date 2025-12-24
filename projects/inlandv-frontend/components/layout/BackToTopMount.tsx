'use client'

import { useEffect, useState } from 'react'
import { useFullpage } from '@/components/FullpageContext'
import NormalScrollBackToTop from '@/components/common/NormalScrollBackToTop'
import BackToTopButton from '@/components/common/BackToTopButton'

export default function BackToTopMount() {
  const { totalSections } = useFullpage()
  const [isReady, setIsReady] = useState(false)

  // Wait for context to stabilize before rendering to avoid mount/unmount flickering
  useEffect(() => {
    console.log('📌 BackToTopMount: totalSections =', totalSections)
    // Longer delay to ensure FullpageScroll has initialized
    const timer = setTimeout(() => {
      setIsReady(true)
      console.log('📌 BackToTopMount: ready to render, totalSections =', totalSections)
    }, 200)
    return () => clearTimeout(timer)
  }, [totalSections])

  if (!isReady) {
    console.log('📌 BackToTopMount: waiting...')
    return null
  }

  // If using full-screen-scroll, render the existing fullpage-aware button
  if (totalSections > 0) {
    console.log('📌 BackToTopMount: rendering BackToTopButton (fullpage)')
    return <BackToTopButton />
  }

  // Otherwise, mount the dedicated normal-scroll movetop module
  console.log('📌 BackToTopMount: rendering NormalScrollBackToTop')
  return <NormalScrollBackToTop />
}
