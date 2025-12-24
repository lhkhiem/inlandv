"use client"

import { motion } from 'framer-motion'
import { newsActivityCategoryLabels, type NewsActivityCategory } from '@/lib/newsActivitiesData'

export default function NewsActivityTabs({
  activeTab,
  onTabChange
}: {
  activeTab: NewsActivityCategory
  onTabChange: (category: NewsActivityCategory) => void
}) {
  const tabs = Object.entries(newsActivityCategoryLabels) as [NewsActivityCategory, string][]

  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-8 overflow-x-auto scrollbar-hide">
        {tabs.map(([key, label]) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className="relative pb-4 whitespace-nowrap transition-colors"
            >
              <span
                className={`text-sm md:text-base font-medium transition-all ${
                  isActive
                    ? 'text-[#358b4e]'
                    : 'text-gray-900 opacity-70 hover:opacity-100'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="newsActivityActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#358b4e]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
