'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronDown, Menu } from 'lucide-react'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import BurgerMenu from '@/components/layout/BurgerMenu'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useFullpage } from '@/components/FullpageContext'
import { navigationTree, type NavItem } from '@/components/layout/navigationData'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const [isBurgerOpen, setIsBurgerOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { setHeaderHeight } = useLayoutMeasurements()
  const { backgroundType } = useFullpage()

  // Check orientation
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

  // Check if current page is BDS list page (always light background)
  const isProductListPage = pathname === '/bat-dong-san'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Measure header height for layout system
  useEffect(() => {
    const measureHeader = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight
        setHeaderHeight(height)
      }
    }

    measureHeader()
    window.addEventListener('resize', measureHeader)
    return () => window.removeEventListener('resize', measureHeader)
  }, [setHeaderHeight])

  // Color mode: Always light background with black text
  const isLight = true
  const textClass = 'text-[#2E8C4F]'
  // Inactive links: lighter green text, darker green on hover
  const inactiveLink = 'text-[#2E8C4F]/70 hover:text-[#2E8C4F]'
  const activeLink = 'text-[#2E8C4F]'

  // Desktop navigation tree (exclude Trang chủ vì đã dùng cho logo)
  const mainItems: NavItem[] = navigationTree.filter(
    (item) => item.title !== 'Trang chủ'
  )

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [openChildIndex, setOpenChildIndex] = useState<{ parentIndex: number; childIndex: number } | null>(null)

  const handleMouseLeave = () => {
    setOpenIndex(null)
    setOpenChildIndex(null)
  }

  return (
    <motion.header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-sm transition-colors duration-300 ${
        isScrolled ? 'bg-white/95 shadow-sm' : 'bg-white/95'
      }`}
    >
      <div
        className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between"
        onMouseLeave={handleMouseLeave}
      >
        {/* Portrait: Burger menu bên trái, Logo giữa */}
        {isPortrait ? (
          <>
            {/* Burger Menu Button - Left (màu xanh) */}
            <button
              onClick={() => setIsBurgerOpen(true)}
              className="md:hidden p-2 text-[#2E8C4F] hover:text-[#2b6f3e] transition-colors"
              aria-label="Mở menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo - Center */}
            <Link href="/" className="flex items-center gap-3 shrink-0 absolute left-1/2 -translate-x-1/2">
              <img
                src="/logo-1.png"
                alt="INLANDV Logo"
                className="h-10 w-auto"
              />
            </Link>

            {/* Language Switcher - Right (màu xanh) */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher
                scrolled={isScrolled}
                backgroundType={isLight ? 'light' : backgroundType}
              />
            </div>
          </>
        ) : (
          /* Landscape: Logo bên trái (giữ nguyên) */
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo-1.png"
              alt="INLANDV Logo"
              className="h-10 w-auto"
            />
          </Link>
        )}

        {/* Burger Menu Component */}
        <BurgerMenu open={isBurgerOpen} onClose={() => setIsBurgerOpen(false)} />

        {/* Nav giữa */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium relative">
          {mainItems.map((item, index) => {
            // Get current URL with query params for exact matching
            const currentFullPath = pathname + (typeof window !== 'undefined' ? window.location.search : '')
            const currentPath = pathname.split('?')[0].trim()
            const hasQueryParams = typeof window !== 'undefined' && window.location.search !== ''
            let isActive = false
            
            // If on home page with no query params, no menu item should be active
            if ((currentPath === '/' || currentPath === '') && !hasQueryParams) {
              isActive = false
            } else if (item.href) {
              // Exact match for main item (path only, no query params)
              const itemPath = item.href.split('?')[0].trim()
              // Don't mark as active if item href is home page
              if (itemPath !== '/' && itemPath !== '') {
              isActive = currentPath === itemPath && currentPath !== '' && itemPath !== ''
              }
            }
            
            // Check if any child or grandchild is active (exact match with query params)
            // Only check children if not on home page without query params
            if (!((currentPath === '/' || currentPath === '') && !hasQueryParams) && item.children) {
              for (const child of item.children) {
                if (child.href) {
                  const childPath = child.href.split('?')[0].trim()
                  // If child href is home page, only match if full path with query params matches
                  if (childPath === '/' || childPath === '') {
                    if (currentFullPath === child.href) {
                      isActive = true
                      break
                    }
                  } else {
                    // For other paths, match path or full path with query params
                    if (currentFullPath === child.href || currentPath === childPath) {
                    isActive = true // Main menu should be active if any child is active
                    break
                    }
                  }
                }
                // Check grandchildren (exact match with query params)
                if (child.children) {
                  for (const grandchild of child.children) {
                    if (grandchild.href) {
                      // Exact match for grandchild (must match full path with query params)
                      if (currentFullPath === grandchild.href) {
                        isActive = true
                        break
                      }
                    }
                  }
                }
              }
            }
            
            const hasChildren = item.children && item.children.length > 0
            const isOpen = openIndex === index

            return (
              <div
                key={item.title}
                className="relative"
                onMouseEnter={() => hasChildren && setOpenIndex(index)}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 transition-colors hover:text-[#2E8C4F] ${
                      isActive 
                        ? 'text-[#2E8C4F]' // Always blue when active
                        : inactiveLink
                    }`}
                  >
                    <span>{item.title}</span>
                    {hasChildren && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        } ${isActive ? 'text-[#2E8C4F]' : ''}`}
                      />
                    )}
                  </Link>
                ) : (
                  <div
                    className={`flex items-center gap-1 cursor-default transition-colors hover:text-[#2E8C4F] ${
                      isActive 
                        ? 'text-[#2E8C4F]' // Always blue when active
                        : inactiveLink
                    }`}
                  >
                    <span>{item.title}</span>
                    {hasChildren && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        } ${isActive ? 'text-[#2E8C4F]' : ''}`}
                      />
                    )}
                  </div>
                )}

                {/* Dropdown for children */}
                {hasChildren && isOpen && (
                  <div className="absolute left-0 mt-3 min-w-[260px] rounded-xl bg-white border border-gray-200 shadow-xl py-3">
                    <ul className="space-y-1">
                      {item.children!.map((child) => {
                        // Check if any grandchild is active first (exact match with query params)
                        let hasActiveGrandchild = false
                        if (child.children) {
                          for (const g of child.children) {
                            if (g.href) {
                              // Exact match for grandchild (including query params)
                              if (currentFullPath === g.href) {
                                hasActiveGrandchild = true
                                break
                              }
                            }
                          }
                        }
                        
                        // Check if child is active (exact match with query params)
                        // Only active if no grandchild is active
                        const isChildActive = !hasActiveGrandchild && child.href && (
                          currentFullPath === child.href || 
                          (currentPath === child.href.split('?')[0].trim() && !child.href.includes('?'))
                        )
                        
                        // Child should be active only if it's directly active, not if grandchild is active
                        const shouldHighlightChild = isChildActive
                        
                        const hasGrandchildren = child.children && child.children.length > 0
                        const isChildOpen = openChildIndex?.parentIndex === index && openChildIndex?.childIndex === item.children!.indexOf(child)
                        
                        return (
                          <li key={child.title} className="px-4 relative">
                            {child.href ? (
                              <Link
                                href={child.href}
                                className={`block py-1.5 text-sm rounded-md transition-colors hover:text-[#2E8C4F] ${
                                  shouldHighlightChild
                                    ? 'text-[#2E8C4F]'
                                    : 'text-[#2E8C4F] hover:bg-gray-50'
                                }`}
                              >
                                {child.title}
                              </Link>
                            ) : hasGrandchildren ? (
                              <div 
                                onClick={() => {
                                  const childIdx = item.children!.indexOf(child)
                                  if (isChildOpen) {
                                    setOpenChildIndex(null)
                                  } else {
                                    setOpenChildIndex({ parentIndex: index, childIndex: childIdx })
                                  }
                                }}
                                className={`py-1.5 text-sm font-semibold cursor-pointer transition-colors hover:text-[#2E8C4F] ${
                                  shouldHighlightChild ? 'text-[#2E8C4F]' : 'text-[#2E8C4F]'
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  <span>{child.title}</span>
                                  {hasGrandchildren && (
                                    <ChevronDown
                                      className={`w-3 h-3 transition-transform ${
                                        isChildOpen ? 'rotate-180' : ''
                                      }`}
                                    />
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className={`py-1.5 text-sm font-semibold transition-colors hover:text-[#2E8C4F] ${
                                shouldHighlightChild ? 'text-[#2E8C4F]' : 'text-[#2E8C4F]'
                              }`}
                              >
                                {child.title}
                              </div>
                            )}

                            {/* Grand-children - chỉ show khi click vào sub 1 */}
                            {hasGrandchildren && isChildOpen && (
                              <ul className="mt-1 mb-1 ml-3 border-l border-gray-200 pl-3 space-y-1">
                                {child.children!.map((g) => {
                                  // Exact match for grandchild (must match full path with query params)
                                  const isGrandchildActive = g.href && currentFullPath === g.href
                                  
                                  return (
                                    <li key={g.title}>
                                      {g.href ? (
                                        <Link
                                          href={g.href}
                                          className={`block py-1 text-xs rounded-md transition-colors hover:text-[#2E8C4F] hover:bg-gray-50 ${
                                            isGrandchildActive
                                              ? 'text-[#2E8C4F]'
                                              : 'text-[#2E8C4F]'
                                          }`}
                                        >
                                          {g.title}
                                        </Link>
                                      ) : (
                                        <span className={`block py-1 text-xs transition-colors hover:text-[#2E8C4F] ${
                                          isGrandchildActive ? 'text-[#2E8C4F]' : 'text-[#2E8C4F]'
                                        }`}
                                        >
                                          {g.title}
                                        </span>
                                      )}

                                  {g.children && g.children.length > 0 && (
                                    <ul className="mt-1 ml-3 border-l border-gray-200 pl-3 space-y-1">
                                      {g.children.map((gg) => {
                                        // Exact match (including query params)
                                        const isGGActive = gg.href && (
                                          currentFullPath === gg.href || 
                                          currentPath === gg.href.split('?')[0].trim()
                                        )
                                        
                                        return (
                                          <li key={gg.title}>
                                            {gg.href ? (
                                              <Link
                                                href={gg.href}
                                                className={`block py-1 text-[11px] rounded-md transition-colors hover:text-[#2E8C4F] hover:bg-gray-50 ${
                                                  isGGActive
                                                    ? 'text-[#2E8C4F] bg-gray-100'
                                                    : 'text-[#2E8C4F]'
                                                }`}
                                              >
                                                {gg.title}
                                              </Link>
                                            ) : (
                                              <span className={`block py-1 text-[11px] transition-colors hover:text-[#2E8C4F] ${
                                                isGGActive ? 'text-[#2E8C4F]' : 'text-[#2E8C4F]'
                                              }`}
                                              >
                                                {gg.title}
                                              </span>
                                            )}
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  )}
                                </li>
                                  )
                                })}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Ngôn ngữ bên phải - Ẩn trên portrait mobile */}
        <div className={`flex items-center gap-4 ${isPortrait ? 'hidden' : ''}`}>
          <LanguageSwitcher
            scrolled={isScrolled}
            backgroundType={isLight ? 'light' : backgroundType}
          />
        </div>
      </div>
    </motion.header>
  )
}
