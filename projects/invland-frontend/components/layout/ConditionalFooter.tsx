'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Footer from './Footer'

// Danh sách các trang sử dụng full-page-scroll (ẩn footer ở landscape)
const FULLPAGE_SCROLL_PAGES = [
  '/',
  '/gioi-thieu',
  '/dich-vu',
  '/lien-he',
  '/chinh-sach-nhan-su',
  '/case-studies'
]

export default function ConditionalFooter() {
  const pathname = usePathname()
  const [isPortrait, setIsPortrait] = useState(false)
  
  // Kiểm tra orientation
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
  
  // Ở portrait/mobile: luôn hiển thị footer ở mọi trang
  if (isPortrait) {
    return <Footer />
  }
  
  // Ở landscape: ẩn footer trên các trang full-page-scroll
  const isFullpageScrollPage = FULLPAGE_SCROLL_PAGES.includes(pathname)
  
  if (isFullpageScrollPage) {
    return null
  }
  
  return <Footer />
}

