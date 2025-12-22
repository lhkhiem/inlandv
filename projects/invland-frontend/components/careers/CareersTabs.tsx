"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function CareersTabs() {
  const pathname = usePathname()
  
  const tabs = [
    { label: 'Chính sách nhân sự', href: '/chinh-sach-nhan-su' },
    { label: 'Cơ hội nghề nghiệp', href: '/tuyen-dung/co-hoi-nghe-nghiep' }
  ]

  return (
    <div className="border-b border-gray-200 bg-white sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = pathname?.includes(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative pb-4 pt-6 whitespace-nowrap transition-colors"
              >
                <span
                  className={`text-sm md:text-base font-medium transition-all ${
                    isActive
                      ? 'text-goldDark'
                      : 'text-gray-900 opacity-70 hover:opacity-100'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeCareerTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-goldDark"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
