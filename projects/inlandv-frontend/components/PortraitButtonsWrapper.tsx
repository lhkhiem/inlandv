'use client'

import { useState, useEffect } from 'react'
import { useFullpage } from '@/components/FullpageContext'
import CallButton from './CallButton'
import PortraitMoveTopButton from './PortraitMoveTopButton'

/**
 * Wrapper component để tự động thêm CallButton và PortraitMoveTopButton
 * cho các trang normal scroll (không dùng FullpageScroll)
 * 
 * Chỉ render khi:
 * - Trang không dùng FullpageScroll (totalSections === 0)
 * - Trên portrait mode
 */
export default function PortraitButtonsWrapper() {
  const { totalSections } = useFullpage()
  const [isPortrait, setIsPortrait] = useState(false)
  const [scrollY, setScrollY] = useState(0)

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Chỉ render cho normal scroll pages (không dùng FullpageScroll)
  // FullpageScroll đã tự render 2 nút này rồi
  if (totalSections > 0) return null

  // Chỉ render trên portrait
  if (!isPortrait) return null

  // CallButton hiển thị khi đã scroll xuống một chút
  const showCallButton = scrollY > 100

  return (
    <>
      <CallButton isVisible={showCallButton} />
      {/* PortraitMoveTopButton cho normal scroll - hiển thị khi scroll > 100px */}
      {scrollY > 100 && <PortraitMoveTopButton />}
    </>
  )
}

