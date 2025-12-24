"use client"

import { Phone, DollarSign, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NewsFloatingButtons() {
  const buttons = [
    { icon: Phone, label: 'Liên hệ', href: '/lien-he' },
    { icon: DollarSign, label: 'Báo giá', href: '/lien-he?type=quote' },
    { icon: Calendar, label: 'Trải nghiệm', href: '/lien-he?type=tour' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 hidden lg:flex"
    >
      {buttons.map((btn, i) => (
        <motion.a
          key={btn.label}
          href={btn.href}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}
          whileHover={{ scale: 1.1, boxShadow: '0 10px 30px rgba(212, 167, 44, 0.3)' }}
          className="group relative w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100 hover:border-goldDark transition-all"
          title={btn.label}
        >
          <btn.icon className="w-6 h-6 text-goldDark" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {btn.label}
          </span>
        </motion.a>
      ))}
    </motion.div>
  )
}
