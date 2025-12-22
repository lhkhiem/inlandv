"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { newsCategoryLabels, type NewsCategory } from '@/lib/newsData'

export default function NewsTabs({
  activeTab,
  onTabChange
}: {
  activeTab: NewsCategory
  onTabChange: (category: NewsCategory) => void
}) {
  const tabs = Object.entries(newsCategoryLabels) as [NewsCategory, string][]

  return (
    <div className="border-b border-gray-700">
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
                    ? 'text-goldDark'
                    : 'text-white opacity-70 hover:opacity-100'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-goldDark"
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
