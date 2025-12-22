'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const milestones = [
  { year: '2009', title: 'Thành lập', description: 'Công ty được thành lập với đội ngũ 10 người' },
  { year: '2012', title: 'Mở rộng', description: 'Mở chi nhánh tại 3 tỉnh thành lớn' },
  { year: '2015', title: 'Phát triển', description: 'Đạt mốc 1000 giao dịch thành công' },
  { year: '2018', title: 'Đột phá', description: 'Trở thành Top 10 sàn BĐS uy tín nhất' },
  { year: '2021', title: 'Chuyển đổi số', description: 'Ứng dụng công nghệ vào quản lý và giao dịch' },
  { year: '2024', title: 'Hiện tại', description: 'Hơn 5000 khách hàng tin tưởng và đồng hành' },
]

export default function AboutTimelineSection() {
  const [isPortrait, setIsPortrait] = useState(false)

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

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] ${
      isPortrait ? 'min-h-screen py-8' : 'h-screen'
    }`}>
      <div className={`w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6 md:py-8 ${
        isPortrait ? 'flex flex-col justify-start' : 'max-h-[85vh] overflow-y-auto scrollbar-hide flex flex-col justify-center'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hành Trình Phát Triển
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Những cột mốc quan trọng trong lịch sử của Inland Real Estate
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex gap-6 md:gap-8 mb-8 last:mb-0"
            >
              <div className="flex-shrink-0 w-20 md:w-24 text-right">
                <div className="text-xl md:text-2xl font-bold text-goldLight">
                  {milestone.year}
                </div>
              </div>
              <div className="relative flex-grow pb-8 border-l-2 border-gray-700 pl-6 md:pl-8 last:border-0">
                <div className="absolute left-0 top-0 w-4 h-4 bg-goldLight rounded-full -translate-x-[9px]" />
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                  {milestone.title}
                </h3>
                <p className="text-gray-300 text-sm md:text-base">
                  {milestone.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
